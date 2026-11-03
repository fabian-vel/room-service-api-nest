import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../shared/domain/exception/not-found.exception.js';
import { JwtService } from '../../../../shared/security/jwt.service.js';
import { PasswordEncoder } from '../../../../shared/security/password-encoder.js';
import type {
  EmpleadoLoginRequest,
  EmpleadoLoginResponse,
} from '../../domain/model/empleado.js';
import { EmpleadoRepository } from '../../domain/port/empleado.repository.js';

@Injectable()
export class LoginEmpleadoUseCase {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository,
    private readonly jwtService: JwtService,
    private readonly passwordEncoder: PasswordEncoder,
  ) {}

  async ejecutar(
    request: EmpleadoLoginRequest,
  ): Promise<EmpleadoLoginResponse> {
    const empleado = await this.empleadoRepository.findByUsuario(
      request.usuario,
    );
    if (!empleado) throw new NotFoundException('Credenciales inválidas');

    // una contraseña que no es texto se rechaza igual que una incorrecta (en Java terminaba en 500)
    const valida =
      typeof request.password === 'string' &&
      (await this.passwordEncoder.matches(
        request.password,
        empleado.emplPassword,
      ));
    if (!valida) throw new BusinessException('Credenciales inválidas');

    return {
      token: this.jwtService.generarTokenEmpleado({
        sub: empleado.emplUsuario,
        nombre: empleado.emplNombre,
        rol: empleado.emplRol,
      }),
      nombre: empleado.emplNombre,
      rol: empleado.emplRol,
    };
  }
}
