import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import type { Pagina } from '../../../../shared/domain/model/pagina.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type {
  ConsultaPedido,
  ConsultaPedidoFiltro,
} from '../../domain/model/consulta-pedido.js';
import { ConsultaPedidoRepository } from '../../domain/port/consulta-pedido.repository.js';
import { mapConsultaPedidoRow } from '../mapper/consulta-pedido.row-mapper.js';

const MARCADOR_FILTROS = '/*FILTROS*/';

@Injectable()
export class ConsultaPedidoAdapter implements ConsultaPedidoRepository {
  private readonly sql = loadSql('querys/consulta_pedidos.sql');
  private readonly sqlFechaActual = loadSql(
    'querys/consulta-pedidos-actual.sql',
  );
  private readonly sqlFiltro = loadSql('querys/consulta-pedidos-filtro.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarPedidoPorUsuario(haacId: number): Promise<ConsultaPedido[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sql,
      { haacId },
      'Error al consultar pedidos en BD',
    );
    return rows.map(mapConsultaPedidoRow);
  }

  async consultarPedidoFechaActual(): Promise<ConsultaPedido[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlFechaActual,
      {},
      'Error al consultar pedidos por fecha actual en BD',
    );
    return rows.map(mapConsultaPedidoRow);
  }

  async consultarPedidoFiltro(
    filtro: ConsultaPedidoFiltro,
  ): Promise<Pagina<ConsultaPedido>> {
    // Solo se agregan al WHERE las condiciones de los filtros que llegan con valor
    const condiciones: string[] = [];
    const parametros: Record<string, unknown> = {
      limite: filtro.size,
      desplazamiento: (filtro.page - 1) * filtro.size,
    };

    if (filtro.fechaDesde) {
      condiciones.push('P.pedi_fecha_creacion >= CAST(:fechaDesde AS date)');
      parametros.fechaDesde = filtro.fechaDesde;
    }
    if (filtro.fechaHasta) {
      // menor al día siguiente para incluir todo el día de fechaHasta
      condiciones.push(
        "P.pedi_fecha_creacion < CAST(:fechaHasta AS date) + INTERVAL '1 day'",
      );
      parametros.fechaHasta = filtro.fechaHasta;
    }
    if (filtro.estadoPedido != null) {
      condiciones.push('P.pedi_estado_pedido = :estadoPedido');
      parametros.estadoPedido = filtro.estadoPedido;
    }
    if (filtro.habitacion) {
      condiciones.push('P.pedi_habitacion = :habitacion');
      parametros.habitacion = filtro.habitacion;
    }
    if (filtro.producto) {
      condiciones.push(`EXISTS (SELECT 1
                         FROM tbl_pedido_detalle PDF
                                  INNER JOIN tbl_menu_items MIF ON MIF.meit_id = PDF.meit_id
                         WHERE PDF.pedi_id = P.pedi_id
                           AND PDF.pede_estado = 'A'
                           AND PDF.pede_fecha_eliminacion IS NULL
                           AND MIF.meit_nombre ILIKE :producto)`);
      parametros.producto = `%${filtro.producto}%`;
    }

    const filtros = condiciones
      .map((condicion) => `  AND ${condicion}\n`)
      .join('');
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlFiltro.replace(MARCADOR_FILTROS, filtros),
      parametros,
      'Error al consultar pedidos con filtros en BD',
    );

    return {
      items: rows.map(mapConsultaPedidoRow),
      total: rows.length ? Number(rows[0].total_registros) : 0,
      page: filtro.page,
      pageSize: filtro.size,
    };
  }
}
