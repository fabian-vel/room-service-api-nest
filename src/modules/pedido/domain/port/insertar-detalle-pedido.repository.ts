import type { DetallePedido } from '../model/pedido.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class InsertarDetallePedidoRepository {
  abstract insertarDetallePedido(
    detallePedidoList: DetallePedido[],
  ): Promise<void>;
}
