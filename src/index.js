import { getNewProjects, getProjectsWithComments, getUpcomingProjects } from './queryService.js';
import { format } from 'date-fns';
import mailClient from '@sendgrid/mail';

if (!['production', 'test'].includes(process.env.NODE_ENV)) {
  await import('dotenv/config');
}

if (process.env.NODE_ENV !== 'test') {
  const fs = await import('fs');
  let apiKey = undefined;
  try {
    apiKey = fs.readFileSync('/secrets/email/key', 'utf8');
    console.log('found in root');
  } catch {
    console.warn('secret not found at root. Checking local');
  }

  try {
    apiKey = fs.readFileSync('secrets/email/key', 'utf8');
  } catch {
    console.warn('secret not found locally. Is it mounted?');
  }

  if (!apiKey) {
    throw new Error('No SendGrid API key found');
  }

  mailClient.setApiKey(apiKey.replace(/\r?\n|\r|\s/gm, ''));
}

export const getEmailData = async (client) => {
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

  await mailClient.send(options);
  console.log('completed');
};
