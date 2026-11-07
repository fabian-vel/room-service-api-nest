export interface EstadoPedido {
  espeId: number;
  espeLlaveMst: string;
  espeNombre: string;
}

export interface EstadoActualPedido {
  pediId: number;
  haacId: number;
  estado: EstadoPedido;
}
