// la contraseña nunca sale del API
export interface EmpleadoMaestro {
  emplId: number;
  emplUsuario: string;
  emplNombre: string;
  emplRol: string;
}

export interface EmpleadoGuardar {
  emplId: number | null;
  emplUsuario: string;
  emplNombre: string;
  emplRol: string;
  // en la creación es obligatoria; al actualizar, null conserva la actual
  emplPassword: string | null;
}
