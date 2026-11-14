import type { Reporte, ReporteFiltro } from '../model/reporte.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class ReporteRepository {
  abstract consultarReporte(filtro: ReporteFiltro): Promise<Reporte>;
}
