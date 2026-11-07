import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { AppException } from './domain/exception/app.exception.js';
import { BusinessException } from './domain/exception/business.exception.js';
import { InternalServerErrorException } from './domain/exception/internal-server-error.exception.js';
import { NotFoundException } from './domain/exception/not-found.exception.js';
import { SqlLoadException } from './domain/exception/sql-load.exception.js';
import { ErrorMessages } from './constant/error-messages.js';

interface ErrorDescriptor {
  status: number;
  code: string;
  message: string;
}

export function resolveError(error: unknown): ErrorDescriptor {
  if (error instanceof NotFoundException)
    return {
      status: HttpStatus.NOT_FOUND,
      code: 'NOT_FOUND',
      message: error.userMessage,
    };
  if (error instanceof BusinessException)
    return {
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      code: 'BUSINESS_ERROR',
      message: error.userMessage,
    };
  if (error instanceof InternalServerErrorException)
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: error.userMessage,
    };
  if (error instanceof SqlLoadException)
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'CONFIG_ERROR',
      message: ErrorMessages.CONFIG_ERROR,
    };
  if (error instanceof AppException)
    return {
      status: error.httpStatus,
      code: 'APP_ERROR',
      message: error.userMessage,
    };
  // errores propios de Nest (ruta inexistente, validación de DTOs, 401 del guard...) conservan su status
  if (error instanceof HttpException)
    return {
      status: error.getStatus(),
      code: 'HTTP_ERROR',
      message: error.message,
    };
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: ErrorMessages.INTERNAL_ERROR,
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const path = request.originalUrl.split('?')[0]; // path completo, sin query
    const response = ctx.getResponse<Response>();
    if (response.headersSent) return;

    const descriptor = resolveError(error);
    const correlationId = randomUUID();
    this.logger.error(
      `[${correlationId}][${descriptor.code}] ${error instanceof Error ? error.message : String(error)} - path=${path}`,
      error instanceof Error ? error.stack : undefined,
    );

    response.status(descriptor.status).json({
      timestamp: new Date().toISOString(),
      status: descriptor.status,
      code: descriptor.code,
      message: descriptor.message,
      path: path,
      correlationId, // el front lo muestra al usuario
    });
  }
}
