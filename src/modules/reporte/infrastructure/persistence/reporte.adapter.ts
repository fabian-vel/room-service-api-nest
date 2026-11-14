import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { Reporte, ReporteFiltro } from '../../domain/model/reporte.js';
import { ReporteRepository } from '../../domain/port/reporte.repository.js';

const LIMITE_ITEMS = 10;

@Injectable()
export class ReporteAdapter implements ReporteRepository {
  private readonly sqlVentasPorDia = loadSql(
    'querys/reporte-ventas-por-dia.sql',
  );
  private readonly sqlItemsMasVendidos = loadSql(
    'querys/reporte-items-mas-vendidos.sql',
  );
  private readonly sqlPedidosPorEstado = loadSql(
    'querys/reporte-pedidos-por-estado.sql',
  );
  private readonly sqlVentasPorHabitacion = loadSql(
    'querys/reporte-ventas-por-habitacion.sql',
  );

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarReporte(filtro: ReporteFiltro): Promise<Reporte> {
    const consultar = async (
      sql: string,
      extra: Record<string, unknown> = {},
    ) =>
      (
        await ejecutarSql(
          this.pool,
          sql,
          { ...filtro, ...extra },
          'Error al consultar el reporte en BD',
        )
      ).rows;

    const [dias, items, estados, habitaciones] = await Promise.all([
      consultar(this.sqlVentasPorDia),
      consultar(this.sqlItemsMasVendidos, { limite: LIMITE_ITEMS }),
      consultar(this.sqlPedidosPorEstado),
      consultar(this.sqlVentasPorHabitacion),
    ]);

    // COUNT y SUM llegan como texto desde pg (bigint y numeric)
    return {
      ventasPorDia: dias.map((r) => ({
        fecha: r.fecha,
        pedidos: Number(r.pedidos),
        total: Number(r.total),
      })),
      itemsMasVendidos: items.map((r) => ({
        meitId: r.meit_id,
        meitNombre: r.meit_nombre,
        cantidad: Number(r.cantidad),
        total: Number(r.total),
      })),
      pedidosPorEstado: estados.map((r) => ({
        espeId: r.espe_id,
        espeNombre: r.espe_nombre,
        pedidos: Number(r.pedidos),
        total: Number(r.total),
      })),
      ventasPorHabitacion: habitaciones.map((r) => ({
        habitacion: r.pedi_habitacion,
        pedidos: Number(r.pedidos),
        total: Number(r.total),
      })),
    };
  }
}
