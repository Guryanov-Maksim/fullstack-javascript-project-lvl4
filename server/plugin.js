/*
 TODO:
1. Find a postgressql service instead of Heroku.
    After November 28, 2022 Heroku Postgres will turn into a pumpkin
    see https://devcenter.heroku.com/articles/heroku-postgresql
*/

import Pug from 'pug';
import fastifyPointOfView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import fastifyFormbody from '@fastify/formbody';
import fastifyObjectionjs from 'fastify-objectionjs';
import fastifyMethodOverride from 'fastify-method-override';
import fastifyPassport from '@fastify/passport';
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
import FormStrategy from './lib/FormStrategy/index.js';
import rollbar from './logging/index.js';

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

const addHooks = (app) => {
  app.addHook('preHandler', async (req, reply) => {
    reply.locals = { // eslint-disable-line no-param-reassign
      isAuthenticated: () => req.isAuthenticated(),
    };
  });
};

const registerPlugins = async (app) => {
  await app.register(fastifyReverseRoutes);
  await app.register(fastifySecureSession, {
    secret: process.env.SESSION_KEY,
    cookie: {
      path: '/',
    },
  });
  await app.register(fastifyPassport.initialize());
  await app.register(fastifyPassport.secureSession());
  fastifyPassport.use(new FormStrategy('form', app));
  fastifyPassport.registerUserSerializer(async (user) => user); // maybe shoud add a promise
  fastifyPassport.registerUserDeserializer(async (user) => (
    app.objection.models.user.query().findById(user.id)
  ));
  app.decorate('fp', fastifyPassport);
  await app.register(fastifyMethodOverride);
  await app.register(fastifyFormbody, { parser: qs.parse });
  await app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  });
  await app.register(async () => rollbar.errorHandler());
};

export const options = {
  exposeHeadRoutes: false,
};

// eslint-disable-next-line no-unused-vars
export default async (app, _options) => {
  await registerPlugins(app);
  await setupLocalization();
  setUpStaticAssets(app);
  setUpViews(app);
  addRoutes(app);
  addHooks(app);

  return app;
};
