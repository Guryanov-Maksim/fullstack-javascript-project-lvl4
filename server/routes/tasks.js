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
          executorId: Number(request.body.data.executorId) || null,
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
    })
    .get('/tasks/:id/edit', { exposeHeadRoute: false, ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        throw Error('internet error');
      }
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id);
      const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      reply.render('tasks/edit', { task, statuses, users });

      return reply;
    })
    .patch('/tasks/:id', { exposeHeadRoute: false, ...getDefaultOptions(app) }, async (req, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const Task = app.objection.models.task;
      const updatedTask = new Task();
      updatedTask.$set(req.body.data);

      const { id } = req.params;
      const currentTask = await app.objection.models.task.query().findById(id);

      try {
        const taskToSave = {
          ...req.body.data,
          statusId: Number(req.body.data.statusId),
          creatorId: req.user.id,
          executorId: Number(req.body.data.executorId) || null,
        };
        const validTask = await app.objection.models.task.fromJson(taskToSave);
        await currentTask.$query().patch(validTask);

        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.edit.error'));
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        reply.render('tasks/edit', {
          task: { ...currentTask, ...updatedTask },
          errors: err.data,
          statuses,
          users,
        });
      }

      return reply;
    })
    .delete('/tasks/:id', { exposeHeadRoute: false, ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        throw Error('internet error');
      }
      const authenticatedUserId = req.user.id;
      const { id } = req.params;
      const { creator } = await app.objection.models.task.query().findById(id).withGraphFetched('creator');
      if (authenticatedUserId !== creator.id) {
        req.flash('error', i18next.t('flash.tasks.delete.accessError'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
      try {
        await app.objection.models.task.query().deleteById(id);
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
      }

      return reply;
    });
};
