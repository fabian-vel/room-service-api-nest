import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { PedidoCriterio } from '../../domain/model/pedido.js';
import { PedidoRepository } from '../../domain/port/pedido.repository.js';
import { armarPedido } from './armar-pedido.js';
import { PedidoNotificationUseCase } from './pedido-notification.use-case.js';

const SMALLINT_MAX = 32767;

@Injectable()
export class PedidoUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly transactionManager: TransactionManager,
    private readonly pedidoNotificationUseCase: PedidoNotificationUseCase,
  ) {}

  async crearPedido(criterio: PedidoCriterio, haacId: number): Promise<string> {
    validarCriterio(criterio);

    const pediId = await this.transactionManager.ejecutar(async () => {
      const datos = await this.pedidoRepository.inferirDatosPedidos(
        haacId,
        criterio.items.map((item) => item.meitId),
      );
      const { pedido, detalles } = armarPedido(criterio, haacId, datos);
      const pediId = await this.pedidoRepository.insertarPedido(pedido);
      await this.pedidoRepository.insertarDetallePedido(
        detalles.map((detalle) => ({ ...detalle, pediId })),
      );
      return pediId;
    });

    this.pedidoNotificationUseCase.publishCreated(pediId);
    return 'Pedido realizado con éxito';
  }
}

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
