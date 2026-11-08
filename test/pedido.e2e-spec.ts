import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import type { Pool } from 'pg';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { PG_POOL } from './../src/shared/database/database.module.js';
import { enTransaccion } from './../src/shared/database/sql.util.js';
import { JwtService } from './../src/shared/security/jwt.service.js';
import { PedidoRepository } from './../src/modules/pedido/domain/port/pedido.repository.js';

try {
  process.loadEnvFile();
} catch {}

// crea pedidos reales y al final borra solo las filas que creó
describe('Crear pedido (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;
  let token: string;
  let haacId: number;
  let items: { meit_id: number; meit_precio: string }[];
  const maxPediId = async () =>
    Number(
      (
        await pool.query(
          'SELECT COALESCE(MAX(pedi_id), 0) AS m FROM tbl_pedidos',
        )
      ).rows[0].m,
    );
  let pediIdInicial: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    pool = app.get(PG_POOL);

    const acceso = await pool.query(
      `SELECT haac_id, haac_habitacion FROM tbl_habitacion_acceso
       WHERE haac_estado = 'A' AND haac_fecha_eliminacion IS NULL LIMIT 1`,
    );
    haacId = Number(acceso.rows[0].haac_id);
    token = app.get(JwtService).generarToken(
      {
        sub: acceso.rows[0].haac_habitacion,
        clienteNombre: 'e2e',
        accesoId: haacId,
      },
      new Date(Date.now() + 60_000),
    );
    items = (
      await pool.query(
        `SELECT meit_id, meit_precio FROM tbl_menu_items
         WHERE meit_estado = 'A' AND meit_fecha_eliminacion IS NULL ORDER BY meit_id LIMIT 2`,
      )
    ).rows;
    pediIdInicial = await maxPediId();
  });

  afterAll(async () => {
    await pool.query('DELETE FROM tbl_pedido_detalle WHERE pedi_id > $1', [
      pediIdInicial,
    ]);
    await pool.query('DELETE FROM tbl_pedidos WHERE pedi_id > $1', [
      pediIdInicial,
    ]);
    await app.close();
  });

  it('crea el pedido con su detalle y total calculado en la BD', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/pedido')
      .set('Authorization', `Bearer ${token}`)
      .send({
        observacion: 'prueba e2e',
        items: [
          { meitId: items[0].meit_id, cantidad: 2 },
          { meitId: items[1].meit_id, cantidad: 1, observacion: 'sin sal' },
        ],
      })
      .expect(200);
    expect(res.body).toMatchObject({
      message: 'Pedido creado exitosamente',
      data: 'Pedido realizado con éxito',
    });

    const pedido = (
      await pool.query('SELECT * FROM tbl_pedidos WHERE pedi_id > $1', [
        pediIdInicial,
      ])
    ).rows;
    expect(pedido).toHaveLength(1);
    const esperado =
      Number(items[0].meit_precio) * 2 + Number(items[1].meit_precio);
    expect(Number(pedido[0].pedi_total)).toBe(esperado);
    expect(Number(pedido[0].haac_id)).toBe(haacId);

    const detalle = (
      await pool.query(
        'SELECT * FROM tbl_pedido_detalle WHERE pedi_id = $1 ORDER BY pede_id',
        [pedido[0].pedi_id],
      )
    ).rows;
    expect(
      detalle.map((d) => [d.meit_id, d.pede_cantidad, d.pede_observacion]),
    ).toEqual([
      [items[0].meit_id, 2, null],
      [items[1].meit_id, 1, 'sin sal'],
    ]);
  });

  it('rechaza un item inexistente sin dejar nada en la BD', async () => {
    const antes = await maxPediId();
    await request(app.getHttpServer())
      .post('/api/v1/pedido')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { meitId: items[0].meit_id, cantidad: 1 },
          { meitId: 32000, cantidad: 1 },
        ],
      })
      .expect(422);
    expect(await maxPediId()).toBe(antes);
  });

  it('si algo falla dentro de la transacción el pedido insertado se revierte', async () => {
    const antes = await maxPediId();
    const pedidoRepository = app.get(PedidoRepository, { strict: false });
    await expect(
      enTransaccion(pool, async () => {
        await pedidoRepository.insertarPedido({
          haacId,
          habitacion: '302',
          clienteNombre: 'e2e',
          estadoPedidoId: 1,
          observacion: null,
          total: '1.00',
        });
        throw new Error('falla después de insertar');
      }),
    ).rejects.toThrow('falla después de insertar');
    expect(await maxPediId()).toBe(antes);
  });
});
