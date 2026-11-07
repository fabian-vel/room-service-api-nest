import { Inject, Injectable } from '@nestjs/common';
import type { MotorReglas } from '../../../../shared/application/engine/motor-reglas.js';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { CambioEstadoContexto } from '../../domain/model/cambio-estado-contexto.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';

export const MOTOR_REGLAS_ESTADO_PEDIDO = Symbol('MOTOR_REGLAS_ESTADO_PEDIDO');

const REGLAS = [
  'CONSULTAR_ESTADO_PEDIDO',
  'VALIDAR_TRANSICION_ESTADO',
  'ACTUALIZAR_ESTADO_PEDIDO',
];

export interface CambioEstadoResponse {
  pediId: number;
  espeId: number;
  espeNombre: string;
}

@Injectable()
export class CambiarEstadoPedidoUseCase {
  constructor(
    @Inject(MOTOR_REGLAS_ESTADO_PEDIDO)
    private readonly motorReglas: MotorReglas<CambioEstadoContexto>,
    private readonly transactionManager: TransactionManager,
    private readonly pedidoNotificationUseCase: PedidoNotificationUseCase,
  ) {}

  async cambiarEstado(
    pediId: number,
    espeIdDestino: unknown,
  ): Promise<CambioEstadoResponse> {
    if (!Number.isInteger(espeIdDestino))
      throw new BusinessException('El estado del pedido es obligatorio');
    const contexto: CambioEstadoContexto = {
      request: { pediId, espeIdDestino: espeIdDestino as number },
      response: {},
    };

    // en una transacción: el pedido queda bloqueado mientras se valida y actualiza,
    // así dos personas no pueden cambiarlo a la vez desde estados distintos
    await this.transactionManager.ejecutar(() =>
      this.motorReglas.aplicar(REGLAS, contexto),
    );

    const { actual, destino } = contexto.response;
    this.pedidoNotificationUseCase.publishStatusChanged(
      pediId,
      actual!.haacId,
      {
        espeId: destino!.espeId,
        espeNombre: destino!.espeNombre,
      },
    );
    return { pediId, espeId: destino!.espeId, espeNombre: destino!.espeNombre };
  }
}
