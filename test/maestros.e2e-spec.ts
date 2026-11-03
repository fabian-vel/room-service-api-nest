import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { JwtService } from './../src/shared/security/jwt.service.js';

try {
  process.loadEnvFile();
} catch {}

// solo lecturas y validaciones: ninguna prueba escribe en la BD
describe('Maestros (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const api = () =>
    request.agent(app.getHttpServer()).set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    token = app
      .get(JwtService)
      .generarToken(
        { sub: 'e2e', clienteNombre: 'e2e', accesoId: 0 },
        new Date(Date.now() + 60_000),
      );
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    [
      '/api/v1/constantes',
      ['consId', 'consLlave', 'consValor', 'consDescripcion', 'consEstado'],
    ],
    [
      '/api/v1/etiquetas',
      ['etiqId', 'etiqLlaveMst', 'etiqNombre', 'etiqDescripcion', 'etiqEstado'],
    ],
    [
      '/api/v1/categorias/todas',
      [
        'mecaId',
        'mecaLlaveMst',
        'mecaNombre',
        'mecaDescripcion',
        'mecaImagenUrl',
        'mecaParentId',
        'mecaEstado',
        'subCategorias',
      ],
    ],
  ])('GET %s', async (url, campos) => {
    const res = await api().get(url).expect(200);
    expect(res.body).toMatchObject({ status: 200 });
    expect(res.body.size).toBe(res.body.data.length);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(Object.keys(res.body.data[0])).toEqual(campos);
  });

  it('GET /categorias devuelve el árbol padre/subcategorías', async () => {
    const res = await api().get('/api/v1/categorias').expect(200);
    expect(res.body.data[0].mecaParentId).toBeNull();
    expect(Array.isArray(res.body.data[0].subCategorias)).toBe(true);
  });

  it('POST /etiquetas/consulta por categoría responde 200', async () => {
    const res = await api()
      .post('/api/v1/etiquetas/consulta')
      .send({ consultaPorCategoria: true, mecaId: 1 })
      .expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('valida obligatorios con 422 BUSINESS_ERROR', async () => {
    const res = await api()
      .post('/api/v1/constantes')
      .send({ consLlave: 'X' })
      .expect(422);
    expect(res.body).toMatchObject({
      code: 'BUSINESS_ERROR',
      message: 'El valor de la constante es obligatorio',
    });
  });

  it('actualizar un id inexistente responde 422 "no encontrada"', async () => {
    const res = await api()
      .put('/api/v1/etiquetas/32000')
      .send({ etiqLlaveMst: 'X', etiqNombre: 'X' })
      .expect(422);
    expect(res.body.message).toBe('Etiqueta no encontrada');
  });

  it('id no numérico responde 400', async () => {
    await api().delete('/api/v1/categorias/abc').expect(400);
  });
});
