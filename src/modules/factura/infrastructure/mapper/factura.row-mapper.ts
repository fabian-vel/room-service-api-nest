import type {
  AccesoFactura,
  PagoFactura,
  PedidoFactura,
} from '../../domain/model/factura.js';

// bigint, numeric y COUNT llegan como texto desde pg
export function mapAccesoFacturaRow(row: Record<string, any>): AccesoFactura {
  return {
    haacId: Number(row.haac_id),
    haacHabitacion: row.haac_habitacion,
    haacClienteNombre: row.haac_cliente_nombre,
    haacClienteDoc: row.haac_cliente_doc ?? null,
    haacFechaInicio: row.haac_fecha_inicio,
    haacFechaFin: row.haac_fecha_fin,
    totalPendiente: Number(row.total_pendiente),
    pedidosSinEntregar: Number(row.pedidos_sin_entregar),
  };
}

export function mapPedidoFacturaRow(row: Record<string, any>): PedidoFactura {
  return {
    pediId: Number(row.pedi_id),
    pediFechaCreacion: row.pedi_fecha_creacion,
    pediTotal: Number(row.pedi_total),
    pagoId: row.pago_id == null ? null : Number(row.pago_id),
    espeNombre: row.espe_nombre,
    espeLlaveMst: row.espe_llave_mst,
    detalle: row.detalle ?? [],
  };
}

export function mapPagoFacturaRow(row: Record<string, any>): PagoFactura {
  return {
    pagoId: Number(row.pago_id),
    pagoTotal: Number(row.pago_total),
    pagoMetodo: row.pago_metodo,
    pagoObservacion: row.pago_observacion ?? null,
    pagoFechaCreacion: row.pago_fecha_creacion,
    emplNombre: row.empl_nombre,
  };
}
