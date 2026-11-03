export interface HabitacionAcceso {
  haacId: number;
  haacHabitacion: string;
  haacCodigo: string;
  haacClienteNombre: string;
  haacClienteDoc: string | null;
  haacFechaInicio: Date;
  haacFechaFin: Date;
  haacEstado: string;
}
