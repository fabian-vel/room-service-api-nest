import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

// jjwt (API Java) firma con HS384 porque el secreto tiene 384 bits; se usa el mismo para
// que los tokens sirvan en ambos APIs mientras conviven
const ALGORITMO = 'HS384';

export interface ClaimsHabitacion {
  sub: string; // habitación
  clienteNombre: string;
  accesoId: number;
}

export interface ClaimsEmpleado {
  sub: string; // usuario
  nombre: string;
  rol: string;
}

export type Claims = (ClaimsHabitacion | ClaimsEmpleado) & {
  iat: number;
  exp: number;
};

@Injectable()
export class JwtService {
  private get secret(): string {
    const secret = process.env.JWT_SECRET;
    // HS384 necesita al menos 384 bits; también detecta un secreto truncado (p. ej. por un '#' sin comillas en .env)
    if (!secret || Buffer.byteLength(secret) * 8 < 384) {
      throw new Error(
        'JWT_SECRET no está configurado o tiene menos de 384 bits (48 caracteres)',
      );
    }
    return secret;
  }

  generarToken(claims: ClaimsHabitacion, expiracion: Date): string {
    return jwt.sign(
      { ...claims, exp: Math.floor(expiracion.getTime() / 1000) },
      this.secret,
      {
        algorithm: ALGORITMO,
      },
    );
  }

  generarTokenEmpleado(claims: ClaimsEmpleado): string {
    return jwt.sign(claims, this.secret, {
      algorithm: ALGORITMO,
      expiresIn: '8h',
    });
  }

  /** Lanza error si el token es inválido, expiró o no fue firmado con HS384 */
  validarToken(token: string): Claims {
    return jwt.verify(token, this.secret, {
      algorithms: [ALGORITMO],
    }) as Claims;
  }
}
