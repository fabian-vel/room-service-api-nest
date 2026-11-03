import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { DetallePedido } from '../../domain/model/pedido.js';
import { InsertarDetallePedidoRepository } from '../../domain/port/insertar-detalle-pedido.repository.js';

@Injectable()
export class InsertarDetallePedidoAdapter implements InsertarDetallePedidoRepository {
  private readonly sql = loadSql('querys/insertar_detalle_pedido.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async insertarDetallePedido(
    detallePedidoList: DetallePedido[],
  ): Promise<void> {
    // en secuencia: dentro de una transacción todas las sentencias van por la misma conexión
    for (const detalle of detallePedidoList) {
      await ejecutarSql(
        this.pool,
        this.sql,
        {
          pediId: detalle.pediId,
          meitId: detalle.meitId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.subtotal,
          observacion: detalle.observacion,
        },
        'Error al insertar detalle pedido en BD',
      );
    }
  }
}
