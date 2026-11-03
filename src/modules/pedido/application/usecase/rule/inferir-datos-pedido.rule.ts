import { Injectable } from '@nestjs/common';
import type { ReglaNegocio } from '../../../../../shared/application/rule/regla-negocio.js';
import { BusinessException } from '../../../../../shared/domain/exception/business.exception.js';
import type { PedidoContexto } from '../../../domain/model/pedido-contexto.js';
import { InferirDatosPedidoRepository } from '../../../domain/port/inferir-datos-pedido.repository.js';

@Injectable()
export class InferirDatosPedidoRule implements ReglaNegocio<PedidoContexto> {
  readonly ruleId = 'INFERIR_DATOS_PEDIDO';

  constructor(
    private readonly inferirDatosPedidoRepository: InferirDatosPedidoRepository,
  ) {}

  async validar(contexto: PedidoContexto): Promise<void> {
    const { haacId, listItemId } = contexto.request;
    if (!listItemId.length || haacId == null) {
      throw new BusinessException(
        'Datos insuficientes para inferir información de pedido',
      );
    }
    contexto.response.listaDatosPedidos =
      await this.inferirDatosPedidoRepository.inferirDatosPedidos(
        haacId,
        listItemId,
      );
  }
}
