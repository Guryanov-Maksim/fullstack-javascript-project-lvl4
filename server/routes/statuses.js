import i18next from 'i18next';
import rollbar from '../logging/index.js';
import { getDefaultOptions } from '../helpers/index.js';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const statuses = await app.objection.models.status.query();
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus', ...getDefaultOptions(app) }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      reply.render('statuses/new');
    })
    .post('/statuses', { name: 'createStatus', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const Status = app.objection.models.status;
      const status = new Status();
      status.$set(request.body.data);

      try {
        const validStatus = await app.objection.models.status.fromJson(request.body.data);
        await app.objection.models.status.query().insert(validStatus);
        request.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (err) {
        rollbar.log(err);
        request.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status, errors: err.data });
      }

      return reply;
    })
    .get('/statuses/:id/edit', { name: 'editStatus', ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        rollbar.log(error);
        throw Error('internet error');
      }
      const { id } = req.params;
      const status = await app.objection.models.status.query().findById(id);
      reply.render('statuses/edit', { status });
      return reply;
    })
    .patch('/statuses/:id', { name: 'updateStatus', ...getDefaultOptions(app) }, async (req, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const Status = app.objection.models.status;
      const updatedStatus = new Status();
      updatedStatus.$set(req.body.data);
      const { id } = req.params;
      const currentStatus = await app.objection.models.status.query().findById(id);

      try {
        const validStatus = await app.objection.models.status.fromJson(req.body.data);
        await currentStatus.$query().patch(validStatus);
        req.flash('info', i18next.t('flash.statuses.edit.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (err) {
        rollbar.log(err);
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.render('statuses/edit', { status: { ...currentStatus, ...updatedStatus }, errors: err.data });
      }

      return reply;
    })
    .delete('/statuses/:id', { name: 'destroyStatus', ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        throw Error('internet error');
      }
      try {
        const { id } = req.params;
        await app.objection.models.status.query().deleteById(id);
        req.flash('info', i18next.t('flash.statuses.delete.success'));
        reply.redirect(app.reverse('statuses'));
      } catch (err) {
        rollbar.log(err);
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        reply.redirect(app.reverse('statuses'));
      }

      return reply;
    });
};
