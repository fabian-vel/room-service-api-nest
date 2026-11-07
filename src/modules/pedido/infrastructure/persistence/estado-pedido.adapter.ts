import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type {
  EstadoActualPedido,
  EstadoPedido,
} from '../../domain/model/cambio-estado-contexto.js';
import { EstadoPedidoRepository } from '../../domain/port/estado-pedido.repository.js';

const mapEstado = (row: Record<string, any>): EstadoPedido => ({
  espeId: row.espe_id,
  espeLlaveMst: row.espe_llave_mst,
  espeNombre: row.espe_nombre,
});

@Injectable()
export class EstadoPedidoAdapter implements EstadoPedidoRepository {
  private readonly sqlEstadoActual = loadSql(
    'querys/consultar-estado-pedido.sql',
  );
  private readonly sqlEstadoDestino = loadSql(
    'querys/consultar-estado-pedido-destino.sql',
  );
  private readonly sqlActualizar = loadSql(
    'querys/actualizar-estado-pedido.sql',
  );

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarEstadoActual(
    pediId: number,
  ): Promise<EstadoActualPedido | null> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlEstadoActual,
      { pediId },
      'Error al consultar el estado del pedido en BD',
    );
    if (!rows.length) return null;
    return {
      pediId: Number(rows[0].pedi_id), // bigint: pg lo entrega como string
      haacId: Number(rows[0].haac_id),
      estado: mapEstado(rows[0]),
    };
  }

  async consultarEstado(espeId: number): Promise<EstadoPedido | null> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlEstadoDestino,
      { espeId },
      'Error al consultar el estado de pedido en BD',
    );
    return rows.length ? mapEstado(rows[0]) : null;
  }

  async actualizarEstado(pediId: number, espeId: number): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.sqlActualizar,
      { pediId, espeId },
      'Error al actualizar el estado del pedido en BD',
    );
    return rowCount ?? 0;
  }
}
