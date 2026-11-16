export const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

export interface AccesoFactura {
  haacId: number;
  haacHabitacion: string;
  haacClienteNombre: string;
  haacClienteDoc: string | null;
  haacFechaInicio: Date;
  haacFechaFin: Date;
  totalPendiente: number;
  pedidosSinEntregar: number;
}

export interface DetalleFactura {
  meitNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  observacion: string | null;
}

export interface PedidoFactura {
  pediId: number;
  pediFechaCreacion: Date;
  pediTotal: number;
  // null: pendiente de cobro
  pagoId: number | null;
  espeNombre: string;
  espeLlaveMst: string;
  detalle: DetalleFactura[];
}

export interface PagoFactura {
  pagoId: number;
  pagoTotal: number;
  pagoMetodo: string;
  pagoObservacion: string | null;
  pagoFechaCreacion: Date;
  emplNombre: string;
}

export interface Factura {
  acceso: AccesoFactura;
  pedidos: PedidoFactura[];
  pagos: PagoFactura[];
}

export interface PagoRequest {
  pagoMetodo?: unknown;
  pagoObservacion?: unknown;
}

export interface PagoNuevo {
  haacId: number;
  usuario: string;
  metodo: string;
  observacion: string | null;
  pediIds: number[];
}
