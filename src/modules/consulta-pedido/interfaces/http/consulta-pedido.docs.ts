import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

export const ConsultaPedidoDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Pedidos'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  porHabitacion: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Pedidos de la habitación del token (app)',
      }),
      ApiForbiddenResponse({
        description: 'El token no corresponde a una habitación',
      }),
    ),

  fechaActual: () =>
    applyDecorators(
      ApiOperation({ summary: 'Pedidos para el tablero de cocina' }),
    ),

  filtro: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Lista paginada de pedidos con filtros opcionales',
        description:
          'Sin filtros devuelve todos los pedidos, 20 por página, del más reciente al más antiguo.',
      }),
      ApiQuery({
        name: 'fechaDesde',
        required: false,
        type: 'string',
        description: 'YYYY-MM-DD',
      }),
      ApiQuery({
        name: 'fechaHasta',
        required: false,
        type: 'string',
        description: 'YYYY-MM-DD (incluye todo el día)',
      }),
      ApiQuery({
        name: 'estadoPedido',
        required: false,
        type: 'integer',
        description:
          'espe_id de mst_estados_pedido (1 pendiente, 2 en preparación, 3 entregado, 4 cancelado)',
      }),
      ApiQuery({
        name: 'habitacion',
        required: false,
        type: 'string',
        description: 'Número exacto de habitación',
      }),
      ApiQuery({
        name: 'producto',
        required: false,
        type: 'string',
        description: 'Parte del nombre de un producto del pedido',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        type: 'integer',
        description: 'Página, desde 1 (por defecto 1)',
      }),
      ApiQuery({
        name: 'size',
        required: false,
        type: 'integer',
        description: 'Tamaño de página, 1 a 100 (por defecto 20)',
      }),
      ApiUnprocessableEntityResponse({
        description:
          'Parámetro con formato inválido, página o tamaño fuera de rango, o fechaDesde mayor a fechaHasta',
      }),
    ),
};
