import './style.css';
import { template } from './template';
import { getNewProjects, getUpcomingProjects } from './queryService';
import { format } from 'date-fns';

const startup = async () => {
  const [newProjects, newProjectCount] = await getNewProjects();
  const [upcomingProjects, upcomingProjectCount] = await getUpcomingProjects();

  const data = {
    newProjects,
    newProjectCount,
    upcomingProjects,
    upcomingProjectCount,
    week: format(Date.now(), 'wo'),
    year: format(Date.now(), 'yyyy'),
  };

  console.log(data);
  document.querySelector('#app').innerHTML = `<main>${template(data)}</main>`;
};

startup();
