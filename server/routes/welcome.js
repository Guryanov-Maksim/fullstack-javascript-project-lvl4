export default (app) => {
  app.get('/', { name: 'root', exposeHeadRoute: false }, (request, reply) => { // without exposeHeadRoute: false "Route with name root already registered" error will be thown by fastifyReverseRoutes plugin because of the HEAD request
    reply.render('layouts/application');
  });
};
