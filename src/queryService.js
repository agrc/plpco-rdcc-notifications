import ky from 'ky';
import { differenceInCalendarDays, format, subDays } from 'date-fns';

const maxRecordCount = 10;
const featureService = 'https://maps.publiclands.utah.gov/server/rest/services/RDCC/RDCC_Project/FeatureServer';
const queryService = ky.create({
  timeout: 25000,
  prefixUrl: featureService,
  searchParams: {
    f: 'json',
  },
});

export function lookupSponsor(metadata, layerName, code) {
  const sponsors = metadata.fields.filter((field) => field.name === layerName)[0].domain.codedValues;
  const sponsor = sponsors.filter((sponsor) => sponsor.code === code);

  return sponsor.length > 0 ? sponsor[0].name : 'unknown';
}

export function getDaysUntilLabel(dateString) {
  const days = differenceInCalendarDays(new Date(dateString), Date.now());

  switch (days) {
    case 0:
      return 'today';
    case 1:
      return 'tomorrow';
    default:
      return `in ${days} days`;
  }
}

export async function getLayerMetadata(layerId) {
  const response = await queryService(layerId.toString());
  const metadata = await response.json();

  return metadata;
}

export async function getNewProjects() {
  const response = await queryService('0/query', {
    searchParams: {
      f: 'json',
      where: `created_date BETWEEN '${format(subDays(Date.now(), 7), 'MM/dd/yyyy')}' AND '${format(
        Date.now(),
        'MM/dd/yyy'
      )}'`,
      outFields: 'ProjectId,sponsor,comment_deadline,project_abstract,project_url,county,created_date',
      orderByFields: 'created_date DESC',
      returnGeometry: false,
      resultRecordCount: maxRecordCount,
    },
  });

  const featureSet = await response.json();

  if (featureSet.error) {
    throw new Error(featureSet.error.message);
  }

  let metadata;
  if (featureSet.features.length > 0) {
    metadata = await getLayerMetadata(0);
  }

  const newProjects = featureSet.features.map((feature) => {
    return {
      id: feature.attributes.ProjectID,
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
  const response = await queryService('0/query', {
    searchParams: {
      f: 'json',
      where: `comment_deadline >= '${format(Date.now(), 'MM/dd/yyy')}'`,
      outFields: 'ProjectId,sponsor,comment_deadline,project_abstract,title_action',
      orderByFields: 'comment_deadline ASC',
      returnGeometry: false,
      resultRecordCount: maxRecordCount,
    },
  });

  const featureSet = await response.json();

  if (featureSet.error) {
    throw new Error(featureSet.error.message);
  }

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
      daysUntil: getDaysUntilLabel(key),
      projects: projectsByDate[key],
    });
  });

  return [sortedProjectsByDate, featureSet.features.length];
}

export async function getProjectsWithComments() {
  const response = await queryService('0/query', {
    searchParams: {
      f: 'json',
      where: `last_edited_date BETWEEN '${format(subDays(Date.now(), 7), 'MM/dd/yyyy')}' AND '${format(
        Date.now(),
        'MM/dd/yyy'
      )}' AND status = 7`,
      outFields: 'ProjectId,sponsor,title_action',
      orderByFields: 'last_edited_date DESC',
      returnGeometry: false,
      resultRecordCount: maxRecordCount,
    },
  });

  const featureSet = await response.json();

  if (featureSet.error) {
    throw new Error(featureSet.error.message);
  }

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
