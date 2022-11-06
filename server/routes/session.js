import i18next from 'i18next';
import rollbar from '../logging/index.js';

export default (app) => {
  app
    .get('/session/new', { name: 'newSession', exposeHeadRoute: false }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      const signInForm = {};
      reply.render('session/new', { signInForm });
    })
    .post('/session', { name: 'session', exposeHeadRoute: false }, app.fp.authenticate( // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      'form',
      async (request, reply, error, user) => {
        if (error) {
          rollbar.log(error);
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
    ))
    .delete('/session', { exposeHeadRoute: false }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
      request.logOut();
      request.flash('info', i18next.t('flash.session.delete.success'));
      reply.redirect(app.reverse('root'));
      return reply;
    });
};
