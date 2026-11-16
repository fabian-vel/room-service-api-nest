import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

export const ReporteDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Reportes'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
    ),

  consultar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Reportes de un rango de fechas',
        description:
          'Ventas por día, los 10 ítems más vendidos, pedidos por estado y ventas por habitación. Ventas, ítems y habitaciones no cuentan los pedidos cancelados.',
      }),
      ApiQuery({
        name: 'fechaDesde',
        type: 'string',
        description: 'YYYY-MM-DD',
      }),
      ApiQuery({
        name: 'fechaHasta',
        type: 'string',
        description: 'YYYY-MM-DD (incluye todo el día)',
      }),
      ApiForbiddenResponse({
        description: 'El rol no tiene acceso a reportes',
      }),
      ApiUnprocessableEntityResponse({
        description:
          'Fecha ausente o con formato inválido, fechaDesde mayor a fechaHasta, o rango mayor a 366 días',
      }),
    ),
};
