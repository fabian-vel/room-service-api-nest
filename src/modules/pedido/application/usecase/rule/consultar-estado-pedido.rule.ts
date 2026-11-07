import { Injectable } from '@nestjs/common';
import type { ReglaNegocio } from '../../../../../shared/application/rule/regla-negocio.js';
import { BusinessException } from '../../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../../shared/domain/exception/not-found.exception.js';
import type { CambioEstadoContexto } from '../../../domain/model/cambio-estado-contexto.js';
import { EstadoPedidoRepository } from '../../../domain/port/estado-pedido.repository.js';

@Injectable()
export class ConsultarEstadoPedidoRule implements ReglaNegocio<CambioEstadoContexto> {
  readonly ruleId = 'CONSULTAR_ESTADO_PEDIDO';

  constructor(
    private readonly estadoPedidoRepository: EstadoPedidoRepository,
  ) {}

  async validar(contexto: CambioEstadoContexto): Promise<void> {
    const { pediId, espeIdDestino } = contexto.request;
    const actual =
      await this.estadoPedidoRepository.consultarEstadoActual(pediId);
    if (!actual) throw new NotFoundException('Pedido no encontrado');
    const destino =
      await this.estadoPedidoRepository.consultarEstado(espeIdDestino);
    if (!destino) throw new BusinessException('Estado de pedido no válido');
    contexto.response.actual = actual;
    contexto.response.destino = destino;
  }
}
