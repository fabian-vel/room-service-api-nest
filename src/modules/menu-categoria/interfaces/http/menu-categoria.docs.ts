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
  mecaLlaveMst: 'MECA_BEBIDAS',
  mecaNombre: 'Bebidas',
  mecaDescripcion: 'Bebidas frías y calientes',
  mecaImagenUrl: null,
  mecaParentId: null,
};
const idInvalido = ApiBadRequestResponse({
  description: 'El id no es numérico',
});

export const MenuCategoriaDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Categorías'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  consultar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Categorías con sus subcategorías (menú de la app)',
      }),
    ),

  consultarTodas: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Lista plana de categorías activas, con llave (maestro)',
      }),
    ),

  insertar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Crea una categoría',
        description:
          'mecaParentId la deja como subcategoría de otra. Devuelve el id creado.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      ApiUnprocessableEntityResponse({
        description: 'Falta la llave o el nombre',
      }),
    ),

  actualizar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Actualiza una categoría',
        description: 'Devuelve las filas actualizadas.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: 'Falta la llave o el nombre, o la categoría no existe',
      }),
    ),

  eliminar: () =>
    applyDecorators(
      ApiOperation({ summary: 'Elimina una categoría' }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: 'Categoría no encontrada',
      }),
    ),
};
