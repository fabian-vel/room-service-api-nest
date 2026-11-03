import type {
  ConsultaPedido,
  PedidoDetalle,
} from '../../domain/model/consulta-pedido.js';

export function mapConsultaPedidoRow(row: Record<string, any>): ConsultaPedido {
  return {
    pediId: Number(row.pedi_id), // bigint: pg lo entrega como string
    pediHabitacion: row.pedi_habitacion,
    pediTotal: Number(row.pedi_total), // numeric: pg lo entrega como string
    pediFechaCreacion: row.pedi_fecha_creacion,
    pediObservacion: row.pedi_observacion ?? null,
    espeId: row.espe_id,
    espeNombre: row.espe_nombre,
    // pg ya entrega el JSON_AGG parseado; null cuando el pedido no tiene detalle activo
    detallePedidoList: (row.pedido_detalle ?? []).map(
      (detalle: Partial<PedidoDetalle>): PedidoDetalle => ({
        meitId: detalle.meitId!,
        meitNombre: detalle.meitNombre!,
        pedeCantidad: detalle.pedeCantidad!,
        pedeSubtotal: detalle.pedeSubtotal!,
        mecaParentId: detalle.mecaParentId ?? null,
        mecaId: detalle.mecaId ?? null,
        mecaNombre: detalle.mecaNombre ?? null,
      }),
    ),
  };
}
