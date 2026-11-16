import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

const ejemplo = {
  haacHabitacion: '302',
  haacClienteNombre: 'Juan Pérez',
  haacClienteDoc: '1020304050',
  haacFechaInicio: '2026-11-16T15:00:00-05:00',
  haacFechaFin: '2026-11-18T12:00:00-05:00',
};
const idInvalido = ApiBadRequestResponse({
  description: 'El id no es numérico',
});
const invalido =
  'Falta el nombre, una fecha no es válida, la fecha de fin no es posterior a la de inicio, un texto supera su largo o la habitación ya tiene un acceso activo que se cruza con esas fechas';

export const AccesoHabitacionDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Registro de huéspedes'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
      ApiForbiddenResponse({
        description: 'Solo ADMIN, AUX_ADMIN y RECEPCION',
      }),
    ),

  consultar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Lista accesos de habitación',
        description:
          'Con habitación devuelve su historial (incluye finalizados y vencidos); sin habitación, los accesos activos que no han vencido. Máximo 100, el más reciente primero.',
      }),
      ApiQuery({ name: 'habitacion', required: false, example: '302' }),
    ),

  registrar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Registra un huésped (crea el acceso)',
        description:
          'El API genera el código de acceso (6 caracteres) y lo devuelve: { haacId, haacCodigo }. Fechas en ISO 8601 con zona horaria.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      ApiUnprocessableEntityResponse({
        description: `${invalido}, falta la habitación o la fecha de fin ya pasó`,
      }),
    ),

  actualizar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Actualiza el huésped y las fechas del acceso',
        description:
          'Sirve para extender o acortar la estadía. La habitación no cambia; un acceso finalizado no se edita.',
      }),
      ApiBody({
        schema: { example: { ...ejemplo, haacHabitacion: undefined } },
      }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: `${invalido}, o el acceso no existe o está finalizado`,
      }),
    ),

  renovarCodigo: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Genera un código de acceso nuevo',
        description:
          'El código anterior deja de servir para iniciar sesión. Devuelve { haacId, haacCodigo }.',
      }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: 'El acceso no existe o está finalizado',
      }),
    ),

  finalizar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Finaliza el acceso (check-out)',
        description:
          'El acceso queda inactivo y vence ya: el huésped no puede iniciar sesión ni hacer pedidos. Sigue disponible para la factura.',
      }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: 'El acceso no existe o ya está finalizado',
      }),
    ),
};
