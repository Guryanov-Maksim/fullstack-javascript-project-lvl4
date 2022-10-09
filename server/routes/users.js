import i18next from 'i18next';

export default (app) => {
  app
    .get('/users/new', { name: 'newUser', exposeHeadRoute: false }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      reply.render('users/new');
    })
    .get('/users', { name: 'users', exposeHeadRoute: false }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .post('/users', { exposeHeadRoute: false }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const User = app.objection.models.user;
      const user = new User();
      user.$set(request.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(request.body.data);
        await app.objection.models.user.query().insert(validUser);
        request.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (err) {
        request.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: err.data }); // see TODO 1
      }

      return reply;
    })
    .get(
      '/users/:id/edit',
      {
        exposeHeadRoute: false,
        preValidation: app.fp.authenticate(
          'form',
          {
            failureRedirect: app.reverse('root'),
            failureFlash: i18next.t('flash.authError'),
          },
        ),
      },
      async (req, reply, error) => {
        if (error) {
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
      },
    )
    .patch('/users/:id', { exposeHeadRoute: false }, async (req, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const User = app.objection.models.user;
      const user = new User();
      user.$set(req.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await req.user.$query().patch(validUser); // watch this https://vincit.github.io/objection.js/guide/query-examples.html#update-queries
        req.flash('info', i18next.t('flash.edit.success'));
        reply.redirect(app.reverse('users'));
      } catch (err) {
        req.flash('error', i18next.t('flash.edit.error'));
        reply.render('users/edit', { user, errors: err.data });
      }

      return reply;
    })
    .delete(
      '/users/:id',
      {
        exposeHeadRoute: false,
        preValidation: app.fp.authenticate(
          'form',
          {
            failureRedirect: app.reverse('root'),
            failureFlash: i18next.t('flash.authError'),
          },
        ),
      },
      async (req, reply, error) => {
        if (error) {
          throw Error('internet error');
        }

        const authenticatedUserid = req.user.id;
        const { id } = req.params;
        if (authenticatedUserid !== Number(id)) {
          req.flash('error', i18next.t('flash.edit.accessError'));
          reply.redirect(app.reverse('users'));
          return reply;
        }

        req.logOut();
        await app.objection.models.user.query().deleteById(authenticatedUserid);
        req.flash('info', i18next.t('flash.delete.success'));
        reply.redirect(app.reverse('users'));
        return reply;
      },
    );
};
