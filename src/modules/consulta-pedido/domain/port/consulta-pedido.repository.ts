import type { Pagina } from '../../../../shared/domain/model/pagina.js';
import type {
  ConsultaPedido,
  ConsultaPedidoFiltro,
} from '../model/consulta-pedido.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class ConsultaPedidoRepository {
  abstract consultarPedidoPorUsuario(haacId: number): Promise<ConsultaPedido[]>;
  abstract consultarPedidoFechaActual(): Promise<ConsultaPedido[]>;
  abstract consultarPedidoFiltro(
    filtro: ConsultaPedidoFiltro,
  ): Promise<Pagina<ConsultaPedido>>;
}
