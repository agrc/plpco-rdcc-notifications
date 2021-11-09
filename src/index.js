import { getNewProjects, getProjectsWithComments, getUpcomingProjects } from './queryService.js';
import { format } from 'date-fns';

async function getEmailData() {
  console.log('request accepted');

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

  console.log('sending email', data);

  console.log('completed');
}

export default getEmailData;
