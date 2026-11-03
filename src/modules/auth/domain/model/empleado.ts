export interface Empleado {
  emplId: number;
  emplUsuario: string;
  emplPassword: string;
  emplNombre: string;
  emplRol: string;
}

export interface EmpleadoLoginRequest {
  usuario: string;
  password: string;
}

export interface EmpleadoLoginResponse {
  token: string;
  nombre: string;
  rol: string;
}
