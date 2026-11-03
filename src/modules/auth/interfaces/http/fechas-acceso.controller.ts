import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { FechasAccesoUseCase } from '../../application/usecase/fechas-acceso.use-case.js';

@Controller('fechas-acceso')
export class FechasAccesoController {
  constructor(private readonly fechasAccesoUseCase: FechasAccesoUseCase) {}

  @Post()
  @HttpCode(200)
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
