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

/** Estado que comparten las reglas de cambiar el estado de un pedido */
export interface CambioEstadoContexto {
  request: {
    pediId: number;
    espeIdDestino: number;
  };
  response: {
    actual?: EstadoActualPedido;
    destino?: EstadoPedido;
  };
}
