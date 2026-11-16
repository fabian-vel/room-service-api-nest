import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

const ejemplo = {
  emplUsuario: 'mesero2',
  emplNombre: 'Ana Pérez',
  emplRol: 'MESERO',
  emplPassword: '********',
};
const idInvalido = ApiBadRequestResponse({
  description: 'El id no es numérico',
});
const invalido =
  'Falta el nombre, el rol no existe, la contraseña no tiene entre 8 y 72 caracteres o un texto supera su largo';

export const EmpleadoDocs = {
  controller: () =>
    applyDecorators(
      ApiTags('Empleados'),
      ApiOkResponse({
        description: 'OK: { timestamp, status, message, data, size }',
      }),
      ApiUnauthorizedResponse({ description: 'Token ausente o inválido' }),
      ApiForbiddenResponse({ description: 'Solo el rol ADMIN' }),
    ),

  consultar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Lista los empleados activos',
        description: 'No devuelve la contraseña.',
      }),
    ),

  insertar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Crea un empleado',
        description:
          'Roles: ADMIN, AUX_ADMIN, RECEPCION, COCINA, MESERO. La contraseña se guarda con hash bcrypt. Devuelve el id creado.',
      }),
      ApiBody({ schema: { example: ejemplo } }),
      ApiUnprocessableEntityResponse({
        description: `${invalido}, falta el usuario o ya existe`,
      }),
    ),

  actualizar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Actualiza nombre, rol y contraseña de un empleado',
        description:
          'El usuario no cambia. Sin emplPassword se conserva la contraseña actual. Nadie puede quitarse a sí mismo el rol ADMIN.',
      }),
      ApiBody({ schema: { example: { ...ejemplo, emplUsuario: undefined } } }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: `${invalido}, el empleado no existe o intenta quitarse el rol ADMIN`,
      }),
    ),

  eliminar: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Elimina un empleado (borrado lógico)',
        description: 'Nadie puede eliminar su propio usuario.',
      }),
      idInvalido,
      ApiUnprocessableEntityResponse({
        description: 'El empleado no existe o es el usuario de la sesión',
      }),
    ),
};
