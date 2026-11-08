import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../shared/domain/exception/not-found.exception.js';
import { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import { PedidoRepository } from '../../domain/port/pedido.repository.js';
import type { CambioEstadoResponse } from './cambiar-estado-pedido.use-case.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';

const PENDIENTE = 'ESTA_PEDI_PEND';
const CANCELADO = 'ESTA_PEDI_CANC';

/** El huésped cancela su propio pedido, solo mientras está pendiente */
@Injectable()
export class CancelarPedidoUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly transactionManager: TransactionManager,
    private readonly pedidoNotificationUseCase: PedidoNotificationUseCase,
  ) {}

  async cancelar(
    pediId: number,
    haacId: number,
  ): Promise<CambioEstadoResponse> {
    // en una transacción: el pedido queda bloqueado, así la cocina no lo pasa
    // a preparación mientras el huésped lo cancela
    const cancelado = await this.transactionManager.ejecutar(async () => {
      const actual = await this.pedidoRepository.consultarEstadoActual(pediId);
      // un pedido de otra habitación responde igual que uno inexistente
      if (!actual || actual.haacId !== haacId)
        throw new NotFoundException('Pedido no encontrado');
      if (actual.estado.espeLlaveMst !== PENDIENTE)
        throw new BusinessException(
          `El pedido ya está "${actual.estado.espeNombre}" y no se puede cancelar`,
        );
      const destino =
        await this.pedidoRepository.consultarEstadoPorLlave(CANCELADO);
      if (!destino) throw new BusinessException('Estado de pedido no válido');
      await this.pedidoRepository.actualizarEstado(pediId, destino.espeId);
      return destino;
    });

    this.pedidoNotificationUseCase.publishCancelled(pediId, haacId, {
      espeId: cancelado.espeId,
      espeNombre: cancelado.espeNombre,
    });
    return {
      pediId,
      espeId: cancelado.espeId,
      espeNombre: cancelado.espeNombre,
    };
  }
}
