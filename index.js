import { getEmailData } from './src/index.js';

getEmailData().catch((err) => {
  console.error(err);
  process.exit(1); // Retry Job Task by exiting the process
});
