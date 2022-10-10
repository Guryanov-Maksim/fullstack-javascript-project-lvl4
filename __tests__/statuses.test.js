import fastify from 'fastify';
import _ from 'lodash';

import init from '../server/plugin';
import { getTestData, prepareData } from './helpers';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify();
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
    await knex.migrate.latest();
    await prepareData(app);
  });

  test('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(302);

    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    expect(responseSignIn.statusCode).toBe(302);
    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const response1 = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
      cookies: cookie,
    });

    expect(response1.statusCode).toBe(200);
  });

  test('new', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    expect(responseSignIn.statusCode).toBe(302);
    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  test('create', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    expect(responseSignIn.statusCode).toBe(302);

    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const params = testData.statuses.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const status = await models.status.query().findOne({ name: testData.statuses.new.name });
    expect(status).toMatchObject(testData.statuses.new);
  });

  test('update', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const params = testData.statuses.updated;
    const status = await models.status.query().findOne({ name: testData.statuses.existing.name });

    const response = await app.inject({
      method: 'PATCH',
      url: `/statuses/${status.id}`,
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const udpatedStatus = await models.status.query().findOne({
      name: testData.statuses.updated.name,
    });
    expect(udpatedStatus).toMatchObject(testData.statuses.updated);
  });

  test('delete', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const status = await models.status.query().findOne({ name: testData.statuses.delete.name });

    const response = await app.inject({
      method: 'DELETE',
      url: `/statuses/${status.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deletedStatus = await models.status.query().findOne({
      name: testData.statuses.delete.name,
    });

    expect(deletedStatus).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
