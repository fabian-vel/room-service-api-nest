import type { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { DatosPedido } from '../../domain/model/pedido.js';
import type { PedidoRepository } from '../../domain/port/pedido.repository.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';
import { PedidoUseCase } from './pedido.use-case.js';

describe('PedidoUseCase', () => {
  const orden: string[] = [];
  const datos: DatosPedido[] = [
    {
      haacHabitacion: '302',
      haacClienteNombre: 'Juan',
      meitId: 1,
      meitPrecio: '100.00',
      estadoPedidoId: 1,
    },
  ];
  let falla = false;

  // solo los métodos que usa crear pedido
  const repo: Pick<
    PedidoRepository,
    'inferirDatosPedidos' | 'insertarPedido' | 'insertarDetallePedido'
  > = {
    inferirDatosPedidos: async () => {
      orden.push('inferir');
      return datos;
    },
    insertarPedido: async () => {
      orden.push('pedido');
      return 99;
    },
    insertarDetallePedido: async (detalles) => {
      orden.push(`detalle:${detalles[0].pediId}`);
      if (falla) throw new Error('falla');
    },
  };
  const transaccion: TransactionManager = { ejecutar: (fn) => fn() };
  const notificaciones = new PedidoNotificationUseCase();
  const recibidos: number[] = [];
  notificaciones.events((evento) => recibidos.push(evento.pedidoId));

  const useCase = new PedidoUseCase(
    repo as PedidoRepository,
    transaccion,
    notificaciones,
  );
  const criterio = { items: [{ meitId: 1, cantidad: 2 }] };

  beforeEach(() => {
    orden.length = 0;
    recibidos.length = 0;
    falla = false;
  });

  it('inserta pedido y detalle en orden y notifica el pedido creado', async () => {
    await expect(useCase.crearPedido(criterio, 7)).resolves.toBe(
      'Pedido realizado con éxito',
    );
    expect(orden).toEqual(['inferir', 'pedido', 'detalle:99']);
    expect(recibidos).toEqual([99]);
  });

  it('si falla el detalle no notifica', async () => {
    falla = true;
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
    await expect(useCase.crearPedido(body as never, 7)).rejects.toThrow(
      mensaje,
    );
    expect(orden).toEqual([]);
  });
});
