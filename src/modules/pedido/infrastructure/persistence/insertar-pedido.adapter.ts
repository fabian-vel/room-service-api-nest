import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { Pedido } from '../../domain/model/pedido.js';
import { InsertarPedidoRepository } from '../../domain/port/insertar-pedido.repository.js';

@Injectable()
export class InsertarPedidoAdapter implements InsertarPedidoRepository {
  private readonly sql = loadSql('querys/insertar_pedido.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async insertarPedido(pedido: Pedido): Promise<number> {
    const { rows } = await ejecutarSql<{ pedi_id: string }>(
      this.pool,
      this.sql,
      {
        haacId: pedido.haacId,
        habitacion: pedido.habitacion,
        clienteNombre: pedido.clienteNombre,
        estadoPedidoId: pedido.estadoPedidoId,
        observacion: pedido.observacion,
        total: pedido.total,
      },
      'Error al insertar pedido en BD',
    );
    return Number(rows[0].pedi_id); // bigint: pg lo entrega como string
  }
}
