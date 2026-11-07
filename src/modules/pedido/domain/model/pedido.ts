// montos como texto decimal ("24000.00"), igual que numeric en la BD
export interface Pedido {
  haacId: number;
  habitacion: string;
  clienteNombre: string;
  estadoPedidoId: number;
  observacion: string | null;
  total: string;
}

export interface DetallePedido {
  pediId?: number;
  meitId: number;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  observacion: string | null;
}

/** Fila de inferir-datos-pedido.sql: datos de la habitación y precio de cada item pedido */
export interface DatosPedido {
  haacHabitacion: string;
  haacClienteNombre: string;
  meitId: number;
  meitPrecio: string | null;
  estadoPedidoId: number;
}

/** Body de POST /pedido */
export interface PedidoCriterio {
  observacion?: string | null;
  items: ItemPedido[];
}

export interface ItemPedido {
  meitId: number;
  cantidad: number;
  observacion?: string | null;
}
