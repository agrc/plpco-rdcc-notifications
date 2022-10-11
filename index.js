import got from 'got';
import { featureService } from './src/data.js';
import { getEmailData } from './src/index.js';

const client = got.extend({
  timeout: {
    request: 25000,
  },
  prefixUrl: featureService,
  responseType: 'json',
  searchParams: {
    f: 'json',
  },
});

getEmailData(client).catch((err) => {
  console.error(err);
  process.exit(1); // Retry Job Task by exiting the process
});
