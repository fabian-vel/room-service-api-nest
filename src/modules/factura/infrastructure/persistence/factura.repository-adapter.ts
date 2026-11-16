import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type {
  AccesoFactura,
  PagoFactura,
  PagoNuevo,
  PedidoFactura,
} from '../../domain/model/factura.js';
import { FacturaRepository } from '../../domain/port/factura.repository.js';
import {
  mapAccesoFacturaRow,
  mapPagoFacturaRow,
  mapPedidoFacturaRow,
} from '../mapper/factura.row-mapper.js';

@Injectable()
export class FacturaRepositoryAdapter implements FacturaRepository {
  private readonly accesos = loadSql('querys/factura-accesos.sql');
  private readonly pedidos = loadSql('querys/factura-pedidos.sql');
  private readonly pagos = loadSql('querys/factura-pagos.sql');
  private readonly bloquear = loadSql('querys/factura-bloquear-pedidos.sql');
  private readonly insertar = loadSql('querys/insertar-pago.sql');
  private readonly marcar = loadSql('querys/marcar-pedidos-pagados.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async buscarAccesos(filtro: {
    haacId?: number | null;
    habitacion?: string | null;
  }): Promise<AccesoFactura[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.accesos,
      { haacId: filtro.haacId, habitacion: filtro.habitacion },
      'Error al consultar los accesos en BD',
    );
    return rows.map(mapAccesoFacturaRow);
  }

  async consultarPedidos(haacId: number): Promise<PedidoFactura[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.pedidos,
      { haacId },
      'Error al consultar los pedidos de la factura en BD',
    );
    return rows.map(mapPedidoFacturaRow);
  }

  async consultarPagos(haacId: number): Promise<PagoFactura[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.pagos,
      { haacId },
      'Error al consultar los pagos en BD',
    );
    return rows.map(mapPagoFacturaRow);
  }

  async bloquearPedidosPorCobrar(
    haacId: number,
  ): Promise<{ pediId: number; espeLlaveMst: string }[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.bloquear,
      { haacId },
      'Error al consultar los pedidos por cobrar en BD',
    );
    return rows.map((row) => ({
      pediId: Number(row.pedi_id),
      espeLlaveMst: row.espe_llave_mst,
    }));
  }

  async insertarPago(pago: PagoNuevo): Promise<number | null> {
    const { rows } = await ejecutarSql<{ pago_id: string }>(
      this.pool,
      this.insertar,
      { ...pago },
      'Error al insertar el pago en BD',
    );
    return rows[0] ? Number(rows[0].pago_id) : null;
  }

  async marcarPedidosPagados(
    pagoId: number,
    pediIds: number[],
  ): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.marcar,
      { pagoId, pediIds },
      'Error al marcar los pedidos como pagados en BD',
    );
    return rowCount ?? 0;
  }
}
