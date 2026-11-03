import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../shared/domain/exception/not-found.exception.js';
import { JwtService } from '../../../../shared/security/jwt.service.js';
import type { HabitacionAcceso } from '../../domain/model/habitacion-acceso.js';
import type {
  LoginRequest,
  TokenResponse,
} from '../../domain/model/login-request.js';
import { HabitacionAccesoRepository } from '../../domain/port/habitacion-acceso.repository.js';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly accesoRepository: HabitacionAccesoRepository,
    private readonly jwtService: JwtService,
  ) {}

  async ejecutar(request: LoginRequest): Promise<TokenResponse> {
    const acceso = await this.accesoRepository.consultaHabitacionAcceso(
      request.habitacion,
      request.codigo,
    );
    if (!acceso) throw new NotFoundException('Habitación o código inválidos');
    this.validar(acceso);

    return {
      token: this.jwtService.generarToken(
        {
          sub: acceso.haacHabitacion,
          clienteNombre: acceso.haacClienteNombre,
          accesoId: acceso.haacId,
        },
        acceso.haacFechaFin,
      ),
      expiracion: acceso.haacFechaFin.toISOString(),
    };
  }

  private validar(acceso: HabitacionAcceso) {
    const ahora = new Date();
    if (acceso.haacEstado !== 'A')
      throw new BusinessException('El acceso está inactivo');
    if (ahora < acceso.haacFechaInicio)
      throw new BusinessException('El acceso aún no está vigente');
    if (ahora > acceso.haacFechaFin)
      throw new BusinessException('El acceso ha expirado');
  }
}
