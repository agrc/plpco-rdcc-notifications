import { getNewProjects, getProjectsWithComments, getUpcomingProjects } from './queryService.js';
import { format } from 'date-fns';
import mailClient from '@sendgrid/mail';

if (!['production', 'test'].includes(process.env.NODE_ENV)) {
  await import('dotenv/config');
}

if (process.env.NODE_ENV !== 'test') {
  mailClient.setApiKey(process.env.SENDGRID_API_KEY);
}

export const getEmailData = async () => {
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

  var options = {
    from: {
      email: 'rdcc@utah.gov',
      name: 'PLPCO RDCC',
    },
    templateId: process.env.SENDGRID_TEMPLATE,
    to: process.env.EMAIL_RECIPIENT,
    dynamicTemplateData: {
      subject: `RDCC Notice for ${format(Date.now(), 'MM/dd/yyy')}`,
      ...data,
    },
  };

  try {
    await mailClient.send(options);
    console.log('completed');
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};
