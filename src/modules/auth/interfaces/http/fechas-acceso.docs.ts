import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

export const FechasAccesoDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Habitación'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  consultar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Fechas de vigencia del acceso a la habitación',
      }),
      ApiBody({ schema: { example: { haacId: 1 } } }),
      ApiNotFoundResponse({ description: 'Acceso no encontrado' }),
      ApiUnprocessableEntityResponse({
        description: 'El haacId es obligatorio',
      }),
    ),
};
