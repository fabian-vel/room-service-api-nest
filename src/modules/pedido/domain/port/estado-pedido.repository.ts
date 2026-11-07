import type {
  EstadoActualPedido,
  EstadoPedido,
} from '../model/cambio-estado-contexto.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class EstadoPedidoRepository {
  /** null si el pedido no existe; dentro de una transacción bloquea el pedido hasta el COMMIT */
  abstract consultarEstadoActual(
    pediId: number,
  ): Promise<EstadoActualPedido | null>;
  /** null si el estado no existe o está inactivo */
  abstract consultarEstado(espeId: number): Promise<EstadoPedido | null>;
  abstract actualizarEstado(pediId: number, espeId: number): Promise<number>;
}
