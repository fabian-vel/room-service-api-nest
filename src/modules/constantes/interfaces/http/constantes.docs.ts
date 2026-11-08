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
  consLlave: 'CONST_EJEMPLO',
  consValor: '10',
  consDescripcion: 'Descripción',
};
const idInvalido = ApiBadRequestResponse({
  description: 'El id no es numérico',
});

export const ConstantesDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Constantes'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  consultar: () =>
    applyDecorators(ApiOperation({ summary: 'Lista todas las constantes' })),

  insertar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Crea una constante',
        description: 'Devuelve el id creado.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      ApiUnprocessableEntityResponse({
        description: 'Falta la llave o el valor',
      }),
    ),

  actualizar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Actualiza una constante',
        description: 'Devuelve las filas actualizadas.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: 'Falta la llave o el valor, o la constante no existe',
      }),
    ),

  eliminar: () =>
    applyDecorators(
      ApiOperation({ summary: 'Elimina una constante' }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: 'Constante no encontrada',
      }),
    ),
};
