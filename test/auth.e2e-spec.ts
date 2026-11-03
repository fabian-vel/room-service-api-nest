import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';

try {
  process.loadEnvFile();
} catch {}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sin token responde 401', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/constantes')
      .expect(401);
    expect(res.body).toMatchObject({ status: 401, code: 'HTTP_ERROR' });
  });

  it.each([
    [
      'firmado con otro secreto',
      jwt.sign({ sub: 'x' }, 'otro-secreto', { algorithm: 'HS384' }),
    ],
    [
      'con otro algoritmo',
      jwt.sign({ sub: 'x' }, process.env.JWT_SECRET!, { algorithm: 'HS256' }),
    ],
    [
      'expirado',
      jwt.sign({ sub: 'x', exp: 1 }, process.env.JWT_SECRET!, {
        algorithm: 'HS384',
      }),
    ],
  ])('token %s responde 401', async (_, token) => {
    await request(app.getHttpServer())
      .get('/api/v1/constantes')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it.each([
    ['usuario inexistente', 'no-existe', 404],
    ['contraseña incorrecta', 'cocina1', 422],
  ])(
    '/auth/empleado/login es público y rechaza %s',
    async (_, usuario, status) => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/empleado/login')
        .send({ usuario, password: 'incorrecta' })
        .expect(status);
      expect(res.body.message).toBe('Credenciales inválidas');
    },
  );

  it('/auth/login es público y responde 404 con credenciales inválidas', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ habitacion: 'no-existe', codigo: 'x' })
      .expect(404);
    expect(res.body).toMatchObject({
      code: 'NOT_FOUND',
      message: 'Habitación o código inválidos',
    });
  });
});
