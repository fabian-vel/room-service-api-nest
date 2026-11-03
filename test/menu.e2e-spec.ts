import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import type { Pool } from 'pg';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { PG_POOL } from './../src/shared/database/database.module.js';
import { JwtService } from './../src/shared/security/jwt.service.js';

try {
  process.loadEnvFile();
} catch {}

// endpoints que usa la app del huésped; solo lecturas
describe('Menú, items especiales y fechas de acceso (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;
  let token: string;
  const post = (url: string, body: object) =>
    request(app.getHttpServer())
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    pool = app.get(PG_POOL);
    token = app
      .get(JwtService)
      .generarToken(
        { sub: '302', clienteNombre: 'e2e', accesoId: 1 },
        new Date(Date.now() + 60_000),
      );
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /menu devuelve los items activos de la categoría con sus etiquetas', async () => {
    const { meca_id } = (
      await pool.query(
        `SELECT meca_id FROM tbl_menu_items WHERE meit_estado = 'A' AND meit_fecha_eliminacion IS NULL LIMIT 1`,
      )
    ).rows[0];
    const esperados = (
      await pool.query(
        `SELECT COUNT(*) FROM tbl_menu_items WHERE meca_id = $1 AND meit_estado = 'A' AND meit_fecha_eliminacion IS NULL`,
        [meca_id],
      )
    ).rows[0].count;
    const res = await post('/api/v1/menu', { mecaId: meca_id }).expect(200);
    expect(res.body.data).toHaveLength(Number(esperados));
    expect(typeof res.body.data[0].meitPrecio).toBe('number');
    expect(Array.isArray(res.body.data[0].etiquetas)).toBe(true);
  });

  it('POST /menu sin mecaId responde 422', async () => {
    const res = await post('/api/v1/menu', {}).expect(422);
    expect(res.body.message).toBe('El mecaId no pueden ser nulos');
  });

  it('GET /items-especiales devuelve las tres listas de hasta 5 items', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/items-especiales')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    for (const lista of [
      'itemsMasPedidos',
      'itemsMasRecientes',
      'itemsRecomendadosChef',
    ]) {
      expect(res.body.data[lista].length).toBeLessThanOrEqual(5);
    }
  });

  it('POST /fechas-acceso devuelve las fechas del acceso; 404 si no existe', async () => {
    const res = await post('/api/v1/fechas-acceso', { haacId: 1 }).expect(200);
    expect(Object.keys(res.body.data)).toEqual([
      'haacId',
      'haacFechaInicio',
      'haacFechaFin',
    ]);
    await post('/api/v1/fechas-acceso', { haacId: 999999 }).expect(404);
  });
});
