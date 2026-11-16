export interface AccesoHabitacion {
  haacId: number;
  haacHabitacion: string;
  haacCodigo: string;
  haacClienteNombre: string;
  haacClienteDoc: string | null;
  haacFechaInicio: Date;
  haacFechaFin: Date;
  // A: activo; I: finalizado (check-out)
  haacEstado: string;
}

export interface AccesoGuardar {
  haacId: number | null;
  // al actualizar no se usa: la habitación no cambia
  haacHabitacion: string;
  haacClienteNombre: string;
  haacClienteDoc: string | null;
  haacFechaInicio: Date;
  haacFechaFin: Date;
}

/** Lo que llega del cliente, sin validar */
export type AccesoRequest = Partial<Record<keyof AccesoGuardar, unknown>>;

/** Respuesta al crear o renovar el código: recepción se lo entrega al huésped */
export interface CodigoAcceso {
  haacId: number;
  haacCodigo: string;
}
