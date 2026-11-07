import { Injectable } from '@nestjs/common';
import type { ReglaNegocio } from '../../../../../shared/application/rule/regla-negocio.js';
import { BusinessException } from '../../../../../shared/domain/exception/business.exception.js';
import type { CambioEstadoContexto } from '../../../domain/model/cambio-estado-contexto.js';

// por llave (espe_llave_mst), no por id: entregado y cancelado son finales
export const TRANSICIONES: Record<string, string[]> = {
  ESTA_PEDI_PEND: ['ESTA_PEDI_PREP', 'ESTA_PEDI_CANC'],
  ESTA_PEDI_PREP: ['ESTA_PEDI_ENTR'],
  ESTA_PEDI_ENTR: [],
  ESTA_PEDI_CANC: [],
};

@Injectable()
export class ValidarTransicionEstadoRule implements ReglaNegocio<CambioEstadoContexto> {
  readonly ruleId = 'VALIDAR_TRANSICION_ESTADO';

  async validar(contexto: CambioEstadoContexto): Promise<void> {
    const { actual, destino } = contexto.response;
    if (!actual || !destino)
      throw new BusinessException('No se consultó el estado del pedido');
    const permitidos = TRANSICIONES[actual.estado.espeLlaveMst] ?? [];
    if (!permitidos.includes(destino.espeLlaveMst)) {
      throw new BusinessException(
        `No se puede pasar el pedido de "${actual.estado.espeNombre}" a "${destino.espeNombre}"`,
      );
    }
  }
}
