import { Injectable } from '@nestjs/common';
import type { ReglaNegocio } from '../../../../../shared/application/rule/regla-negocio.js';
import { BusinessException } from '../../../../../shared/domain/exception/business.exception.js';
import type { PedidoContexto } from '../../../domain/model/pedido-contexto.js';
import { InsertarDetallePedidoRepository } from '../../../domain/port/insertar-detalle-pedido.repository.js';

@Injectable()
export class InsertarDetallePedidoRule implements ReglaNegocio<PedidoContexto> {
  readonly ruleId = 'INSERTAR_DETALLE_PEDIDO';

  constructor(
    private readonly insertarDetallePedidoRepository: InsertarDetallePedidoRepository,
  ) {}

  async validar(contexto: PedidoContexto): Promise<void> {
    const detalles = contexto.request.detallePedidoList;
    if (!detalles?.length) {
      throw new BusinessException(
        'La lista de detalles de pedido no puede ser nula o vacía',
      );
    }
    const pediId = contexto.response.pedidoId;
    await this.insertarDetallePedidoRepository.insertarDetallePedido(
      detalles.map((detalle) => ({ ...detalle, pediId })),
    );
  }
}
