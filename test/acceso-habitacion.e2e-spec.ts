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

const HABITACION = 'E2E-ACC';
const hora = (horas: number) =>
  new Date(Date.now() + horas * 3_600_000).toISOString();

// registra, edita, renueva el código y finaliza un acceso de prueba; al final lo borra de la BD
describe('Registro de huéspedes (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;
  let haacId: number;
  let codigo: string;
  const api = (rol = 'RECEPCION') => {
    const token = app
      .get(JwtService)
      .generarTokenEmpleado({ sub: 'e2e', nombre: 'e2e', rol });
    return request
      .agent(app.getHttpServer())
      .set('Authorization', `Bearer ${token}`);
  };
  const login = (cod: string) =>
    request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ habitacion: HABITACION, codigo: cod });
  const limpiar = () =>
    pool.query('DELETE FROM tbl_habitacion_acceso WHERE haac_habitacion = $1', [
      HABITACION,
    ]);

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    pool = app.get(PG_POOL);
    await limpiar();
  });

  afterAll(async () => {
    await limpiar();
    await app.close();
  });

  it('registra al huésped y con el código generado puede iniciar sesión', async () => {
    const res = await api()
      .post('/api/v1/accesos')
      .send({
        haacHabitacion: HABITACION,
        haacClienteNombre: 'Huésped e2e',
        haacFechaInicio: hora(-1),
        haacFechaFin: hora(24),
      })
      .expect(200);
    ({ haacId, haacCodigo: codigo } = res.body.data);
    expect(codigo).toMatch(/^[A-Z2-9]{6}$/);
    await login(codigo).expect(200);
  });

  it('no deja otro acceso de la misma habitación en fechas que se cruzan', async () => {
    const res = await api()
      .post('/api/v1/accesos')
      .send({
        haacHabitacion: HABITACION,
        haacClienteNombre: 'Otro',
        haacFechaInicio: hora(2),
        haacFechaFin: hora(48),
      })
      .expect(422);
    expect(res.body.message).toContain('se cruza con esas fechas');
  });

  it('lista los accesos vigentes y el historial por habitación', async () => {
    const vigentes = await api().get('/api/v1/accesos').expect(200);
    expect(
      vigentes.body.data.map((a: { haacId: number }) => a.haacId),
    ).toContain(haacId);
    const historial = await api()
      .get(`/api/v1/accesos?habitacion=${HABITACION}`)
      .expect(200);
    expect(historial.body.data).toEqual([
      expect.objectContaining({
        haacId,
        haacCodigo: codigo,
        haacClienteNombre: 'Huésped e2e',
        haacEstado: 'A',
      }),
    ]);
  });

  it('extiende la estadía', async () => {
    const fin = hora(72);
    await api()
      .put(`/api/v1/accesos/${haacId}`)
      .send({
        haacClienteNombre: 'Huésped e2e',
        haacClienteDoc: '123',
        haacFechaInicio: hora(-1),
        haacFechaFin: fin,
      })
      .expect(200);
    const { rows } = await pool.query(
      'SELECT haac_fecha_fin, haac_cliente_doc FROM tbl_habitacion_acceso WHERE haac_id = $1',
      [haacId],
    );
    expect(rows[0].haac_fecha_fin.toISOString()).toBe(fin);
    expect(rows[0].haac_cliente_doc).toBe('123');
  });

  it('el código renovado reemplaza al anterior', async () => {
    const res = await api()
      .post(`/api/v1/accesos/${haacId}/codigo`)
      .expect(200);
    const nuevo = res.body.data.haacCodigo;
    expect(nuevo).not.toBe(codigo);
    await login(codigo).expect(404);
    await login(nuevo).expect(200);
    codigo = nuevo;
  });

  it('al finalizar el huésped ya no entra ni se puede editar el acceso', async () => {
    await api().post(`/api/v1/accesos/${haacId}/finalizar`).expect(200);
    const res = await login(codigo).expect(422);
    expect(res.body.message).toBe('El acceso está inactivo');
    await api().post(`/api/v1/accesos/${haacId}/finalizar`).expect(422);
    await api().post(`/api/v1/accesos/${haacId}/codigo`).expect(422);
  });

  it('con el acceso finalizado, el token que el huésped ya tenía no puede pedir', async () => {
    const token = app
      .get(JwtService)
      .generarToken(
        { sub: HABITACION, clienteNombre: 'e2e', accesoId: haacId },
        new Date(Date.now() + 3_600_000),
      );
    const { rows } = await pool.query(
      `SELECT meit_id FROM tbl_menu_items WHERE meit_estado = 'A' AND meit_fecha_eliminacion IS NULL LIMIT 1`,
    );
    const res = await request(app.getHttpServer())
      .post('/api/v1/pedido')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ meitId: rows[0].meit_id, cantidad: 1 }] })
      .expect(422);
    expect(res.body.message).toBe(
      'No se encontraron datos para crear el pedido',
    );
  });

  it.each(['COCINA', 'MESERO'])('%s no gestiona accesos: 403', async (rol) => {
    await api(rol).get('/api/v1/accesos').expect(403);
  });
});
