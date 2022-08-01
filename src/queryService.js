import ky from 'ky-universal';
import { format } from 'date-fns';
import { getBeginningOfLastWeek, getDaysUntilLabel, getEndOfLastWeek, getToday } from './dateService.js';

const maxRecordCount = undefined;
const featureService =
  'https://maps.publiclands.utah.gov/server/rest/services/RDCC/RDCC_Project_Public_View/FeatureServer';
const queryService = ky.create({
  timeout: 25000,
  prefixUrl: featureService,
  searchParams: {
    f: 'json',
  },
});

const logQuery = async (url, searchParams) => {
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

export async function getLayerMetadata(layerId) {
  const metadata = await queryService(layerId.toString()).json();

  return metadata;
}

export async function getNewProjects() {
  const featureSet = await logQuery('0/query', {
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
    metadata = await getLayerMetadata(0);
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

export async function getUpcomingProjects() {
  const featureSet = await logQuery('0/query', {
    f: 'json',
    where: `comment_deadline>=TIMESTAMP '${getToday(new Date())}'`,
    outFields: 'ProjectID,sponsor,comment_deadline,project_abstract,title_action',
    orderByFields: 'comment_deadline ASC',
    returnGeometry: false,
    resultRecordCount: maxRecordCount,
  });

  let metadata;
  if (featureSet.features.length > 0) {
    metadata = await getLayerMetadata(0);
  }

  const projectsByDate = {};

  featureSet.features.forEach((feature) => {
    const date = format(new Date(feature.attributes.comment_deadline), 'MM/dd/yyyy');
    if (!projectsByDate[date]) {
      projectsByDate[date] = [];
    }

    projectsByDate[date].push({
      id: feature.attributes.ProjectID,
      abstract: feature.attributes.project_abstract,
      title: feature.attributes.title_action,
      sponsor: lookupSponsor(metadata, 'sponsor', feature.attributes.sponsor),
      commentDeadline: date,
    });
  });

  const keys = Object.keys(projectsByDate).sort();

  const sortedProjectsByDate = [];
  keys.forEach((key) => {
    sortedProjectsByDate.push({
      date: key,
      daysUntil: getDaysUntilLabel(key, new Date()),
      projects: projectsByDate[key],
    });
  });

  return [sortedProjectsByDate, featureSet.features.length];
}

export async function getProjectsWithComments() {
  const featureSet = await logQuery('0/query', {
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
    metadata = await getLayerMetadata(0);
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
