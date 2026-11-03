import { MotorReglas } from '../../../../shared/application/engine/motor-reglas.js';
import type { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { PedidoContexto } from '../../domain/model/pedido-contexto.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';
import { PedidoUseCase } from './pedido.use-case.js';

describe('PedidoUseCase', () => {
  const orden: string[] = [];
  const regla = (ruleId: string, accion?: (ctx: PedidoContexto) => void) => ({
    ruleId,
    validar: async (ctx: PedidoContexto) => {
      orden.push(ruleId);
      accion?.(ctx);
    },
  });
  const transaccion: TransactionManager = { ejecutar: (fn) => fn() };
  const notificaciones = new PedidoNotificationUseCase();
  const recibidos: number[] = [];
  notificaciones.events((evento) => recibidos.push(evento.pedidoId));

  const crear = (reglas: ReturnType<typeof regla>[]) =>
    new PedidoUseCase(new MotorReglas(reglas), transaccion, notificaciones);
  const criterio = { items: [{ meitId: 1, cantidad: 2 }] };

  beforeEach(() => {
    orden.length = 0;
    recibidos.length = 0;
  });

  it('aplica las reglas en orden y notifica el pedido creado', async () => {
    const useCase = crear([
      regla('INSERTAR_DETALLE_PEDIDO'),
      regla('INSERTAR_PEDIDO', (ctx) => (ctx.response.pedidoId = 99)),
      regla('CREAR_PEDIDO'),
      regla('INFERIR_DATOS_PEDIDO'),
    ]);
    await expect(useCase.crearPedido(criterio, 7)).resolves.toBe(
      'Pedido realizado con éxito',
    );
    expect(orden).toEqual([
      'INFERIR_DATOS_PEDIDO',
      'CREAR_PEDIDO',
      'INSERTAR_PEDIDO',
      'INSERTAR_DETALLE_PEDIDO',
    ]);
    expect(recibidos).toEqual([99]);
  });

  it('si una regla falla no notifica', async () => {
    const useCase = crear([
      regla('INFERIR_DATOS_PEDIDO'),
      regla('CREAR_PEDIDO', () => {
        throw new Error('falla');
      }),
    ]);
    await expect(useCase.crearPedido(criterio, 7)).rejects.toThrow('falla');
    expect(recibidos).toEqual([]);
  });

  it.each([
    [{}, 'Datos insuficientes para inferir información de pedido'],
    [{ items: [] }, 'Datos insuficientes para inferir información de pedido'],
    [
      { items: [{ meitId: 1, cantidad: 0 }] },
      'Cada item debe tener un meitId y una cantidad mayor a 0',
    ],
    [
      { items: [{ meitId: 1, cantidad: -2 }] },
      'Cada item debe tener un meitId y una cantidad mayor a 0',
    ],
    [
      { items: [{ meitId: 'x', cantidad: 1 }] },
      'Cada item debe tener un meitId y una cantidad mayor a 0',
    ],
  ])('valida el body %j', async (body, mensaje) => {
    await expect(crear([]).crearPedido(body as never, 7)).rejects.toThrow(
      mensaje,
    );
  });
});
