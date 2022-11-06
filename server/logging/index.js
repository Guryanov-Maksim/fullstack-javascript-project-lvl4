import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: 'b32f018d706f4343aba3eb56c93eec59',
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export default rollbar;
