import type { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { EstadoPedido } from '../../domain/model/estado-pedido.js';
import type { EstadoPedidoRepository } from '../../domain/port/estado-pedido.repository.js';
import { CambiarEstadoPedidoUseCase } from './cambiar-estado-pedido.use-case.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';

const ESTADOS: Record<number, EstadoPedido> = {
  1: { espeId: 1, espeLlaveMst: 'ESTA_PEDI_PEND', espeNombre: 'Pendiente' },
  2: {
    espeId: 2,
    espeLlaveMst: 'ESTA_PEDI_PREP',
    espeNombre: 'En preparación',
  },
  3: { espeId: 3, espeLlaveMst: 'ESTA_PEDI_ENTR', espeNombre: 'Entregado' },
};

describe('CambiarEstadoPedidoUseCase', () => {
  const actualizados: number[] = [];
  const repo: EstadoPedidoRepository = {
    consultarEstadoActual: async (pediId) =>
      pediId === 15 ? { pediId, haacId: 7, estado: ESTADOS[1] } : null,
    consultarEstado: async (espeId) => ESTADOS[espeId] ?? null,
    actualizarEstado: async (_, espeId) => {
      actualizados.push(espeId);
      return 1;
    },
  };
  const transaccion: TransactionManager = { ejecutar: (fn) => fn() };
  const notificaciones = new PedidoNotificationUseCase();
  const eventos: unknown[] = [];
  notificaciones.events((evento) => eventos.push(evento));
  const useCase = new CambiarEstadoPedidoUseCase(
    repo,
    transaccion,
    notificaciones,
  );

  beforeEach(() => {
    actualizados.length = 0;
    eventos.length = 0;
  });

  it('actualiza, notifica y devuelve el estado nuevo', async () => {
    await expect(useCase.cambiarEstado(15, 2)).resolves.toEqual({
      pediId: 15,
      espeId: 2,
      espeNombre: 'En preparación',
    });
    expect(actualizados).toEqual([2]);
    expect(eventos).toHaveLength(1);
  });

  it.each([
    [15, undefined, 'El estado del pedido es obligatorio'],
    [99, 2, 'Pedido no encontrado'],
    [15, 9, 'Estado de pedido no válido'],
    [15, 3, 'No se puede pasar el pedido de "Pendiente" a "Entregado"'],
  ])(
    'pedido %s a estado %s: rechaza sin actualizar ni notificar',
    async (pediId, estado, mensaje) => {
      await expect(useCase.cambiarEstado(pediId, estado)).rejects.toThrow(
        mensaje,
      );
      expect(actualizados).toEqual([]);
      expect(eventos).toEqual([]);
    },
  );
});
