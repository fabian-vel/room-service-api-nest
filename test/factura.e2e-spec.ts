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

const USUARIO = 'e2e_factura';
const HABITACION = 'E2E-FACT';

// crea un acceso con pedidos entregado, en preparación y cancelado; al final borra todo de la BD
describe('Factura de la habitación (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;
  let haacId: number;
  let pedidoEnPreparacion: number;
  const estado: Record<string, number> = {};
  const token = (rol: string) =>
    app
      .get(JwtService)
      .generarTokenEmpleado({ sub: USUARIO, nombre: 'e2e', rol });
  const api = (rol = 'RECEPCION') =>
    request
      .agent(app.getHttpServer())
      .set('Authorization', `Bearer ${token(rol)}`);
  const cobrar = () =>
    api()
      .post(`/api/v1/facturas/${haacId}/pagos`)
      .send({ pagoMetodo: 'EFECTIVO' });

  const limpiar = async () => {
    const accesos = `SELECT haac_id FROM tbl_habitacion_acceso WHERE haac_habitacion = '${HABITACION}'`;
    await pool.query(
      `DELETE FROM tbl_pedido_detalle WHERE pedi_id IN (SELECT pedi_id FROM tbl_pedidos WHERE haac_id IN (${accesos}))`,
    );
    await pool.query(`DELETE FROM tbl_pedidos WHERE haac_id IN (${accesos})`);
    await pool.query(`DELETE FROM tbl_pagos WHERE haac_id IN (${accesos})`);
    await pool.query(
      `DELETE FROM tbl_habitacion_acceso WHERE haac_habitacion = '${HABITACION}'`,
    );
    await pool.query('DELETE FROM tbl_empleados WHERE empl_usuario = $1', [
      USUARIO,
    ]);
  };

  const crearPedido = async (llave: string, total: number) => {
    const { rows } = await pool.query(
      `INSERT INTO tbl_pedidos (haac_id, pedi_habitacion, pedi_cliente_nombre, pedi_estado_pedido, pedi_total)
       VALUES ($1, $2, 'Huésped e2e', $3, $4) RETURNING pedi_id`,
      [haacId, HABITACION, estado[llave], total],
    );
    const pediId = Number(rows[0].pedi_id);
    await pool.query(
      `INSERT INTO tbl_pedido_detalle (pedi_id, meit_id, pede_cantidad, pede_precio_unitario, pede_subtotal)
       SELECT $1, meit_id, 2, $2 / 2, $2 FROM tbl_menu_items ORDER BY meit_id LIMIT 1`,
      [pediId, total],
    );
    return pediId;
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    pool = app.get(PG_POOL);
    await limpiar();

    const estados = await pool.query(
      'SELECT espe_id, espe_llave_mst FROM mst_estados_pedido',
    );
    for (const r of estados.rows) estado[r.espe_llave_mst] = r.espe_id;

    // el hash no importa: este empleado no inicia sesión, solo registra el pago
    await pool.query(
      `INSERT INTO tbl_empleados (empl_usuario, empl_password, empl_nombre, empl_rol)
       VALUES ($1, 'x', 'Recepción e2e', 'RECEPCION')`,
      [USUARIO],
    );
    const acceso = await pool.query(
      `INSERT INTO tbl_habitacion_acceso (haac_habitacion, haac_codigo, haac_fecha_inicio, haac_fecha_fin, haac_cliente_nombre)
       VALUES ($1, 'E2EFACT', NOW(), NOW() + INTERVAL '1 day', 'Huésped e2e') RETURNING haac_id`,
      [HABITACION],
    );
    haacId = Number(acceso.rows[0].haac_id);
    await crearPedido('ESTA_PEDI_ENTR', 30000);
    pedidoEnPreparacion = await crearPedido('ESTA_PEDI_PREP', 12000);
    await crearPedido('ESTA_PEDI_CANC', 99000);
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  it('busca por habitación con el saldo pendiente sin cancelados', async () => {
    const res = await api()
      .get(`/api/v1/facturas?habitacion=${HABITACION}`)
      .expect(200);
    expect(res.body.data).toEqual([
      expect.objectContaining({
        haacId,
        haacHabitacion: HABITACION,
        totalPendiente: 42000,
        pedidosSinEntregar: 1,
      }),
    ]);
  });

  it('sin habitación lista los accesos que deben', async () => {
    const res = await api().get('/api/v1/facturas').expect(200);
    expect(res.body.data.map((a: { haacId: number }) => a.haacId)).toContain(
      haacId,
    );
  });

  it('la factura trae los pedidos con su detalle y sin cancelados', async () => {
    const res = await api().get(`/api/v1/facturas/${haacId}`).expect(200);
    const { acceso, pedidos, pagos } = res.body.data;
    expect(acceso.totalPendiente).toBe(42000);
    expect(pedidos).toHaveLength(2);
    expect(pedidos[0]).toMatchObject({ pediTotal: 30000, pagoId: null });
    expect(pedidos[0].detalle[0]).toMatchObject({
      cantidad: 2,
      precioUnitario: 15000,
      subtotal: 30000,
    });
    expect(pagos).toEqual([]);
  });

  it('no cobra mientras haya pedidos sin entregar', async () => {
    const res = await cobrar().expect(422);
    expect(res.body.message).toContain('1 pedido(s) sin entregar');
  });

  it('cobra una sola vez los pedidos entregados', async () => {
    await pool.query(
      'UPDATE tbl_pedidos SET pedi_estado_pedido = $1 WHERE pedi_id = $2',
      [estado.ESTA_PEDI_ENTR, pedidoEnPreparacion],
    );
    const pagoId = (await cobrar().expect(200)).body.data;

    const res = await api().get(`/api/v1/facturas/${haacId}`).expect(200);
    const { acceso, pedidos, pagos } = res.body.data;
    expect(acceso.totalPendiente).toBe(0);
    expect(pedidos.every((p: { pagoId: number }) => p.pagoId === pagoId)).toBe(
      true,
    );
    expect(pagos).toEqual([
      expect.objectContaining({
        pagoId,
        pagoTotal: 42000,
        pagoMetodo: 'EFECTIVO',
        emplNombre: 'Recepción e2e',
      }),
    ]);

    const otraVez = await cobrar().expect(422);
    expect(otraVez.body.message).toBe('No hay pedidos pendientes de cobro');
  });

  it('acceso inexistente responde 404', async () => {
    await api().get('/api/v1/facturas/999999999').expect(404);
  });

  it.each(['COCINA', 'MESERO'])(
    '%s no puede ver facturas: 403',
    async (rol) => {
      await api(rol).get(`/api/v1/facturas/${haacId}`).expect(403);
    },
  );
});
