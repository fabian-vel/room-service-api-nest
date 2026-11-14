import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import type { ReporteRepository } from '../../domain/port/reporte.repository.js';
import { ReporteUseCase } from './reporte.use-case.js';

describe('ReporteUseCase', () => {
  const vacio = {
    ventasPorDia: [],
    itemsMasVendidos: [],
    pedidosPorEstado: [],
    ventasPorHabitacion: [],
  };
  const repo = { consultarReporte: vi.fn().mockResolvedValue(vacio) };
  const useCase = new ReporteUseCase(repo as unknown as ReporteRepository);

  beforeEach(() => repo.consultarReporte.mockClear());

  it('consulta con el rango recibido', async () => {
    const filtro = { fechaDesde: '2026-01-01', fechaHasta: '2026-12-31' };
    await expect(useCase.consultarReporte(filtro)).resolves.toBe(vacio);
    expect(repo.consultarReporte).toHaveBeenCalledWith(filtro);
  });

  it.each([
    [{ fechaHasta: '2026-01-31' }, 'obligatorias'],
    [{ fechaDesde: '2026-01-01' }, 'obligatorias'],
    [
      { fechaDesde: '2026-02-01', fechaHasta: '2026-01-31' },
      'mayor a la fecha final',
    ],
    [
      { fechaDesde: '2025-01-01', fechaHasta: '2026-01-02' },
      'mayor a 366 días',
    ],
  ])('rechaza %o', (filtro, mensaje) => {
    expect(() => useCase.consultarReporte(filtro)).toThrow(BusinessException);
    expect(() => useCase.consultarReporte(filtro)).toThrow(mensaje);
    expect(repo.consultarReporte).not.toHaveBeenCalled();
  });
});
