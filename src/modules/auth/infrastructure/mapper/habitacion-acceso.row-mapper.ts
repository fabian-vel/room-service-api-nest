import type { HabitacionAcceso } from '../../domain/model/habitacion-acceso.js';

export function mapHabitacionAccesoRow(
  row: Record<string, any>,
): HabitacionAcceso {
  return {
    haacId: Number(row.haac_id), // bigint: pg lo entrega como string
    haacHabitacion: row.haac_habitacion,
    haacCodigo: row.haac_codigo,
    haacClienteNombre: row.haac_cliente_nombre,
    haacClienteDoc: row.haac_cliente_doc ?? null,
    haacFechaInicio: row.haac_fecha_inicio,
    haacFechaFin: row.haac_fecha_fin,
    haacEstado: row.haac_estado,
  };
}
