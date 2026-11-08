import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import { WebSocket } from 'ws';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { JwtService } from './../src/shared/security/jwt.service.js';
import { PedidoNotificationUseCase } from './../src/modules/pedido/application/usecase/pedido-notification.use-case.js';

try {
  process.loadEnvFile();
} catch {}

describe('WebSocket /ws/pedidos (e2e)', () => {
  let app: INestApplication;
  let url: string;
  let token: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.listen(0);
    url = `ws://localhost:${(app.getHttpServer().address() as AddressInfo).port}/ws/pedidos`;
    token = app.get(JwtService).generarTokenEmpleado({
      sub: 'cocina-e2e',
      nombre: 'e2e',
      rol: 'COCINA',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const cierre = (ws: WebSocket) =>
    new Promise<number>((resolve) => ws.on('close', (code) => resolve(code)));

  it.each([
    ['sin token', ''],
    ['con token inválido', '?token=no-es-un-jwt'],
  ])('%s cierra la conexión con 1003', async (_, query) => {
    expect(await cierre(new WebSocket(`${url}${query}`))).toBe(1003);
  });

  it('con token válido recibe los eventos de pedidos en JSON y deja de recibirlos al cerrar', async () => {
    const ws = new WebSocket(`${url}?token=${token}`);
    await new Promise((resolve) => ws.on('open', resolve));
    const mensaje = new Promise<unknown>((resolve) =>
      ws.on('message', (data) => resolve(JSON.parse(String(data)))),
    );

    const notificaciones = app.get(PedidoNotificationUseCase);
    notificaciones.publishCreated(123);
    expect(await mensaje).toMatchObject({ type: 'CREATED', pedidoId: 123 });

    ws.close();
    await cierre(ws);
    // al cerrar, el gateway cancela su suscripción (el servidor procesa el cierre un instante después que el cliente)
    const emitter = (
      notificaciones as unknown as {
        emitter: { listenerCount: (e: string) => number };
      }
    ).emitter;
    await vi.waitFor(() => expect(emitter.listenerCount('pedido')).toBe(0), {
      timeout: 2000,
    });
  });

  it('con token de habitación solo recibe los eventos de sus pedidos', async () => {
    const tokenHabitacion = app
      .get(JwtService)
      .generarToken(
        { sub: '302', clienteNombre: 'e2e', accesoId: 7 },
        new Date(Date.now() + 60_000),
      );
    const ws = new WebSocket(`${url}?token=${tokenHabitacion}`);
    await new Promise((resolve) => ws.on('open', resolve));
    const recibidos: { pedidoId: number }[] = [];
    ws.on('message', (data) => recibidos.push(JSON.parse(String(data))));

    const notificaciones = app.get(PedidoNotificationUseCase);
    const estado = { espeId: 2, espeNombre: 'En preparación' };
    notificaciones.publishCreated(1); // sin habitación: solo para cocina
    notificaciones.publishStatusChanged(2, 8, estado); // otra habitación
    notificaciones.publishStatusChanged(3, 7, estado); // la suya

    await vi.waitFor(() => expect(recibidos).toHaveLength(1), {
      timeout: 2000,
    });
    expect(recibidos[0]).toMatchObject({
      type: 'STATUS_CHANGED',
      pedidoId: 3,
      payload: estado,
    });
    ws.close();
    await cierre(ws);
  });
});
