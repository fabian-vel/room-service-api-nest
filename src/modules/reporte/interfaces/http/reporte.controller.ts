import { Controller, ForbiddenException, Get, Query } from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Claims } from '../../../../shared/security/claims.decorator.js';
import type { Claims as ClaimsToken } from '../../../../shared/security/jwt.service.js';
import { fecha } from '../../../../shared/util/query-param.util.js';
import { ReporteUseCase } from '../../application/usecase/reporte.use-case.js';
import { ReporteDocs } from './reporte.docs.js';

@ReporteDocs.controller()
@Controller('reportes')
export class ReporteController {
  constructor(private readonly reporteUseCase: ReporteUseCase) {}

  @Get()
  @ReporteDocs.consultar()
  async consultar(
    @Claims() claims: ClaimsToken,
    @Query() query: Record<string, unknown>,
  ) {
    // las ventas del hotel no las ve un huésped; el control por rol queda para 6P11
    if (!('rol' in claims))
      throw new ForbiddenException('El token no corresponde a un empleado');
    const reporte = await this.reporteUseCase.consultarReporte({
      fechaDesde: fecha(query, 'fechaDesde'),
      fechaHasta: fecha(query, 'fechaHasta'),
    });
    return ApiResponse.ok('Reporte consultado exitosamente', reporte);
  }
}
