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

// crea, edita y elimina un ítem de prueba; al final lo borra de la BD junto con sus etiquetas
describe('Maestro de ítems (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;
  let token: string;
  let meitId: number | undefined;
  const api = () =>
    request.agent(app.getHttpServer()).set('Authorization', `Bearer ${token}`);
  const etiquetasActivas = async (id: number) =>
    (
      await pool.query(
        `SELECT etiq_id FROM tbl_item_etiquetas WHERE meit_id = $1 AND itet_estado = 'A' ORDER BY etiq_id`,
        [id],
      )
    ).rows.map((r) => r.etiq_id);

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
      .generarTokenEmpleado({ sub: 'e2e', nombre: 'e2e', rol: 'ADMIN' });
  });

  afterAll(async () => {
    if (meitId) {
      await pool.query('DELETE FROM tbl_item_etiquetas WHERE meit_id = $1', [
        meitId,
      ]);
      await pool.query('DELETE FROM tbl_menu_items WHERE meit_id = $1', [
        meitId,
      ]);
    }
    await app.close();
  });

  it('GET /items lista los ítems con su categoría y etiquetas', async () => {
    const res = await api().get('/api/v1/items').expect(200);
    expect(res.body.size).toBe(res.body.data.length);
    expect(Object.keys(res.body.data[0])).toEqual([
      'meitId',
      'meitNombre',
      'meitDescripcion',
      'meitPrecio',
      'meitImagenUrl',
      'mecaId',
      'mecaNombre',
      'mecaParentId',
      'mecaParentNombre',
      'etiquetas',
    ]);
  });

  it('crea, actualiza etiquetas y elimina un ítem', async () => {
    // una subcategoría activa y dos etiquetas activas cualesquiera
    const subcategoria = (
      await pool.query(
        `SELECT meca_id, meca_parent_id FROM mst_menu_categorias
         WHERE meca_parent_id IS NOT NULL AND meca_estado = 'A' AND meca_fecha_eliminacion IS NULL LIMIT 1`,
      )
    ).rows[0];
    const [e1, e2] = (
      await pool.query(
        `SELECT etiq_id FROM mst_etiquetas WHERE etiq_estado = 'A' ORDER BY etiq_id LIMIT 2`,
      )
    ).rows.map((r) => r.etiq_id);
    const item = {
      meitNombre: 'Ítem e2e',
      meitPrecio: 1000,
      mecaId: subcategoria.meca_id,
      etiqIds: [e1, e2],
    };

    const creado = await api().post('/api/v1/items').send(item).expect(200);
    meitId = creado.body.data;
    const fila = (
      await pool.query(
        'SELECT meca_parent_id FROM tbl_menu_items WHERE meit_id = $1',
        [meitId],
      )
    ).rows[0];
    expect(fila.meca_parent_id).toBe(subcategoria.meca_parent_id);
    expect(await etiquetasActivas(meitId!)).toEqual([e1, e2]);

    // quitar una etiqueta y volverla a poner reactiva la misma fila
    await api()
      .put(`/api/v1/items/${meitId}`)
      .send({ ...item, etiqIds: [e2] })
      .expect(200);
    expect(await etiquetasActivas(meitId!)).toEqual([e2]);
    await api().put(`/api/v1/items/${meitId}`).send(item).expect(200);
    expect(await etiquetasActivas(meitId!)).toEqual([e1, e2]);

    await api().delete(`/api/v1/items/${meitId}`).expect(200);
    await api().delete(`/api/v1/items/${meitId}`).expect(422);
  });

  it('POST /items con una categoría raíz responde 422', async () => {
    const raiz = (
      await pool.query(
        'SELECT meca_id FROM mst_menu_categorias WHERE meca_parent_id IS NULL LIMIT 1',
      )
    ).rows[0].meca_id;
    const res = await api()
      .post('/api/v1/items')
      .send({ meitNombre: 'x', meitPrecio: 1, mecaId: raiz })
      .expect(422);
    expect(res.body.message).toContain('subcategoría activa');
  });

  it('POST /items sin nombre responde 422', async () => {
    await api()
      .post('/api/v1/items')
      .send({ meitPrecio: 1, mecaId: 3 })
      .expect(422);
  });
});
