import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import type { Reporte, ReporteFiltro } from '../../domain/model/reporte.js';
import { ReporteRepository } from '../../domain/port/reporte.repository.js';

const MAX_DIAS = 366;
const MS_DIA = 24 * 60 * 60 * 1000;

@Injectable()
export class ReporteUseCase {
  constructor(private readonly reporteRepository: ReporteRepository) {}

  consultarReporte(filtro: Partial<ReporteFiltro>): Promise<Reporte> {
    const { fechaDesde, fechaHasta } = filtro;
    if (!fechaDesde || !fechaHasta) {
      throw new BusinessException('fechaDesde y fechaHasta son obligatorias');
    }
    // YYYY-MM-DD se compara bien como texto
    if (fechaDesde > fechaHasta) {
      throw new BusinessException(
        'La fecha inicial no puede ser mayor a la fecha final',
      );
    }
    const dias = (Date.parse(fechaHasta) - Date.parse(fechaDesde)) / MS_DIA + 1;
    if (dias > MAX_DIAS) {
      throw new BusinessException(
        `El rango no puede ser mayor a ${MAX_DIAS} días`,
      );
    }
    return this.reporteRepository.consultarReporte({ fechaDesde, fechaHasta });
  }
}
