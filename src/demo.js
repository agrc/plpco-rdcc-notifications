import { format } from 'date-fns';
import ky from 'ky';
import { featureService } from './data';
import { getNewProjects, getProjectsWithComments, getUpcomingProjects } from './queryService';
import './style.css';
import { template } from './template';

const client = ky.create({
  timeout: 25000,
  prefixUrl: featureService,
  searchParams: {
    f: 'json',
  },
});

const startup = async () => {
  const [newProjects, newProjectCount] = await getNewProjects(client);
  const [upcomingProjects, upcomingProjectCount] = await getUpcomingProjects(client);
  const [projectsWithComments, projectsWithCommentsData] = await getProjectsWithComments(client);

  const data = {
    newProjects,
    newProjectCount,
    upcomingProjects,
    upcomingProjectCount,
    projectsWithComments,
    projectsWithCommentsData,
    week: format(Date.now(), 'wo'),
    year: format(Date.now(), 'yyyy'),
  };

  console.log('query data', data);
  document.querySelector('#app').innerHTML = `<main>${template(data)}</main>`;
};

startup();
