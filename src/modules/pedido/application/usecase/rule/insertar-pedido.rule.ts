import { Injectable } from '@nestjs/common';
import type { ReglaNegocio } from '../../../../../shared/application/rule/regla-negocio.js';
import { BusinessException } from '../../../../../shared/domain/exception/business.exception.js';
import type { PedidoContexto } from '../../../domain/model/pedido-contexto.js';
import { InsertarPedidoRepository } from '../../../domain/port/insertar-pedido.repository.js';

@Injectable()
export class InsertarPedidoRule implements ReglaNegocio<PedidoContexto> {
  readonly ruleId = 'INSERTAR_PEDIDO';

  constructor(
    private readonly insertarPedidoRepository: InsertarPedidoRepository,
  ) {}

  async validar(contexto: PedidoContexto): Promise<void> {
    if (!contexto.request.pedido)
      throw new BusinessException('El pedido no puede ser nulo');
    contexto.response.pedidoId =
      await this.insertarPedidoRepository.insertarPedido(
        contexto.request.pedido,
      );
  }
}
