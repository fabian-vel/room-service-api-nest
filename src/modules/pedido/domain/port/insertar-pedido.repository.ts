import type { Pedido } from '../model/pedido.js';

export abstract class InsertarPedidoRepository {
  abstract insertarPedido(pedido: Pedido): Promise<number>;
}
