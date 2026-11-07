import { Injectable } from '@nestjs/common';
import type { ReglaNegocio } from '../../../../../shared/application/rule/regla-negocio.js';
import { BusinessException } from '../../../../../shared/domain/exception/business.exception.js';
import type { CambioEstadoContexto } from '../../../domain/model/cambio-estado-contexto.js';
import { EstadoPedidoRepository } from '../../../domain/port/estado-pedido.repository.js';

@Injectable()
export class ActualizarEstadoPedidoRule implements ReglaNegocio<CambioEstadoContexto> {
  readonly ruleId = 'ACTUALIZAR_ESTADO_PEDIDO';

  constructor(
    private readonly estadoPedidoRepository: EstadoPedidoRepository,
  ) {}

  async validar(contexto: CambioEstadoContexto): Promise<void> {
    const { destino } = contexto.response;
    if (!destino)
      throw new BusinessException('No se consultó el estado destino');
    const rows = await this.estadoPedidoRepository.actualizarEstado(
      contexto.request.pediId,
      destino.espeId,
    );
    if (rows === 0) throw new BusinessException('Pedido no encontrado');
  }
}
