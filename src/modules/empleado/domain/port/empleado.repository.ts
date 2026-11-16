import type { EmpleadoGuardar, EmpleadoMaestro } from '../model/empleado.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class EmpleadoRepository {
  abstract consultarEmpleados(): Promise<EmpleadoMaestro[]>;
  /** emplPassword ya viene con hash; devuelve null si el usuario ya existe */
  abstract insertarEmpleado(empleado: EmpleadoGuardar): Promise<number | null>;
  abstract actualizarEmpleado(
    empleado: EmpleadoGuardar,
    usuarioSesion: string,
  ): Promise<number>;
  abstract eliminarEmpleado(
    emplId: number,
    usuarioSesion: string,
  ): Promise<number>;
}
