/*
 TODO:
1. Find a postgressql service instead of Heroku. 
    After November 28, 2022 Heroku Postgres will turn into a pumpkin
    see https://devcenter.heroku.com/articles/heroku-postgresql


*/
import Pug from 'pug';
import fastifyPointOfView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import fastifyFlash from '@fastify/flash';
import fastifyFormbody from '@fastify/formbody';
import fastifyObjectionjs from 'fastify-objectionjs';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import fastifySecureSession from '@fastify/secure-session';
import { fileURLToPath } from 'url';
import path from 'path';
import i18next from 'i18next';
import qs from 'qs';
import 'dotenv/config';

import getHelpers from './helpers/index.js';
import addRoutes from './routes/index.js';
import ru from './locales/ru.js';
import models from './models/index.js';
import * as knexConfig from '../knexfile.js';

const __dirname = fileURLToPath(path.dirname(import.meta.url));

const mode = process.env.NODE_ENV || 'development';

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

const setupLocalization = async () => {
  await i18next
    .init({
      lng: 'ru',
      fallbackLng: 'en',
      resources: {
        ru,
      },
    });
};

const registerPlugins = async (app) => {
  await app.register(fastifyReverseRoutes);
  app.register(fastifySecureSession, {
    secret: process.env.SESSION_KEY,
    cookie: {
      path: '/',
    },
  });
  app.register(fastifyFlash);
  app.register(fastifyFormbody, { parser: qs.parse });
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  })

};

export default async (app, options) => {
  await registerPlugins(app);
  await setupLocalization();
  setUpStaticAssets(app);
  setUpViews(app);
  addRoutes(app);

  return app;
};
