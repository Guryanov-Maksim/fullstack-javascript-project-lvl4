import Pug from 'pug';
import fastifyPointOfView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import { fileURLToPath } from 'url';
import path from 'path';

import getHelpers from './helpers/index.js';
import addRoutes from './routes/index.js';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const setUpViews = (app) => {
  const helpers = getHelpers(app);
  app.register(fastifyPointOfView, {
    engine: {
      pug: Pug,
    },
    includeViewExtension: true,
    defaultContext: {
      ...helpers,
      assetPath: (filename) => `/assets/${filename}`,
    },
    templates: path.join(__dirname, '..', 'server', 'views'),
  });

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this });
  });
};

const setUpStaticAssets = (app) => {
  const pathPublic = path.join(__dirname, '..', 'dist');
  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: '/assets/',
  });
};

const registerPlugins = async (app) => {
  await app.register(fastifyReverseRoutes);
};

export default async (app, options) => {
  await registerPlugins(app);
  setUpStaticAssets(app);
  setUpViews(app);
  addRoutes(app);

  return app;
};
