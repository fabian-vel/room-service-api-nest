import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

// clase abstracta (como PasswordEncoder de Spring) para poder reemplazarla en pruebas
export abstract class PasswordEncoder {
  abstract matches(
    rawPassword: string,
    encodedPassword: string,
  ): Promise<boolean>;
}

/** Lee los hash $2a$ que generó BCryptPasswordEncoder en el API Java */
@Injectable()
export class BcryptPasswordEncoder implements PasswordEncoder {
  matches(rawPassword: string, encodedPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, encodedPassword);
  }
}
