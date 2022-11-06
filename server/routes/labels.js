import i18next from 'i18next';
import rollbar from '../logging/index.js';
import { getDefaultOptions } from '../helpers/index.js';

export default (app) => {
  app
    .get('/labels', { name: 'labels', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const labels = await app.objection.models.label.query();
      reply.render('labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'newLabels', ...getDefaultOptions(app) }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      reply.render('labels/new');
    })
    .post('/labels', { name: 'createLabels', ...getDefaultOptions(app) }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const Label = app.objection.models.label;
      const label = new Label();
      label.$set(request.body.data);

      try {
        const validLabel = await app.objection.models.label.fromJson(request.body.data);
        await app.objection.models.label.query().insert(validLabel);
        request.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
      } catch (err) {
        rollbar.log(err);
        request.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label, errors: err.data });
      }

      return reply;
    })
    .get('/labels/:id/edit', { name: 'editLabels', ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        throw Error('internet error');
      }
      const { id } = req.params;
      const label = await app.objection.models.label.query().findById(id);
      reply.render('labels/edit', { label });
      return reply;
    })
    .patch('/labels/:id', { name: 'updateLabels', ...getDefaultOptions(app) }, async (req, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const Label = app.objection.models.label;
      const updatedLabel = new Label();
      updatedLabel.$set(req.body.data);
      const { id } = req.params;
      const currentLabel = await app.objection.models.label.query().findById(id);

      try {
        const validLabel = await app.objection.models.label.fromJson(req.body.data);
        await currentLabel.$query().patch(validLabel);
        req.flash('info', i18next.t('flash.labels.edit.success'));
        reply.redirect(app.reverse('labels'));
      } catch (err) {
        rollbar.log(err);
        req.flash('error', i18next.t('flash.labels.edit.error'));
        reply.render('labels/edit', { label: { ...currentLabel, ...updatedLabel }, errors: err.data });
      }

      return reply;
    })
    .delete('/labels/:id', { name: 'destroyLabels', ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        throw Error('internet error');
      }
      try {
        const { id } = req.params;
        await app.objection.models.label.query().deleteById(id);
        req.flash('info', i18next.t('flash.labels.delete.success'));
        reply.redirect(app.reverse('labels'));
      } catch (err) {
        rollbar.log(err);
        req.flash('error', i18next.t('flash.labels.delete.error'));
        reply.redirect(app.reverse('labels'));
      }

      return reply;
    });
};
