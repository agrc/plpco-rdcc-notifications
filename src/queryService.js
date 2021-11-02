import ky from 'ky';
import { subDays, format } from 'date-fns';

const featureService = 'https://maps.publiclands.utah.gov/server/rest/services/RDCC/RDCC_Project/FeatureServer';

export function lookupSponsor(metadata, layerName, code) {
  const sponsors = metadata.fields.filter((field) => field.name === layerName)[0].domain.codedValues;
  const sponsor = sponsors.filter((sponsor) => sponsor.code === code);

  return sponsor.length > 0 ? sponsor[0].name : 'unknown';
}

export async function getLayerMetadata(layerId) {
  const response = await ky.get(`${featureService}/${layerId}`, {
    searchParams: {
      f: 'json',
    },
  });

  const metadata = await response.json();

  return metadata;
}

export async function getNewProjects() {
  const response = await ky.get(`${featureService}/0/query`, {
    timeout: 10000,
    searchParams: {
      f: 'json',
      where: `created_date >= '${format(subDays(Date.now(), 7), 'MM/dd/yyyy')}'`,
      outFields: 'ProjectId,sponsor,comment_deadline,project_abstract,project_url,county,created_date',
      orderByFields: 'created_date DESC',
      returnGeometry: false,
      resultRecordCount: 5,
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

  return newProjects;
}
