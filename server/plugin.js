export default async (app, options) => {
  app.get('/', async (request, reply) => {
    return { hello: 'world' }
  })

  return app;
};
