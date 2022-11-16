import i18next from 'i18next';
import rollbar from '../logging/index.js';
import { getDefaultOptions } from '../helpers/index.js';

export default (app) => {
  app
    .get('/users/new', { name: 'newUser' }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      reply.render('users/new');
    })
    .get('/users', { name: 'users' }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .post('/users', { name: 'createUser' }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const User = app.objection.models.user;
      const user = new User();
      user.$set(request.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(request.body.data);
        await app.objection.models.user.query().insert(validUser);
        request.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (err) {
        rollbar.log(err);
        request.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: err.data }); // see TODO 1
      }

      return reply;
    })
    .get('/users/:id/edit', { name: 'editUser', ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        rollbar.log(error);
        throw Error('internet error');
      }
      const authenticatedUserid = req.user.id;
      const { id } = req.params;
      if (authenticatedUserid !== Number(id)) {
        req.flash('error', i18next.t('flash.edit.accessError'));
        reply.redirect(app.reverse('users'));
        return reply;
      }
      reply.render('users/edit', { user: req.user });
      return reply;
    })
    .patch('/users/:id', { name: 'updateUser', ...getDefaultOptions(app) }, async (req, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const User = app.objection.models.user;
      const user = new User();
      const { id } = req.params;
      user.$set({ id, ...req.body.data });

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await req.user.$query().patch(validUser); // watch this https://vincit.github.io/objection.js/guide/query-examples.html#update-queries
        req.flash('info', i18next.t('flash.edit.success'));
        reply.redirect(app.reverse('users'));
      } catch (err) {
        console.log('---------------- update user error ---------------');
        console.log(err);
        rollbar.log(err);
        req.flash('error', i18next.t('flash.edit.error'));
        reply.render('users/edit', { user, errors: err.data });
      }

      return reply;
    })
    .delete('/users/:id', { name: 'destroyUser', ...getDefaultOptions(app) }, async (req, reply, error) => {
      if (error) {
        rollbar.log(error);
        throw Error('internet error');
      }

      const authenticatedUserid = req.user.id;
      const { id } = req.params;
      if (authenticatedUserid !== Number(id)) {
        req.flash('error', i18next.t('flash.edit.accessError'));
        reply.redirect(app.reverse('users'));
        return reply;
      }
      try {
        await app.objection.models.user.query().deleteById(authenticatedUserid);
        await req.logOut();
        req.flash('info', i18next.t('flash.delete.success'));
        reply.redirect(app.reverse('users'));
      } catch (err) {
        rollbar.log(err);
        req.flash('error', i18next.t('flash.delete.error'));
        reply.redirect(app.reverse('users'));
      }

      return reply;
    });
};
