import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

const idInvalido = ApiBadRequestResponse({
  description: 'El id no es numérico',
});

export const FacturaDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Factura de la habitación'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
      ApiForbiddenResponse({
        description: 'Solo ADMIN, AUX_ADMIN y RECEPCION',
      }),
    ),

  buscar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Busca accesos de habitación con su saldo pendiente',
        description:
          'Con habitación devuelve sus accesos (el más reciente primero); sin habitación, solo los accesos que tienen saldo pendiente. Máximo 50.',
      }),
      ApiQuery({ name: 'habitacion', required: false, example: '302' }),
      ApiUnprocessableEntityResponse({
        description: 'La habitación tiene más de 10 caracteres',
      }),
    ),

  consultar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Factura de un acceso',
        description:
          'Acceso con su saldo, pedidos sin cancelados con su detalle (pagoId null = pendiente de cobro) y pagos registrados.',
      }),
      idInvalido,
      ApiNotFoundResponse({ description: 'El acceso no existe' }),
    ),

  cobrar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Registra el pago de los pedidos pendientes del acceso',
        description:
          'Cobra todos los pedidos sin pagar; el total lo calcula la BD. Los pedidos quedan marcados con el pago, así no se cobran dos veces. Devuelve el id del pago.',
      }),
      ApiBody({
        schema: {
          example: { pagoMetodo: 'EFECTIVO', pagoObservacion: 'Check-out' },
        },
      }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description:
          'Método de pago inválido, no hay pedidos pendientes o hay pedidos sin entregar',
      }),
    ),
};
