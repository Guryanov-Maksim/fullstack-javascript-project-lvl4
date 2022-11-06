import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: process.env.NODE_ENV,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: 'production',
  },
});

export default rollbar;
