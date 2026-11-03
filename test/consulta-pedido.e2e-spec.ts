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

// solo lecturas: compara contra conteos hechos directamente en la BD
describe('Consulta de pedidos (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;
  let tokenEmpleado: string;
  const get = (url: string, token = tokenEmpleado) =>
    request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${token}`);
  const contar = async (where = 'TRUE') =>
    Number(
      (
        await pool.query(
          `SELECT COUNT(*) FROM tbl_pedidos P WHERE P.pedi_estado = 'A' AND P.pedi_fecha_eliminacion IS NULL AND ${where}`,
        )
      ).rows[0].count,
    );

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    pool = app.get(PG_POOL);
    tokenEmpleado = app
      .get(JwtService)
      .generarTokenEmpleado({ sub: 'e2e', nombre: 'e2e', rol: 'COCINA' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /pedidos sin filtros: 20 por página, del más reciente al más antiguo', async () => {
    const res = await get('/api/v1/pedidos').expect(200);
    const { items, total, page, pageSize } = res.body.data;
    expect({ total, page, pageSize }).toEqual({
      total: await contar(),
      page: 1,
      pageSize: 20,
    });
    expect(items.length).toBe(Math.min(20, total));
    expect(Object.keys(items[0])).toEqual([
      'pediId',
      'pediHabitacion',
      'pediTotal',
      'pediFechaCreacion',
      'pediObservacion',
      'espeId',
      'espeNombre',
      'detallePedidoList',
    ]);
    expect(typeof items[0].pediId).toBe('number');
    expect(typeof items[0].pediTotal).toBe('number');
    const fechas = items.map(
      (p: { pediFechaCreacion: string }) => p.pediFechaCreacion,
    );
    expect(fechas).toEqual([...fechas].sort().reverse());
  });

  it.each([
    ['estadoPedido=4', 'P.pedi_estado_pedido = 4'],
    ['habitacion=302', "P.pedi_habitacion = '302'"],
    [
      'fechaDesde=2026-09-01&fechaHasta=2026-09-30',
      "P.pedi_fecha_creacion >= DATE '2026-09-01' AND P.pedi_fecha_creacion < DATE '2026-10-01'",
    ],
    [
      'producto=jugo',
      "EXISTS (SELECT 1 FROM tbl_pedido_detalle D JOIN tbl_menu_items M ON M.meit_id = D.meit_id WHERE D.pedi_id = P.pedi_id AND D.pede_estado = 'A' AND D.pede_fecha_eliminacion IS NULL AND M.meit_nombre ILIKE '%jugo%')",
    ],
  ])('GET /pedidos?%s coincide con la BD', async (query, where) => {
    const res = await get(`/api/v1/pedidos?${query}&size=100`).expect(200);
    expect(res.body.data.total).toBe(await contar(where));
  });

  it('GET /pedidos valida parámetros con 422', async () => {
    const res = await get(
      '/api/v1/pedidos?fechaDesde=2026-09-30&fechaHasta=2026-09-01',
    ).expect(422);
    expect(res.body.message).toBe(
      'La fecha inicial no puede ser mayor a la fecha final',
    );
  });

  it('GET /consulta-pedidos-fecha-actual responde la lista del tablero', async () => {
    const res = await get('/api/v1/consulta-pedidos-fecha-actual').expect(200);
    expect(res.body.size).toBe(res.body.data.length);
    expect(res.body.data.length).toBe(await contar());
  });

  it('GET /consulta-pedidos usa el accesoId del token de habitación', async () => {
    const tokenHabitacion = app
      .get(JwtService)
      .generarToken(
        { sub: '302', clienteNombre: 'e2e', accesoId: 1 },
        new Date(Date.now() + 60_000),
      );
    const res = await get('/api/v1/consulta-pedidos', tokenHabitacion).expect(
      200,
    );
    expect(res.body.data.length).toBe(await contar('P.haac_id = 1'));
  });

  it('GET /consulta-pedidos con token de empleado responde 403', async () => {
    await get('/api/v1/consulta-pedidos').expect(403);
  });
});
