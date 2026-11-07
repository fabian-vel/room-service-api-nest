import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import type { EstadoPedido } from '../../domain/model/estado-pedido.js';

// por llave (espe_llave_mst), no por id: entregado y cancelado son finales
export const TRANSICIONES: Record<string, string[]> = {
  ESTA_PEDI_PEND: ['ESTA_PEDI_PREP', 'ESTA_PEDI_CANC'],
  ESTA_PEDI_PREP: ['ESTA_PEDI_ENTR'],
  ESTA_PEDI_ENTR: [],
  ESTA_PEDI_CANC: [],
};

export function validarTransicion(actual: EstadoPedido, destino: EstadoPedido) {
  const permitidos = TRANSICIONES[actual.espeLlaveMst] ?? [];
  if (!permitidos.includes(destino.espeLlaveMst)) {
    throw new BusinessException(
      `No se puede pasar el pedido de "${actual.espeNombre}" a "${destino.espeNombre}"`,
    );
  }
}
