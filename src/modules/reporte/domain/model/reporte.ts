export interface ReporteFiltro {
  fechaDesde: string; // YYYY-MM-DD
  fechaHasta: string; // YYYY-MM-DD, incluye todo el día
}

export interface VentaPorDia {
  fecha: string; // YYYY-MM-DD
  pedidos: number;
  total: number;
}

export interface ItemVendido {
  meitId: number;
  meitNombre: string;
  cantidad: number;
  total: number;
}

export interface PedidosPorEstado {
  espeId: number;
  espeNombre: string;
  pedidos: number;
  total: number;
}

export interface VentaPorHabitacion {
  habitacion: string;
  pedidos: number;
  total: number;
}

// ventas, ítems y habitaciones no cuentan los pedidos cancelados; pedidosPorEstado sí
export interface Reporte {
  ventasPorDia: VentaPorDia[];
  itemsMasVendidos: ItemVendido[];
  pedidosPorEstado: PedidosPorEstado[];
  ventasPorHabitacion: VentaPorHabitacion[];
}
