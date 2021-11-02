import Handlebars from 'handlebars';

export const template = Handlebars.compile(`
  <h1>{{week}} RDCC Notice</h1>
  <div>
    Here is the RDCC notice for the {{week}} week. This notice includes the following sections:
    <ul>
      <li><strong><a href="#new-projects">New Projects</a></strong>: Projects approved by PLPCO last week
      <li><strong><a href="#upcoming-projects">Upcoming Dates</a></strong>: Projects with comment deadlines next week
      <li><strong><a href="#comments-published">State Comment(s) Published</a></strong>: Projects in which state comments were published last week.
    </ul>

    For questions please email us at <a href="mailto:rdcc@utah.gov">rdcc@utah.gov</a>.
  </div>

  <h2 id="new-projects">New Projects</h2>

  <section style="padding-left: 1rem; padding-bottom: 2rem;">
    {{#each newProjects}}
    <div style="padding-bottom: 2rem;">
    <div><strong>Project #{{id}}</strong>: {{abstract}}</div>
    <div><strong>Sponsor:</strong> {{sponsor}}</div>
    <div><strong>Created On</strong>: {{createdDate}}</div>
    <div><strong>Comment Deadline</strong>: {{commentDeadline}}</div>
    <div><strong>Counties</strong>: {{county}}</div>
    </div>
    {{/each}}
  </section>

  <h2 id="upcoming-projects">Upcoming Dates</h2>

  <h2 id="comments-published">State Comment(s) Published</h2>

  <section style="padding-left: 1rem; padding-bottom: 2rem;">
    {{#each newProjects}}
    <div style="padding-bottom: 2rem;">
    <div><strong>Project #{{id}}</strong>: {{abstract}}</div>
    <div><strong>Sponsor:</strong> {{sponsor}}</div>
    <div>Download State Comment(s) From This Page:</div>
    </div>
    {{/each}}
  </section>
`);
