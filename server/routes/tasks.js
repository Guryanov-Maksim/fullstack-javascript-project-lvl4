import i18next from 'i18next';
import _ from 'lodash';

const getDefaultOptions = (app) => ({
  exposeHeadRoute: false,
  preValidation: app.fp.authenticate(
    'form',
    {
      failureRedirect: app.reverse('root'),
      failureFlash: i18next.t('flash.authError'),
    },
  ),
});

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const tasks = await app.objection.models.task.query().withGraphFetched('status');
      // const tasks = await app.objection.models.task.query().withGraphJoined('status');
      // const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      console.log('000000000000   tasks   00000000000000000');
      console.log(tasks);
      reply.render('tasks/index', { tasks, users });

      return reply;
    })
    .get('/tasks/new', { name: 'newTask', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      reply.render('tasks/new', { statuses, users });

      return reply;
    })
    .post('/tasks', { exposeHeadRoute: false, ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const Task = app.objection.models.task;
      const task = new Task();
      task.$set(request.body.data);

      try {
        const taskToSave = {
          ...request.body.data,
          statusId: Number(request.body.data.statusId),
          creatorId: request.user.id,
          executorId: Number(request.body.data.executorId),
        };
        const validTask = await app.objection.models.task.fromJson(taskToSave);
        await app.objection.models.task.query().insert(validTask);
        request.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (err) {
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        request.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', { task, errors: err.data, statuses, users });
      }

      return reply;
    });
};
