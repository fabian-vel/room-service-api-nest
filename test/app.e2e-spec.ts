import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';

try {
  process.loadEnvFile();
} catch {}

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init(); // conecta a la BD; falla si no responde
  });

  it('responde errores con el mismo formato del API Java', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/no-existe')
      .expect(404);
    expect(res.body).toMatchObject({
      status: 404,
      code: 'HTTP_ERROR',
      path: '/api/v1/no-existe',
    });
    expect(res.body.correlationId).toBeTypeOf('string');
  });

  afterAll(async () => {
    await app.close();
  });
});
