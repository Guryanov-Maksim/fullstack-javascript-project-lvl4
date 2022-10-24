// TODO
// 1. translate error messages into Russian. The message in the tamplate project is in English too.
import welcome from './welcome.js';
import users from './users.js';
import session from './session.js';
import statuses from './statuses.js';
import tasks from './tasks.js';
import labels from './labels.js';

const controllers = [
  welcome,
  users,
  session,
  statuses,
  tasks,
  labels,
];

export default (app) => controllers.forEach((f) => f(app));
