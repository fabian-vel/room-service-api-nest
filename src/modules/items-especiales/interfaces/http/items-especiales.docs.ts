import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const ItemsEspecialesDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Menú'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  consultar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Items destacados del Home de la app',
        description:
          'Los 5 más pedidos, los 5 más recientes y los recomendados por el chef (etiqueta de la constante CONST_ETIQ_RECOM_CHEF).',
      }),
    ),
};
