import type { Empleado } from '../model/empleado.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class EmpleadoRepository {
  /** null si no existe un empleado activo con ese usuario */
  abstract findByUsuario(usuario: string): Promise<Empleado | null>;
}
