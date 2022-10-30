import fastify from 'fastify';

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
      url: app.reverse('labels'),
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
      url: app.reverse('labels'),
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
      url: app.reverse('newLabel'),
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

    const params = testData.labels.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const label = await models.label.query().findOne({ name: testData.labels.new.name });
    expect(label).toMatchObject(testData.labels.new);

    const paramsWithExistingLabel = testData.labels.existing;
    const response2 = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      payload: {
        data: paramsWithExistingLabel,
      },
      cookies: cookie,
    });

    expect(response2.statusCode).toBe(200);
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

    const params = testData.labels.updated;
    const label = await models.label.query().findOne({ name: testData.labels.existing.name });

    const response = await app.inject({
      method: 'PATCH',
      url: `/labels/${label.id}`,
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const udpatedLabel = await models.label.query().findOne({
      name: testData.labels.updated.name,
    });
    expect(udpatedLabel).toMatchObject(testData.labels.updated);
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

    const label = await models.label.query().findOne({ name: testData.labels.delete.name });

    const response = await app.inject({
      method: 'DELETE',
      url: `/labels/${label.id}`,
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deletedLabel = await models.label.query().findOne({
      name: testData.labels.delete.name,
    });

    expect(deletedLabel).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
