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

const USUARIO = 'e2e_empleado';

// crea, edita y elimina un empleado de prueba; al final lo borra de la BD
describe('Empleados (e2e)', () => {
  let app: INestApplication<App>;
  let pool: Pool;
  let emplId: number;
  const token = (sub: string, rol: string) =>
    app.get(JwtService).generarTokenEmpleado({ sub, nombre: 'e2e', rol });
  const api = (t = token('e2e', 'ADMIN')) =>
    request.agent(app.getHttpServer()).set('Authorization', `Bearer ${t}`);
  const login = (password: string) =>
    request(app.getHttpServer())
      .post('/api/v1/auth/empleado/login')
      .send({ usuario: USUARIO, password });

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    pool = app.get(PG_POOL);
    await pool.query('DELETE FROM tbl_empleados WHERE empl_usuario = $1', [
      USUARIO,
    ]);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM tbl_empleados WHERE empl_usuario = $1', [
      USUARIO,
    ]);
    await app.close();
  });

  it('crea el empleado y puede iniciar sesión con su rol', async () => {
    const res = await api()
      .post('/api/v1/empleados')
      .send({
        emplUsuario: USUARIO,
        emplNombre: 'Empleado e2e',
        emplRol: 'MESERO',
        emplPassword: 'clave-e2e-1',
      })
      .expect(200);
    emplId = res.body.data;

    const sesion = await login('clave-e2e-1').expect(200);
    expect(sesion.body.data.rol).toBe('MESERO');
  });

  it('el usuario repetido responde 422', async () => {
    const res = await api()
      .post('/api/v1/empleados')
      .send({
        emplUsuario: USUARIO,
        emplNombre: 'Otro',
        emplRol: 'COCINA',
        emplPassword: 'clave-e2e-1',
      })
      .expect(422);
    expect(res.body.message).toBe('El usuario ya existe');
  });

  it('GET no devuelve la contraseña', async () => {
    const res = await api().get('/api/v1/empleados').expect(200);
    const creado = res.body.data.find(
      (e: { emplId: number }) => e.emplId === emplId,
    );
    expect(creado).toEqual({
      emplId,
      emplUsuario: USUARIO,
      emplNombre: 'Empleado e2e',
      emplRol: 'MESERO',
    });
  });

  it('actualizar sin contraseña conserva la actual; con contraseña la cambia', async () => {
    await api()
      .put(`/api/v1/empleados/${emplId}`)
      .send({ emplNombre: 'Empleado e2e', emplRol: 'COCINA' })
      .expect(200);
    expect((await login('clave-e2e-1').expect(200)).body.data.rol).toBe(
      'COCINA',
    );

    await api()
      .put(`/api/v1/empleados/${emplId}`)
      .send({
        emplNombre: 'Empleado e2e',
        emplRol: 'ADMIN',
        emplPassword: 'clave-e2e-2',
      })
      .expect(200);
    await login('clave-e2e-1').expect(422);
    await login('clave-e2e-2').expect(200);
  });

  it('nadie puede quitarse el rol ADMIN ni eliminarse a sí mismo', async () => {
    const propio = token(USUARIO, 'ADMIN');
    await api(propio)
      .put(`/api/v1/empleados/${emplId}`)
      .send({ emplNombre: 'Empleado e2e', emplRol: 'COCINA' })
      .expect(422);
    await api(propio).delete(`/api/v1/empleados/${emplId}`).expect(422);
  });

  it.each(['AUX_ADMIN', 'RECEPCION', 'COCINA', 'MESERO'])(
    '%s no puede gestionar empleados: 403',
    async (rol) => {
      await api(token('e2e', rol)).get('/api/v1/empleados').expect(403);
    },
  );

  it('elimina el empleado y ya no puede iniciar sesión', async () => {
    await api().delete(`/api/v1/empleados/${emplId}`).expect(200);
    await login('clave-e2e-2').expect(404);
  });
});
