export interface PedidoDetalle {
  meitId: number;
  meitNombre: string;
  pedeCantidad: number;
  pedeSubtotal: number;
  mecaParentId: number | null;
  mecaId: number | null;
  mecaNombre: string | null;
}

export interface ConsultaPedido {
  pediId: number;
  pediHabitacion: string;
  pediTotal: number;
  pediFechaCreacion: Date;
  pediObservacion: string | null;
  espeId: number;
  espeNombre: string;
  detallePedidoList: PedidoDetalle[];
}

export interface ConsultaPedidoFiltro {
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string; // YYYY-MM-DD
  estadoPedido?: number;
  habitacion?: string;
  producto?: string;
  page: number;
  size: number;
}
