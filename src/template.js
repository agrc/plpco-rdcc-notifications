import Handlebars from 'handlebars';

export const template = Handlebars.compile(`
  <div>
    <p>This is the RDCC notice for the {{week}} week of {{year}}. This notice includes the following sections:</p>
    <ul>
      <li><strong><a href="#new-projects">New Projects</a></strong>: Projects submitted to the RDCC
      <li><strong><a href="#upcoming-projects">Upcoming Dates</a></strong>: Projects with comment deadlines next week
      <li><strong><a href="#project-comments">State Comments Published</a></strong>: Projects in which state comments were published last week.
    </ul>
    <p>For more project information, search for a specific project number at https://rdcc.utah.gov. For questions, please email us at <a href="mailto:rdcc@utah.gov?subject={{week}} RDCC notice">rdcc@utah.gov</a>.</p>
  </div>

  <h2 id="new-projects">{{newProjectCount}} New Projects</h2>

  <div style="padding-left: 1rem; padding-bottom: 2rem;">
    {{#each newProjects}}
      <div style="padding-bottom: 2rem;">
        <div><strong>Project #{{id}}</strong>: {{title}}</div>
        <div><strong>Abstract</strong>: {{abstract}}</div>
        <div><strong>Sponsor</strong>: {{sponsor}}</div>
        {{#if county}}
        <div><strong>Counties</strong>: {{county}}</div>
        {{/if}}
        <div><strong>Created</strong>: {{createdDate}}</div>
        <div><strong>Comment deadline</strong>: {{commentDeadline}}</div>
      </div>
    {{else}}
       <div>Nothing to report for this week</div>
    {{/each}}
  </div>

  <h2 id="upcoming-projects">{{upcomingProjectCount}} Upcoming Dates</h2>

  <div style="padding-left: 1rem; padding-bottom: 2rem;">
   {{#each upcomingProjects}}
      <h3>{{date}} - The comment deadline is {{daysUntil}}</h3>
      {{#each projects}}
        <div style="padding-left: 2rem; padding-bottom: 2rem;">
          <div><strong>Project #{{id}}</strong>: {{title}}</div>
          <div><strong>Abstract</strong>: {{abstract}}</div>
          <div><strong>Sponsor</strong>: {{sponsor}}</div>
        </div>
      {{/each}}
    {{else}}
       <div>Nothing to report for this week</div>
    {{/each}}
  </div>

  <h2 id="project-comments">{{projectsWithCommentsData.count}} {{projectsWithCommentsData.title}}</h2>

  <div style="padding-left: 1rem; padding-bottom: 2rem;">
    {{#each projectsWithComments}}
      <div style="padding-bottom: 2rem;">
        <div><strong>Project #{{id}}</strong>: {{title}}</div>
        <div><strong>Sponsor</strong>: {{sponsor}}</div>
      </div>
    {{else}}
      <div>Nothing to report for this week</div>
    {{/each}}
  </div>
`);
