import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../shared/domain/exception/not-found.exception.js';
import { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import { PedidoRepository } from '../../domain/port/pedido.repository.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';
import { validarTransicion } from './transicion-estado.js';

export interface CambioEstadoResponse {
  pediId: number;
  espeId: number;
  espeNombre: string;
}

@Injectable()
export class CambiarEstadoPedidoUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly transactionManager: TransactionManager,
    private readonly pedidoNotificationUseCase: PedidoNotificationUseCase,
  ) {}

  async cambiarEstado(
    pediId: number,
    espeIdDestino: unknown,
  ): Promise<CambioEstadoResponse> {
    if (!Number.isInteger(espeIdDestino))
      throw new BusinessException('El estado del pedido es obligatorio');

    // en una transacción: el pedido queda bloqueado mientras se valida y actualiza,
    // así dos personas no pueden cambiarlo a la vez desde estados distintos
    const { actual, destino } = await this.transactionManager.ejecutar(
      async () => {
        const actual =
          await this.pedidoRepository.consultarEstadoActual(pediId);
        if (!actual) throw new NotFoundException('Pedido no encontrado');
        const destino = await this.pedidoRepository.consultarEstado(
          espeIdDestino as number,
        );
        if (!destino) throw new BusinessException('Estado de pedido no válido');
        validarTransicion(actual.estado, destino);
        await this.pedidoRepository.actualizarEstado(pediId, destino.espeId);
        return { actual, destino };
      },
    );

    this.pedidoNotificationUseCase.publishStatusChanged(pediId, actual.haacId, {
      espeId: destino.espeId,
      espeNombre: destino.espeNombre,
    });
    return { pediId, espeId: destino.espeId, espeNombre: destino.espeNombre };
  }
}
