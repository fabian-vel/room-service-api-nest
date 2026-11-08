import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

export const MenuItemDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Menú'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  consultarPorCategoria: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Items del menú de una categoría, con sus etiquetas',
      }),
      ApiBody({ schema: { example: { mecaId: 1 } } }),
      ApiUnprocessableEntityResponse({
        description: 'El mecaId es obligatorio',
      }),
    ),
};
