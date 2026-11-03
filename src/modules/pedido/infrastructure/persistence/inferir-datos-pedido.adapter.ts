import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { DatosPedido } from '../../domain/model/pedido.js';
import { InferirDatosPedidoRepository } from '../../domain/port/inferir-datos-pedido.repository.js';

@Injectable()
export class InferirDatosPedidoAdapter implements InferirDatosPedidoRepository {
  private readonly sql = loadSql('querys/inferir-datos-pedido.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async inferirDatosPedidos(
    haacId: number,
    listItemId: number[],
  ): Promise<DatosPedido[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sql,
      { haacId, meitIds: listItemId },
      'Error al inferir datos de pedidos en BD',
    );
    return rows.map((row) => ({
      haacHabitacion: row.haac_habitacion,
      haacClienteNombre: row.haac_cliente_nombre,
      meitId: row.meit_id,
      meitPrecio: row.meit_precio ?? null, // numeric: texto decimal
      estadoPedidoId: row.estado_pedido_id,
    }));
  }
}
