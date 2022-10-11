import { format } from 'date-fns';
import { getBeginningOfLastWeek, getDaysUntilLabel, getEndOfLastWeek, getToday } from './dateService.js';

const maxRecordCount = undefined;

const logQuery = async (queryService, url, searchParams) => {
  console.log(searchParams);

  const featureSet = await queryService(url, {
    searchParams,
  }).json();

  if (featureSet.error) {
    throw new Error(featureSet.error.message);
  }

  return featureSet;
};

export function lookupSponsor(metadata, layerName, code) {
  const sponsors = metadata.fields.filter((field) => field.name === layerName)[0].domain.codedValues;
  const sponsor = sponsors.filter((sponsor) => sponsor.code === code);

  return sponsor.length > 0 ? sponsor[0].name : 'unknown';
}

export async function getLayerMetadata(queryService, layerId) {
  const metadata = await queryService(layerId.toString()).json();

  return metadata;
}

export async function getNewProjects(client) {
  const featureSet = await logQuery(client, '0/query', {
    f: 'json',
    where: `created_date BETWEEN TIMESTAMP '${getBeginningOfLastWeek(new Date())}' AND TIMESTAMP '${getEndOfLastWeek(
      new Date()
    )}'`,
    outFields: 'ProjectID,sponsor,comment_deadline,project_abstract,title_action,county,created_date',
    orderByFields: 'created_date ASC',
    returnGeometry: false,
    resultRecordCount: maxRecordCount,
  });

  let metadata;
  if (featureSet.features.length > 0) {
    metadata = await getLayerMetadata(client, 0);
  }

  const newProjects = featureSet.features.map((feature) => {
    return {
      id: feature.attributes.ProjectID,
      title: feature.attributes.title_action,
      abstract: feature.attributes.project_abstract,
      sponsor: lookupSponsor(metadata, 'sponsor', feature.attributes.sponsor),
      commentDeadline: `${format(new Date(feature.attributes.comment_deadline), 'MM/dd/yyyy')}`,
      createdDate: `${format(new Date(feature.attributes.created_date), 'MM/dd/yyyy')}`,
      county: feature.attributes.county,
    };
  });

  return [newProjects, featureSet.features.length];
}

export async function getUpcomingProjects(client) {
  const featureSet = await logQuery(client, '0/query', {
    f: 'json',
    where: `comment_deadline>=TIMESTAMP '${getToday(new Date())}'`,
    outFields: 'ProjectID,sponsor,comment_deadline,project_abstract,title_action',
    orderByFields: 'comment_deadline ASC',
    returnGeometry: false,
    resultRecordCount: maxRecordCount,
  });

  let metadata;
  if (featureSet.features.length > 0) {
    metadata = await getLayerMetadata(client, 0);
  }

  const projectsByDate = {};

  featureSet.features.forEach((feature) => {
    const key = format(new Date(feature.attributes.comment_deadline), 'yyyy/MM/dd');
    if (!projectsByDate[key]) {
      projectsByDate[key] = [];
    }

    projectsByDate[key].push({
      id: feature.attributes.ProjectID,
      abstract: feature.attributes.project_abstract,
      title: feature.attributes.title_action,
      sponsor: lookupSponsor(metadata, 'sponsor', feature.attributes.sponsor),
      commentDeadline: format(new Date(feature.attributes.comment_deadline), 'MM/dd/yyyy'),
      date: feature.attributes.comment_deadline,
    });
  });

  const keys = Object.keys(projectsByDate).sort();

  const sortedProjectsByDate = [];
  keys.forEach((key) => {
    sortedProjectsByDate.push({
      date: format(new Date(projectsByDate[key][0].date), 'MM/dd/yyyy'),
      daysUntil: getDaysUntilLabel(key, new Date()),
      projects: projectsByDate[key],
    });
  });

  return [sortedProjectsByDate, featureSet.features.length];
}

export async function getProjectsWithComments(client) {
  const featureSet = await logQuery(client, '0/query', {
    f: 'json',
    where: `(last_edited_date BETWEEN TIMESTAMP '${getBeginningOfLastWeek(
      new Date()
    )}' AND TIMESTAMP '${getEndOfLastWeek(new Date())}') AND status='7'`,
    outFields: 'ProjectID,sponsor,title_action',
    orderByFields: 'last_edited_date DESC',
    returnGeometry: false,
    resultRecordCount: maxRecordCount,
  });

  let metadata;
  if (featureSet.features.length > 0) {
    metadata = await getLayerMetadata(client, 0);
  }

  const projectsWithComments = featureSet.features.map((feature) => {
    return {
      id: feature.attributes.ProjectID,
      title: feature.attributes.title_action,
      sponsor: lookupSponsor(metadata, 'sponsor', feature.attributes.sponsor),
    };
  });

  const title = featureSet.features.length === 1 ? 'State Comment Published' : 'State Comments Published';

  return [projectsWithComments, { title, count: featureSet.features.length }];
}
