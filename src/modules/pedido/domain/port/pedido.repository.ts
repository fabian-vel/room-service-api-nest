import type {
  EstadoActualPedido,
  EstadoPedido,
} from '../model/estado-pedido.js';
import type { DatosPedido, DetallePedido, Pedido } from '../model/pedido.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class PedidoRepository {
  /** Datos de la habitación y precio de cada item pedido */
  abstract inferirDatosPedidos(
    haacId: number,
    listItemId: number[],
  ): Promise<DatosPedido[]>;
  /** Devuelve el pedi_id creado */
  abstract insertarPedido(pedido: Pedido): Promise<number>;
  abstract insertarDetallePedido(
    detallePedidoList: DetallePedido[],
  ): Promise<void>;
  /** null si el pedido no existe; dentro de una transacción bloquea el pedido hasta el COMMIT */
  abstract consultarEstadoActual(
    pediId: number,
  ): Promise<EstadoActualPedido | null>;
  /** null si el estado no existe o está inactivo */
  abstract consultarEstado(espeId: number): Promise<EstadoPedido | null>;
  abstract actualizarEstado(pediId: number, espeId: number): Promise<number>;
}
