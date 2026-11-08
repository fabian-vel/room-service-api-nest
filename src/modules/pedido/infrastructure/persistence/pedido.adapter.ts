import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type {
  EstadoActualPedido,
  EstadoPedido,
} from '../../domain/model/estado-pedido.js';
import type {
  DatosPedido,
  DetallePedido,
  Pedido,
} from '../../domain/model/pedido.js';
import { PedidoRepository } from '../../domain/port/pedido.repository.js';

const mapEstado = (row: Record<string, any>): EstadoPedido => ({
  espeId: row.espe_id,
  espeLlaveMst: row.espe_llave_mst,
  espeNombre: row.espe_nombre,
});

@Injectable()
export class PedidoAdapter implements PedidoRepository {
  private readonly sqlInferirDatos = loadSql('querys/inferir-datos-pedido.sql');
  private readonly sqlInsertarPedido = loadSql('querys/insertar_pedido.sql');
  private readonly sqlInsertarDetalle = loadSql(
    'querys/insertar_detalle_pedido.sql',
  );
  private readonly sqlEstadoActual = loadSql(
    'querys/consultar-estado-pedido.sql',
  );
  private readonly sqlEstadoDestino = loadSql(
    'querys/consultar-estado-pedido-destino.sql',
  );
  private readonly sqlActualizarEstado = loadSql(
    'querys/actualizar-estado-pedido.sql',
  );

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async inferirDatosPedidos(
    haacId: number,
    listItemId: number[],
  ): Promise<DatosPedido[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlInferirDatos,
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

  async insertarPedido(pedido: Pedido): Promise<number> {
    const { rows } = await ejecutarSql<{ pedi_id: string }>(
      this.pool,
      this.sqlInsertarPedido,
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
    return Number(rows[0].pedi_id);
  }

  async insertarDetallePedido(
    detallePedidoList: DetallePedido[],
  ): Promise<void> {
    // en secuencia: dentro de una transacción todas las sentencias van por la misma conexión
    for (const detalle of detallePedidoList) {
      await ejecutarSql(
        this.pool,
        this.sqlInsertarDetalle,
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
      this.sqlActualizarEstado,
      { pediId, espeId },
      'Error al actualizar el estado del pedido en BD',
    );
    return rowCount ?? 0;
  }
}
