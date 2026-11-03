export interface LoginRequest {
  habitacion: string;
  codigo: string;
}

export interface TokenResponse {
  token: string;
  expiracion: string;
}
