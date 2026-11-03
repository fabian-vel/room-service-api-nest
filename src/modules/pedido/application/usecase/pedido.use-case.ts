import { Inject, Injectable } from '@nestjs/common';
import type { MotorReglas } from '../../../../shared/application/engine/motor-reglas.js';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { PedidoCriterio } from '../../domain/model/pedido.js';
import type { PedidoContexto } from '../../domain/model/pedido-contexto.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';

export const MOTOR_REGLAS_PEDIDO = Symbol('MOTOR_REGLAS_PEDIDO');

const REGLAS = [
  'INFERIR_DATOS_PEDIDO',
  'CREAR_PEDIDO',
  'INSERTAR_PEDIDO',
  'INSERTAR_DETALLE_PEDIDO',
];
const SMALLINT_MAX = 32767;

@Injectable()
export class PedidoUseCase {
  constructor(
    @Inject(MOTOR_REGLAS_PEDIDO)
    private readonly motorReglas: MotorReglas<PedidoContexto>,
    private readonly transactionManager: TransactionManager,
    private readonly pedidoNotificationUseCase: PedidoNotificationUseCase,
  ) {}

  async crearPedido(criterio: PedidoCriterio, haacId: number): Promise<string> {
    validarCriterio(criterio);
    const contexto: PedidoContexto = {
      request: {
        pedidoCriterio: criterio,
        haacId,
        listItemId: criterio.items.map((item) => item.meitId),
      },
      response: { listaDatosPedidos: [] },
    };

    // pedido y detalle en una sola transacción (en Java un fallo en el detalle dejaba el pedido sin items)
    await this.transactionManager.ejecutar(() =>
      this.motorReglas.aplicar(REGLAS, contexto),
    );
    // se notifica después del COMMIT, para no avisar de un pedido que se revirtió
    this.pedidoNotificationUseCase.publishCreated(contexto.response.pedidoId!);
    return 'Pedido realizado con éxito';
  }
}

/** El body llega del cliente: se valida su forma antes de las reglas */
function validarCriterio(criterio: PedidoCriterio) {
  if (!Array.isArray(criterio?.items) || !criterio.items.length) {
    throw new BusinessException(
      'Datos insuficientes para inferir información de pedido',
    );
  }
  const entero = (valor: unknown) =>
    Number.isInteger(valor) &&
    (valor as number) >= 1 &&
    (valor as number) <= SMALLINT_MAX;
  if (
    criterio.items.some(
      (item) => !entero(item?.meitId) || !entero(item?.cantidad),
    )
  ) {
    throw new BusinessException(
      'Cada item debe tener un meitId y una cantidad mayor a 0',
    );
  }
}
