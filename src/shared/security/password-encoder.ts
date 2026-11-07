import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

// clase abstracta para poder reemplazarla en pruebas
export abstract class PasswordEncoder {
  abstract matches(
    rawPassword: string,
    encodedPassword: string,
  ): Promise<boolean>;
}

/** Valida contraseñas contra hash bcrypt ($2a$, el formato de tbl_empleados) */
@Injectable()
export class BcryptPasswordEncoder implements PasswordEncoder {
  matches(rawPassword: string, encodedPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, encodedPassword);
  }
}
