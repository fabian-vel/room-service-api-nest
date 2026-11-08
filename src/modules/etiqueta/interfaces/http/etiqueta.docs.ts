import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

const ejemplo = {
  etiqLlaveMst: 'ETIQ_PICANTE',
  etiqNombre: 'Picante',
  etiqDescripcion: 'Contiene picante',
};
const idInvalido = ApiBadRequestResponse({
  description: 'El id no es numérico',
});

export const EtiquetaDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Etiquetas'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  consultaPorFiltro: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Etiquetas de una categoría o de un item del menú',
        description:
          'Con consultaPorCategoria true filtra por mecaId; con false, por meitId.',
      }),
      ApiBody({
        schema: {
          example: { consultaPorCategoria: true, mecaId: 1, meitId: null },
        },
      }),
      ApiUnprocessableEntityResponse({
        description: 'Falta el mecaId o el meitId según el tipo de consulta',
      }),
    ),

  consultar: () =>
    applyDecorators(ApiOperation({ summary: 'Lista todas las etiquetas' })),

  insertar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Crea una etiqueta',
        description: 'Devuelve el id creado.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      ApiUnprocessableEntityResponse({
        description: 'Falta la llave o el nombre',
      }),
    ),

  actualizar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Actualiza una etiqueta',
        description: 'Devuelve las filas actualizadas.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: 'Falta la llave o el nombre, o la etiqueta no existe',
      }),
    ),

  eliminar: () =>
    applyDecorators(
      ApiOperation({ summary: 'Elimina una etiqueta' }),
      idInvalido,
      ApiUnprocessableEntityResponse({ description: 'Etiqueta no encontrada' }),
    ),
};
