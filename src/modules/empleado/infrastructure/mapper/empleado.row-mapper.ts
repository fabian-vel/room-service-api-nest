import type { EmpleadoMaestro } from '../../domain/model/empleado.js';

export function mapEmpleadoRow(row: Record<string, any>): EmpleadoMaestro {
  return {
    emplId: row.empl_id,
    emplUsuario: row.empl_usuario,
    emplNombre: row.empl_nombre,
    emplRol: row.empl_rol,
  };
}
