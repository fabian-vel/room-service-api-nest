import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

/**
 * Error de conexión a servidores (BD, red, SQL, etc.)
 * return error 500
 */
export class InternalServerErrorException extends AppException {
  constructor(userMessage: string, cause?: unknown) {
    super(userMessage, HttpStatus.INTERNAL_SERVER_ERROR, { cause });
  }
}
