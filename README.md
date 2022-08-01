# plpco-rdcc-notifications

[![firebase deploy](https://github.com/agrc/plpco-rdcc-notifications/actions/workflows/nodejs.yml/badge.svg)](https://github.com/agrc/plpco-rdcc-notifications/actions/workflows/nodejs.yml)

The PLPCO RDCC email is a notification system to supplement an esri data collection system consisting of survey123 etc. This notification system uses the Google Cloud to schedule a Monday morning email. A Cloud Run Job is triggered by Cloud Scheduler which queries a PLPCO ArcGIS Server Feature Service to get the last weeks worth of updates. This data is then used and input data to a SendGrid email template and sent out to the PLPCO RDCC mailing list.

A demo firebase website is created when changes are pushed to the dev branch and can be viewed in [https://ut-dts-agrc-plpco-rdcc-dev.web.app](firebase). SendGrid and the demo site both use handlebars as their templating engine which makes this possible.

A SendGrid API key and template id are necessary for this system to run successfully. The terraform for this project resides in the terraform mono repo. The SendGrid API key, during development, resides in `src/secrets/email/key`. In production Secret Manager will mount this secret into the Cloud Run Job. The other configuration can be set using the `.env.template` file.
