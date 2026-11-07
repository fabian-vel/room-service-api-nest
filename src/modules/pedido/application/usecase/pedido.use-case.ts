import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { PedidoCriterio } from '../../domain/model/pedido.js';
import { InferirDatosPedidoRepository } from '../../domain/port/inferir-datos-pedido.repository.js';
import { InsertarDetallePedidoRepository } from '../../domain/port/insertar-detalle-pedido.repository.js';
import { InsertarPedidoRepository } from '../../domain/port/insertar-pedido.repository.js';
import { armarPedido } from './armar-pedido.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';

const SMALLINT_MAX = 32767;

@Injectable()
export class PedidoUseCase {
  constructor(
    private readonly inferirDatosPedidoRepository: InferirDatosPedidoRepository,
    private readonly insertarPedidoRepository: InsertarPedidoRepository,
    private readonly insertarDetallePedidoRepository: InsertarDetallePedidoRepository,
    private readonly transactionManager: TransactionManager,
    private readonly pedidoNotificationUseCase: PedidoNotificationUseCase,
  ) {}

  async crearPedido(criterio: PedidoCriterio, haacId: number): Promise<string> {
    validarCriterio(criterio);

    // pedido y detalle en una sola transacción: si falla el detalle no queda un pedido sin items
    const pediId = await this.transactionManager.ejecutar(async () => {
      const datos = await this.inferirDatosPedidoRepository.inferirDatosPedidos(
        haacId,
        criterio.items.map((item) => item.meitId),
      );
      const { pedido, detalles } = armarPedido(criterio, haacId, datos);
      const pediId = await this.insertarPedidoRepository.insertarPedido(pedido);
      await this.insertarDetallePedidoRepository.insertarDetallePedido(
        detalles.map((detalle) => ({ ...detalle, pediId })),
      );
      return pediId;
    });

    // se notifica después del COMMIT, para no avisar de un pedido que se revirtió
    this.pedidoNotificationUseCase.publishCreated(pediId);
    return 'Pedido realizado con éxito';
  }
}

/** El body llega del cliente: se valida su forma antes de consultar la BD */
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
