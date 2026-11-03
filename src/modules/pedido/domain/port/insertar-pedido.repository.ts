import type { Pedido } from '../model/pedido.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class InsertarPedidoRepository {
  abstract insertarPedido(pedido: Pedido): Promise<number>;
}
