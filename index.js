import ky from 'ky';
import { featureService } from './src/data.js';
import { getEmailData } from './src/index.js';

const client = ky.extend({
  timeout: 25000,
  prefixUrl: featureService,
  searchParams: {
    f: 'json',
  },
});

getEmailData(client).catch((err) => {
  console.error(err);
  process.exit(1); // Retry Job Task by exiting the process
});
