// TODO
// 1. translate error messages into Russian. The message in the tamplate project is in English too.
import i18next from 'i18next';

export default (app) => {
  app.get('/', { name: 'root', exposeHeadRoute: false }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
    reply.render('layouts/application');
  });
  app.get('/session/new', { name: 'newSession', exposeHeadRoute: false }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
    const signInForm = {};
    reply.render('session/new', { signInForm });
  });
  app.get('/users/new', { name: 'newUser', exposeHeadRoute: false }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
    reply.render('users/new');
  });
  app.get('/users', { name: 'users', exposeHeadRoute: false }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
    const users = await app.objection.models.user.query();
    reply.render('users/index', { users });
    return reply;
  });
  app.post('/users', { exposeHeadRoute: false }, async (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
    const user = new app.objection.models.user();
    user.$set(request.body.data);

    try {
      const validUser = await app.objection.models.user.fromJson(request.body.data);
      const res = await app.objection.models.user.query().insert(validUser);
      request.flash('info', i18next.t('flash.users.create.success'));
      reply.redirect(app.reverse('root'));
    } catch(err) {
      console.log(err);
      request.flash('error', i18next.t('flash.users.create.error'));
      reply.render('users/new', { user, errors: err.data }); // see TODO 1
    }

    return reply;
  });

  app.post('/session', { name: 'session', exposeHeadRoute: false }, app.fp.authenticate( // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
    'form',
    async (request, reply, error, user) => {
      if (error) {
        throw Error('internet error');
      }
      if (!user) {
        const signInForm = request.body.data;
        const errors = {
          email: [{ message: i18next.t('flash.session.create.error') }],
        };
        reply.render('session/new', { signInForm, errors });
        return reply;
      }
      await request.logIn(user);
      request.flash('info', i18next.t('flash.session.create.success'));
      reply.redirect(app.reverse('root'));
      return reply;
    },
  ));

  app.delete('/session', { exposeHeadRoute: false }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
    request.logOut();
    request.flash('info', i18next.t('flash.session.delete.success'));
    reply.redirect(app.reverse('root'));
    return reply;
  });
  app.get(
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
  );
  app.patch('/users/:id', { exposeHeadRoute: false }, async (req, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
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
  });
  app.delete(
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
