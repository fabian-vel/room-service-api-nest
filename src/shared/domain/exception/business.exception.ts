import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception.js';

/**
 * Excepción para regla de negocio violada
 * return error 422
 */
export class BusinessException extends AppException {
  constructor(userMessage: string) {
    super(userMessage, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}
