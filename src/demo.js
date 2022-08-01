import './style.css';
import { template } from './template';
import { getNewProjects, getProjectsWithComments, getUpcomingProjects } from './queryService';
import { format } from 'date-fns';

const startup = async () => {
  const [newProjects, newProjectCount] = await getNewProjects();
  const [upcomingProjects, upcomingProjectCount] = await getUpcomingProjects();
  const [projectsWithComments, projectsWithCommentsData] = await getProjectsWithComments();

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

  console.log(data);
  document.querySelector('#app').innerHTML = `<main>${template(data)}</main>`;
};

startup();
