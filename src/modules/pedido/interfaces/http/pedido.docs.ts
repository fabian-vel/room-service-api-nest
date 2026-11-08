import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

export const PedidoDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Pedidos'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  crear: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Crea un pedido de la habitación',
        description:
          'Los precios y el total se toman de la BD, no del body. Avisa a la cocina por WebSocket (CREATED).',
      }),
      ApiBody({
        schema: {
          example: {
            observacion: 'Sin cebolla',
            items: [
              { meitId: 1, cantidad: 2, observacion: null },
              { meitId: 12, cantidad: 1, observacion: 'Bien frío' },
            ],
          },
        },
      }),
      ApiForbiddenResponse({
        description: 'El token no corresponde a una habitación',
      }),
      ApiUnprocessableEntityResponse({
        description:
          'Items vacíos o inválidos, o algún item sin precio o no disponible',
      }),
    ),

  cambiarEstado: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Cambia el estado de un pedido (cocina)',
        description:
          'estadoPedido es el espe_id destino. Transiciones: pendiente → en preparación o cancelado; en preparación → entregado. Avisa por WebSocket (STATUS_CHANGED).',
      }),
      ApiBody({ schema: { example: { estadoPedido: 2 } } }),
      ApiBadRequestResponse({ description: 'El id no es numérico' }),
      ApiForbiddenResponse({
        description: 'Solo un empleado puede cambiar el estado del pedido',
      }),
      ApiNotFoundResponse({ description: 'Pedido no encontrado' }),
      ApiUnprocessableEntityResponse({
        description:
          'Estado obligatorio o no válido, o transición no permitida',
      }),
    ),
};
