import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

export const AuthDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Auth'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
    ),

  login: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Login de la habitación',
        description:
          'Valida número de habitación y código de acceso; devuelve el token del huésped.',
      }),
      ApiBody({ schema: { example: { habitacion: '302', codigo: 'ABC123' } } }),
      ApiNotFoundResponse({ description: 'Habitación o código inválidos' }),
      ApiUnprocessableEntityResponse({
        description:
          'El acceso está inactivo, aún no está vigente o ha expirado',
      }),
    ),
};
