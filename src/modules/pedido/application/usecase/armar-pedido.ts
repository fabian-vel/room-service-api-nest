import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import type {
  DatosPedido,
  DetallePedido,
  Pedido,
  PedidoCriterio,
} from '../../domain/model/pedido.js';

// los montos se calculan en centavos enteros para no arrastrar errores de punto flotante
const aCentavos = (monto: string) => Math.round(Number(monto) * 100);
const deCentavos = (centavos: number) => (centavos / 100).toFixed(2);

/** Arma el pedido y su detalle con los precios de la BD; rechaza items sin precio o no disponibles */
export function armarPedido(
  criterio: PedidoCriterio,
  haacId: number,
  datosPedidos: DatosPedido[],
): { pedido: Pedido; detalles: DetallePedido[] } {
  const items = criterio.items;

  if (!datosPedidos.length)
    throw new BusinessException('No se encontraron datos para crear el pedido');
  if (datosPedidos.some((dato) => dato.meitPrecio == null)) {
    throw new BusinessException('Uno o más items no tienen precio registrado');
  }
  // un item inactivo o inexistente no tiene precio: se rechaza el pedido en vez de cobrarlo en 0
  const precios = new Map(
    datosPedidos.map((dato) => [dato.meitId, aCentavos(dato.meitPrecio!)]),
  );
  if (items.some((item) => !precios.has(item.meitId))) {
    throw new BusinessException('Uno o más items no están disponibles');
  }

  const detalles: DetallePedido[] = items.map((item) => {
    const precioUnitario = precios.get(item.meitId)!;
    return {
      meitId: item.meitId,
      cantidad: item.cantidad,
      precioUnitario: deCentavos(precioUnitario),
      subtotal: deCentavos(precioUnitario * item.cantidad),
      observacion: item.observacion ?? null,
    };
  });
  const total = detalles.reduce(
    (suma, detalle) => suma + aCentavos(detalle.subtotal),
    0,
  );
  const datos = datosPedidos[0];

  return {
    pedido: {
      haacId,
      habitacion: datos.haacHabitacion,
      clienteNombre: datos.haacClienteNombre,
      estadoPedidoId: datos.estadoPedidoId,
      observacion: criterio.observacion ?? null,
      total: deCentavos(total),
    },
    detalles,
  };
}
