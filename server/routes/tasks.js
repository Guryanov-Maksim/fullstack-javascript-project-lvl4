import i18next from 'i18next';
import _ from 'lodash';

import rollbar from '../logging/index.js';
import { getDefaultOptions } from '../helpers/index.js';

const getLabelIds = (data) => {
  const rawLabelIds = _.get(data, 'labels', []);
  if (Array.isArray(rawLabelIds)) {
    return rawLabelIds.map((id) => Number(id));
  }
  return [Number(rawLabelIds)];
};

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      const statuses = await app.objection.models.status.query();

      const statusId = _.get(request.query, 'status', null);
      const executorId = _.get(request.query, 'executor', null);
      const labelId = _.get(request.query, 'label', null);
      const isCreatorUser = _.has(request.query, 'isCreatorUser');

      const tasks = await app.objection.models.task
        .query()
        .withGraphJoined('[status, labels]')
        .modify((queryBuilder) => {
          if (statusId) {
            queryBuilder.where('tasks.status_id', statusId);
          }
          if (executorId) {
            queryBuilder.where('tasks.executor_id', executorId);
          }
          if (labelId) {
            queryBuilder
              .where('labels.id', labelId);
          }
          if (isCreatorUser) {
            queryBuilder.where('tasks.creator_id', request.user.id);
          }
        });

      const filter = {
        status: statusId,
        executor: executorId,
        label: labelId,
        isCreatorUser,
      };

      reply.render(
        'tasks/index',
        {
          filter,
          tasks,
          users,
          labels,
          statuses,
        },
      );

      return reply;
    })
    .get('/tasks/new', { name: 'newTask', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/new', { statuses, users, labels });

      return reply;
    })
    .get('/tasks/:id', { name: 'showTask', ...getDefaultOptions(app) }, async (req, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const { id } = req.params;
      const task = await app.objection.models.task
        .query()
        .findById(id)
        .withGraphFetched('[status, labels, executor, creator]');

      reply.render('tasks/show', { task });

      return reply;
    })
    .post('/tasks', { name: 'createTask', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const Task = app.objection.models.task;
      const task = new Task();
      task.$set(request.body.data);

      const labelIds = getLabelIds(request.body.data);

      try {
        const taskToSave = {
          ..._.omit(request.body.data, 'labels'),
          statusId: Number(request.body.data.statusId),
          creatorId: request.user.id,
          executorId: Number(request.body.data.executorId) || null,
        };
        const validTask = await app.objection.models.task.fromJson(taskToSave);

        await app.objection.models.task.transaction(async (trx) => {
          const savedTask = await app.objection.models.task.query(trx).insert(validTask);

          const promises = labelIds
            .map((labelId) => {
              const validTaskLabel = { taskId: savedTask.id, labelId };
              return app.objection.models.taskWithLabels.query(trx).insert(validTaskLabel);
            });

          await Promise.all(promises);
        });

        request.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (err) {
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        const labels = await app.objection.models.label.query();

        const selectedLabels = labelIds
          .map((labelId) => (
            labels.find((label) => labelId === label.id)
          ));
        task.$set({ ...request.body.data, labels: selectedLabels });

        rollbar.log(err);

        request.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task,
          errors: err.data,
          statuses,
          users,
          labels,
        });
      }

      return reply;
    })
    .get('/tasks/:id/edit', { name: 'editTask', ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        throw Error('internet error');
      }
      const { id } = req.params;
      const task = await app.objection.models.task.query().findById(id).withGraphFetched('[status, labels]');
      const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();

      reply.render('tasks/edit', {
        task,
        statuses,
        users,
        labels,
      });

      return reply;
    })
    .patch('/tasks/:id', { name: 'updateTask', ...getDefaultOptions(app) }, async (req, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const Task = app.objection.models.task;
      const updatedTask = new Task();
      updatedTask.$set(req.body.data);
      const updatedLabelIds = getLabelIds(req.body.data);

      const { id } = req.params;
      const currentTask = await app.objection.models.task.query().findById(id).withGraphFetched('labels');
      const currentLabelIds = currentTask.labels.map((label) => label.id);
      const allLabelIds = new Set([...updatedLabelIds, ...currentLabelIds]);

      try {
        const taskToSave = {
          ..._.omit(req.body.data, 'labels'),
          statusId: Number(req.body.data.statusId),
          creatorId: req.user.id,
          executorId: Number(req.body.data.executorId) || null,
        };
        const validTask = await app.objection.models.task.fromJson(taskToSave);

        await app.objection.models.task.transaction(async (trx) => {
          await currentTask.$query(trx).patch(validTask);
          const promises = [...allLabelIds]
            .map((labelId) => {
              if (currentLabelIds.includes(labelId) && updatedLabelIds.includes(labelId)) {
                return Promise.resolve();
              }
              if (currentLabelIds.includes(labelId)) {
                return app.objection.models.taskWithLabels
                  .query(trx)
                  .delete()
                  .where({
                    taskId: currentTask.id,
                    labelId,
                  });
              }
              return app.objection.models.taskWithLabels
                .query(trx)
                .insert({
                  taskId: currentTask.id,
                  labelId,
                });
            });

          await Promise.all(promises);
        });

        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (err) {
        rollbar.log(err);
        req.flash('error', i18next.t('flash.tasks.edit.error'));

        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        const labels = await app.objection.models.label.query();

        const selectedLabels = updatedLabelIds.map((labelId) => (
          labels.find((label) => labelId === label.id)
        ));

        updatedTask.$set({ ...req.body.data, labels: selectedLabels });
        reply.render('tasks/edit', {
          task: { ...currentTask, ...updatedTask },
          errors: err.data,
          statuses,
          users,
          labels,
        });
      }

      return reply;
    })
    .delete('/tasks/:id', { name: 'destroyTask', ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        rollbar.log(error);
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
        const currentTask = await app.objection.models.task.query().findById(id).withGraphFetched('labels');
        await app.objection.models.task.transaction(async (trx) => {
          await currentTask.$query(trx).deleteById(id);

          const promises = currentTask.labels
            .map((label) => (
              app.objection.models.taskWithLabels
                .query(trx)
                .delete()
                .where({
                  taskId: currentTask.id,
                  labelId: label.id,
                })
            ));

          await Promise.all(promises);
        });

        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (err) {
        rollbar.log(err);
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
      }

      return reply;
    });
};
