import './style.css';
import { template } from './template';
import { getNewProjects } from './queryService';
import { format } from 'date-fns';

getNewProjects().then((newProjects) => {
  document.querySelector('#app').innerHTML = `<main>${template({
    newProjects,
    week: format(Date.now(), 'wo'),
  })}</main>`;
});
