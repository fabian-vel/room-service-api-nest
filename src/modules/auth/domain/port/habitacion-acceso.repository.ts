import type { HabitacionAcceso } from '../model/habitacion-acceso.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class HabitacionAccesoRepository {
  /** null si no existe un acceso con esa habitación y código */
  abstract consultaHabitacionAcceso(
    habitacion: string,
    codigo: string,
  ): Promise<HabitacionAcceso | null>;
}
