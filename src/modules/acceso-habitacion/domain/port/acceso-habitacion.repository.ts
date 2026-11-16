import type {
  AccesoGuardar,
  AccesoHabitacion,
} from '../model/acceso-habitacion.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class AccesoHabitacionRepository {
  /** Con habitación, su historial; sin habitación, los activos que no han vencido */
  abstract consultarAccesos(
    habitacion: string | null,
  ): Promise<AccesoHabitacion[]>;
  /** null si no existe; incluye finalizados y vencidos */
  abstract consultarAcceso(haacId: number): Promise<AccesoHabitacion | null>;
  /** true si otro acceso activo de la habitación se cruza con el rango */
  abstract existeTraslape(
    acceso: AccesoGuardar,
    excluirId: number | null,
  ): Promise<boolean>;
  abstract codigoDisponible(codigo: string): Promise<boolean>;
  abstract insertarAcceso(
    acceso: AccesoGuardar,
    codigo: string,
  ): Promise<number>;
  /** Solo accesos activos; devuelve las filas actualizadas */
  abstract actualizarAcceso(acceso: AccesoGuardar): Promise<number>;
  abstract cambiarCodigo(haacId: number, codigo: string): Promise<number>;
  abstract finalizarAcceso(haacId: number): Promise<number>;
}
