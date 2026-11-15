import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

const ejemplo = {
  meitNombre: 'Hamburguesa de la casa',
  meitDescripcion: 'Carne de res, queso y papas',
  meitPrecio: 32000,
  meitImagenUrl: 'https://ejemplo.com/hamburguesa.jpg',
  mecaId: 4,
  etiqIds: [5, 11],
};
const idInvalido = ApiBadRequestResponse({
  description: 'El id no es numérico',
});
const invalido =
  'Falta el nombre, el precio no es mayor a 0, falta la categoría o no es una subcategoría activa, o un texto supera su largo';

export const ItemMaestroDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Ítems del menú'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  consultar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Lista todos los ítems activos',
        description:
          'Con su categoría, categoría padre y etiquetas, ordenados por categoría y nombre.',
      }),
    ),

  insertar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Crea un ítem con sus etiquetas',
        description:
          'mecaId es la subcategoría; la categoría padre se toma de ella. Devuelve el id creado.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      ApiUnprocessableEntityResponse({ description: invalido }),
    ),

  actualizar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Actualiza un ítem y reemplaza sus etiquetas',
        description:
          'Las etiquetas quedan exactamente las de etiqIds. Devuelve las filas actualizadas.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: `${invalido}, o el ítem no existe`,
      }),
    ),

  eliminar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Elimina un ítem',
        description:
          'Borrado lógico: deja de salir en el menú; los pedidos anteriores lo conservan.',
      }),
      idInvalido,
      ApiUnprocessableEntityResponse({ description: 'Ítem no encontrado' }),
    ),
};
