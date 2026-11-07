import type { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { DatosPedido } from '../../domain/model/pedido.js';
import type { InferirDatosPedidoRepository } from '../../domain/port/inferir-datos-pedido.repository.js';
import type { InsertarDetallePedidoRepository } from '../../domain/port/insertar-detalle-pedido.repository.js';
import type { InsertarPedidoRepository } from '../../domain/port/insertar-pedido.repository.js';
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

  const inferir: InferirDatosPedidoRepository = {
    inferirDatosPedidos: async () => {
      orden.push('inferir');
      return datos;
    },
  };
  const insertarPedido: InsertarPedidoRepository = {
    insertarPedido: async () => {
      orden.push('pedido');
      return 99;
    },
  };
  const insertarDetalle: InsertarDetallePedidoRepository = {
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
    inferir,
    insertarPedido,
    insertarDetalle,
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
