import type { DatosPedido } from '../model/pedido.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class InferirDatosPedidoRepository {
  abstract inferirDatosPedidos(
    haacId: number,
    listItemId: number[],
  ): Promise<DatosPedido[]>;
}
