import { NotFoundException as NestNotFoundException } from '@nestjs/common';
import { resolveError } from './global-exception.filter.js';
import { BusinessException } from './domain/exception/business.exception.js';
import { NotFoundException } from './domain/exception/not-found.exception.js';
import { InternalServerErrorException } from './domain/exception/internal-server-error.exception.js';
import { SqlLoadException } from './domain/exception/sql-load.exception.js';

describe('resolveError', () => {
  it.each([
    [new NotFoundException('no existe'), 404, 'NOT_FOUND', 'no existe'],
    [new BusinessException('regla'), 422, 'BUSINESS_ERROR', 'regla'],
    [
      new InternalServerErrorException('bd caida', new Error('x')),
      500,
      'INTERNAL_ERROR',
      'bd caida',
    ],
    [
      new SqlLoadException('querys/x.sql'),
      500,
      'CONFIG_ERROR',
      'Error de configuración interna',
    ],
    [
      new NestNotFoundException('Cannot GET /x'),
      404,
      'HTTP_ERROR',
      'Cannot GET /x',
    ],
    [
      new Error('detalle interno'),
      500,
      'INTERNAL_ERROR',
      'Error interno del servidor',
    ],
  ])('%s', (error, status, code, message) => {
    expect(resolveError(error)).toEqual({ status, code, message });
  });
});
