import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { FechasAccesoUseCase } from '../../application/usecase/fechas-acceso.use-case.js';
import { FechasAccesoDocs } from './fechas-acceso.docs.js';

@FechasAccesoDocs.controller()
@Controller('fechas-acceso')
export class FechasAccesoController {
  constructor(private readonly fechasAccesoUseCase: FechasAccesoUseCase) {}

  @Post()
  @HttpCode(200)
  @FechasAccesoDocs.consultar()
  async consultaFechasAcceso(@Body() request: { haacId?: number }) {
    const fechas = await this.fechasAccesoUseCase.consultaFechaAcceso(
      request.haacId,
    );
    return ApiResponse.ok(
      'Fechas de acceso consultadas exitosamente',
      fechas,
      1,
    );
  }
}
