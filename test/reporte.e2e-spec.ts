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

// solo lecturas: compara contra totales calculados directamente en la BD
describe('Reportes (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;
  let jwtService: JwtService;
  const rango = 'fechaDesde=2000-01-01&fechaHasta=2000-12-31';
  const get = (url: string, token: string) =>
    request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${token}`);
  const tokenEmpleado = () =>
    jwtService.generarTokenEmpleado({
      sub: 'e2e',
      nombre: 'e2e',
      rol: 'ADMIN',
    });

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    pool = app.get(PG_POOL);
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /reportes: los totales cuadran con la BD', async () => {
    const { rows } = await pool.query(
      `SELECT MIN(pedi_fecha_creacion)::date::text AS desde, MAX(pedi_fecha_creacion)::date::text AS hasta,
              COUNT(*) AS pedidos,
              COALESCE(SUM(pedi_total) FILTER (WHERE pedi_estado_pedido <> 4), 0) AS ventas
       FROM tbl_pedidos WHERE pedi_estado = 'A' AND pedi_fecha_eliminacion IS NULL`,
    );
    const bd = rows[0];
    if (!bd.desde) return; // BD sin pedidos: no hay qué comparar

    const res = await get(
      `/api/v1/reportes?fechaDesde=${bd.desde}&fechaHasta=${bd.hasta}`,
      tokenEmpleado(),
    ).expect(200);
    const reporte = res.body.data;
    const suma = (lista: { total: number }[]) =>
      lista.reduce((acc, r) => acc + r.total, 0);

    expect(suma(reporte.ventasPorDia)).toBeCloseTo(Number(bd.ventas), 2);
    expect(suma(reporte.ventasPorHabitacion)).toBeCloseTo(Number(bd.ventas), 2);
    expect(
      reporte.pedidosPorEstado.reduce(
        (acc: number, e: { pedidos: number }) => acc + e.pedidos,
        0,
      ),
    ).toBe(Number(bd.pedidos));
    expect(reporte.itemsMasVendidos.length).toBeLessThanOrEqual(10);
  });

  it('GET /reportes: rango sin pedidos devuelve listas vacías y estados en cero', async () => {
    const res = await get(`/api/v1/reportes?${rango}`, tokenEmpleado()).expect(
      200,
    );
    const reporte = res.body.data;
    expect(reporte.ventasPorDia).toEqual([]);
    expect(reporte.itemsMasVendidos).toEqual([]);
    expect(reporte.ventasPorHabitacion).toEqual([]);
    expect(reporte.pedidosPorEstado.length).toBeGreaterThan(0);
    expect(
      reporte.pedidosPorEstado.every(
        (e: { pedidos: number }) => e.pedidos === 0,
      ),
    ).toBe(true);
  });

  it('GET /reportes: sin fechas responde 422', async () => {
    await get('/api/v1/reportes', tokenEmpleado()).expect(422);
  });

  it('GET /reportes: un token de habitación recibe 403', async () => {
    const token = jwtService.generarToken(
      { sub: '302', clienteNombre: 'e2e', accesoId: 1 },
      new Date(Date.now() + 60_000),
    );
    await get(`/api/v1/reportes?${rango}`, token).expect(403);
  });
});
