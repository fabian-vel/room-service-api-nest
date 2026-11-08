import type { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { EstadoPedido } from '../../domain/model/estado-pedido.js';
import type { PedidoEvent } from '../../domain/model/pedido-event.js';
import type { PedidoRepository } from '../../domain/port/pedido.repository.js';
import { CancelarPedidoUseCase } from './cancelar-pedido.use-case.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';

const PEND: EstadoPedido = {
  espeId: 1,
  espeLlaveMst: 'ESTA_PEDI_PEND',
  espeNombre: 'Pendiente',
};
const PREP: EstadoPedido = {
  espeId: 2,
  espeLlaveMst: 'ESTA_PEDI_PREP',
  espeNombre: 'En preparación',
};
const CANC: EstadoPedido = {
  espeId: 4,
  espeLlaveMst: 'ESTA_PEDI_CANC',
  espeNombre: 'Cancelado',
};

describe('CancelarPedidoUseCase', () => {
  // pedido 15 pendiente y 16 en preparación, ambos de la habitación 7
  const pedidos: Record<number, EstadoPedido> = { 15: PEND, 16: PREP };
  const actualizados: number[] = [];
  const repo: Pick<
    PedidoRepository,
    'consultarEstadoActual' | 'consultarEstadoPorLlave' | 'actualizarEstado'
  > = {
    consultarEstadoActual: async (pediId) =>
      pedidos[pediId] ? { pediId, haacId: 7, estado: pedidos[pediId] } : null,
    consultarEstadoPorLlave: async (llave) =>
      llave === CANC.espeLlaveMst ? CANC : null,
    actualizarEstado: async (pediId) => {
      actualizados.push(pediId);
      return 1;
    },
  };
  const transaccion: TransactionManager = { ejecutar: (fn) => fn() };
  const notificaciones = new PedidoNotificationUseCase();
  const eventos: PedidoEvent[] = [];
  notificaciones.events((evento) => eventos.push(evento));
  const useCase = new CancelarPedidoUseCase(
    repo as PedidoRepository,
    transaccion,
    notificaciones,
  );

  beforeEach(() => {
    actualizados.length = 0;
    eventos.length = 0;
  });

  it('cancela el pedido pendiente y publica CANCELLED', async () => {
    await expect(useCase.cancelar(15, 7)).resolves.toEqual({
      pediId: 15,
      espeId: 4,
      espeNombre: 'Cancelado',
    });
    expect(actualizados).toEqual([15]);
    expect(eventos).toMatchObject([
      { type: 'CANCELLED', pedidoId: 15, haacId: 7 },
    ]);
  });

  it.each([
    [16, 7, 'El pedido ya está "En preparación" y no se puede cancelar'],
    [99, 7, 'Pedido no encontrado'],
    [15, 8, 'Pedido no encontrado'], // pedido de otra habitación
  ])(
    'pedido %s de la habitación %s: rechaza sin actualizar ni notificar',
    async (pediId, haacId, mensaje) => {
      await expect(useCase.cancelar(pediId, haacId)).rejects.toThrow(mensaje);
      expect(actualizados).toEqual([]);
      expect(eventos).toEqual([]);
    },
  );
});
