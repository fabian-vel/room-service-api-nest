import { Controller, ForbiddenException, HttpCode, Post } from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Claims } from '../../../../shared/security/claims.decorator.js';
import type { Claims as ClaimsToken } from '../../../../shared/security/jwt.service.js';
import { FechasAccesoUseCase } from '../../application/usecase/fechas-acceso.use-case.js';
import { FechasAccesoDocs } from './fechas-acceso.docs.js';
import { Acceso, HABITACION } from '../../../../shared/security/acceso.js';

@FechasAccesoDocs.controller()
@Acceso(HABITACION)
@Controller('fechas-acceso')
export class FechasAccesoController {
  constructor(private readonly fechasAccesoUseCase: FechasAccesoUseCase) {}

  // el acceso sale del token: el haacId que todavía manda la app en el body se ignora
  @Post()
  @HttpCode(200)
  @FechasAccesoDocs.consultar()
  async consultaFechasAcceso(@Claims() claims: ClaimsToken) {
    if (!('accesoId' in claims))
      throw new ForbiddenException('El token no corresponde a una habitación');
    const fechas = await this.fechasAccesoUseCase.consultaFechaAcceso(
      claims.accesoId,
    );
    return ApiResponse.ok(
      'Fechas de acceso consultadas exitosamente',
      fechas,
      1,
    );
  }
}
