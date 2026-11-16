import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { ROLES } from '../../../../shared/security/acceso.js';
import { PasswordEncoder } from '../../../../shared/security/password-encoder.js';
import { esTextoVacio } from '../../../../shared/util/validacion.util.js';
import type {
  EmpleadoGuardar,
  EmpleadoMaestro,
} from '../../domain/model/empleado.js';
import { EmpleadoRepository } from '../../domain/port/empleado.repository.js';

const USUARIO = /^[A-Za-z0-9._-]+$/;
// bcrypt solo usa los primeros 72 bytes
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;

@Injectable()
export class EmpleadoUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository,
    private readonly passwordEncoder: PasswordEncoder,
  ) {}

  consultarEmpleados(): Promise<EmpleadoMaestro[]> {
    return this.empleadoRepository.consultarEmpleados();
  }

  async insertarEmpleado(datos: Partial<EmpleadoGuardar>): Promise<number> {
    const empleado = validarEmpleado(datos, true);
    const emplId = await this.empleadoRepository.insertarEmpleado({
      ...empleado,
      emplPassword: await this.passwordEncoder.encode(empleado.emplPassword!),
    });
    if (emplId == null) throw new BusinessException('El usuario ya existe');
    return emplId;
  }

  async actualizarEmpleado(
    datos: Partial<EmpleadoGuardar>,
    usuarioSesion: string,
  ): Promise<number> {
    if (!Number.isInteger(datos.emplId))
      throw new BusinessException('El id del empleado es obligatorio');
    const empleado = validarEmpleado(datos, false);
    const filas = await this.empleadoRepository.actualizarEmpleado(
      {
        ...empleado,
        emplPassword: empleado.emplPassword
          ? await this.passwordEncoder.encode(empleado.emplPassword)
          : null,
      },
      usuarioSesion,
    );
    if (filas === 0)
      throw new BusinessException(
        'Empleado no encontrado, o intenta quitarse a sí mismo el rol ADMIN',
      );
    return filas;
  }

  async eliminarEmpleado(
    emplId: number,
    usuarioSesion: string,
  ): Promise<number> {
    const filas = await this.empleadoRepository.eliminarEmpleado(
      emplId,
      usuarioSesion,
    );
    if (filas === 0)
      throw new BusinessException(
        'Empleado no encontrado, o intenta eliminar su propio usuario',
      );
    return filas;
  }
}

/** Valida y normaliza lo que llega del cliente; al actualizar, el usuario no cambia y la contraseña es opcional */
export function validarEmpleado(
  datos: Partial<EmpleadoGuardar>,
  nuevo: boolean,
): EmpleadoGuardar {
  const usuario =
    typeof datos.emplUsuario === 'string' ? datos.emplUsuario.trim() : '';
  if (nuevo) {
    if (!usuario) throw new BusinessException('El usuario es obligatorio');
    if (usuario.length > 50)
      throw new BusinessException(
        'El usuario no puede tener más de 50 caracteres',
      );
    if (!USUARIO.test(usuario))
      throw new BusinessException(
        'El usuario solo puede tener letras, números, punto, guion y guion bajo',
      );
  }

  if (esTextoVacio(datos.emplNombre))
    throw new BusinessException('El nombre del empleado es obligatorio');
  const nombre = datos.emplNombre!.trim();
  if (nombre.length > 100)
    throw new BusinessException(
      'El nombre no puede tener más de 100 caracteres',
    );

  if (!ROLES.includes(datos.emplRol as (typeof ROLES)[number]))
    throw new BusinessException(`El rol debe ser uno de: ${ROLES.join(', ')}`);

  const password = datos.emplPassword ?? null;
  if (password !== null && typeof password !== 'string')
    throw new BusinessException('La contraseña no es válida');
  if (nuevo || password)
    if (
      !password ||
      password.length < PASSWORD_MIN ||
      Buffer.byteLength(password) > PASSWORD_MAX
    )
      throw new BusinessException(
        `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`,
      );

  return {
    emplId: datos.emplId ?? null,
    emplUsuario: usuario,
    emplNombre: nombre,
    emplRol: datos.emplRol!,
    emplPassword: password || null,
  };
}
