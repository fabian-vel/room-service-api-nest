import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

export const EmpleadoAuthDocs = {
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
        summary: 'Login de empleado',
        description:
          'Valida usuario y contraseña; devuelve el token del empleado (vence en 8 horas).',
      }),
      ApiBody({
        schema: { example: { usuario: 'cocina1', password: '********' } },
      }),
      ApiNotFoundResponse({ description: 'Credenciales inválidas (usuario)' }),
      ApiUnprocessableEntityResponse({
        description: 'Credenciales inválidas (contraseña)',
      }),
    ),
};
