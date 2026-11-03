import type {
  DatosPedido,
  DetallePedido,
  Pedido,
  PedidoCriterio,
} from './pedido.js';

/** Estado que comparten las reglas de crear pedido: cada regla lee y completa una parte */
export interface PedidoContexto {
  request: {
    pedidoCriterio: PedidoCriterio;
    haacId: number;
    listItemId: number[];
    pedido?: Pedido;
    detallePedidoList?: DetallePedido[];
  };
  response: {
    listaDatosPedidos: DatosPedido[];
    pedidoId?: number;
  };
}
