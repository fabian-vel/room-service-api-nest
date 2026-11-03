import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

/**
 * Excepción para recurso no encontrado
 * return error 404
 */
export class NotFoundException extends AppException {
  constructor(userMessage: string) {
    super(userMessage, HttpStatus.NOT_FOUND);
  }
}
