import fastify from 'fastify';
import init from '../server/plugin';

describe('requests', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    await init(app);
  });

  test('GET 200', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('root'),
    });
    expect(res.statusCode).toBe(200);
  });

  test('GET 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/wrong-path',
    });
    expect(res.statusCode).toBe(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
