import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { fecha } from '../../../../shared/util/query-param.util.js';
import { ReporteUseCase } from '../../application/usecase/reporte.use-case.js';
import { ReporteDocs } from './reporte.docs.js';
import { Acceso } from '../../../../shared/security/acceso.js';

@ReporteDocs.controller()
@Acceso('REPORTES')
@Controller('reportes')
export class ReporteController {
  constructor(private readonly reporteUseCase: ReporteUseCase) {}

  @Get()
  @ReporteDocs.consultar()
  async consultar(@Query() query: Record<string, unknown>) {
    const reporte = await this.reporteUseCase.consultarReporte({
      fechaDesde: fecha(query, 'fechaDesde'),
      fechaHasta: fecha(query, 'fechaHasta'),
    });
    return ApiResponse.ok('Reporte consultado exitosamente', reporte);
  }
}
