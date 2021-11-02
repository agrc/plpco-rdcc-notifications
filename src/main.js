import "./style.css";
import Handlebars from "handlebars";
import ky from "ky";
import { subDays, format } from "date-fns";

const template = Handlebars.compile(`
  <div>------------</div>
  <div>New Projects</div>
  <div>------------</div>

{{#each newProjects}}
<div>Project #{{id}} - {{abstract}}</div>
<div>Sponsor: {{sponsor}}</div>
<div>Comment Deadline: {{commentDeadline}}</div>
<div>Counties: {{county}}</div>
{{/each}}

<div>--------------</div>
<div>Upcoming Dates</div>
<div>--------------</div>

<div>---------------------------------------</div>
<div>State Comment(s) Published</div>
<div>---------------------------------------</div>

​​<div>Project #{project.id} - {project.abstract}</div>
<div>Sponsor: {project.sponsor}</div>
<div>Download State Comment(s) From This Page:</div>
`);

const featureService =
  "https://maps.publiclands.utah.gov/server/rest/services/RDCC/RDCC_Project/FeatureServer/0";

let response = await ky.get(featureService, {
  searchParams: {
    f: "json",
  },
});
const metadata = await response.json();
console.log(metadata);

response = await ky.get(featureService + "/query", {
  timeout: 10000,
  searchParams: {
    f: "json",
    where: `created_date > '${format(subDays(Date.now(), 7), "MM/dd/yyyy")}'`,
    outFields:
      "ProjectId,sponsor,comment_deadline,project_abstract,project_url,county",
    returnGeometry: false,
    resultRecordCount: 5,
  },
});

const newProjectFeatures = await response.json();
const lookupSponsor = (id) => {
  const sponsors = metadata.fields.filter(
    (field) => field.name === "sponsor"
  )[0].domain.codedValues;
  const sponsor = sponsors.filter((sponsor) => sponsor.code === id);

  return sponsor.length > 0 ? sponsor[0].name : "unknown";
};

const newProjects = newProjectFeatures.features.map((feature) => {
  return {
    id: feature.attributes.ProjectID,
    abstract: feature.attributes.project_abstract,
    sponsor: lookupSponsor(feature.attributes.sponsor),
    commentDeadline: `${format(
      new Date(feature.attributes.comment_deadline),
      "MM/dd/yyyy"
    )}`,
    county: feature.attributes.county,
  };
});

console.log(newProjects);

document.querySelector("#app").innerHTML = `<main>${template({
  newProjects,
})}</main>`;
