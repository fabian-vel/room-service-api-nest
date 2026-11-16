import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
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
        description:
          'Usa el acceso del token de habitación; el body se ignora (se acepta por compatibilidad con la app).',
      }),
      ApiNotFoundResponse({ description: 'Acceso no encontrado' }),
    ),
};
