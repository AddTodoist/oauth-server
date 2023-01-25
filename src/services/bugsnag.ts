import Bugsnag from '@bugsnag/js';

Bugsnag.start( {
  apiKey: process.env.BUGSNAG_API_KEY,
  appVersion: 'oauth-service',
});

export default Bugsnag;
