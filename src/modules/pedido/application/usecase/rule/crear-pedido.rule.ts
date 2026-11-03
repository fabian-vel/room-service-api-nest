import { Injectable } from '@nestjs/common';
import type { ReglaNegocio } from '../../../../../shared/application/rule/regla-negocio.js';
import { BusinessException } from '../../../../../shared/domain/exception/business.exception.js';
import type {
  DatosPedido,
  DetallePedido,
} from '../../../domain/model/pedido.js';
import type { PedidoContexto } from '../../../domain/model/pedido-contexto.js';

// los montos se calculan en centavos enteros para no arrastrar errores de punto flotante
const aCentavos = (monto: string) => Math.round(Number(monto) * 100);
const deCentavos = (centavos: number) => (centavos / 100).toFixed(2);

@Injectable()
export class CrearPedidoRule implements ReglaNegocio<PedidoContexto> {
  readonly ruleId = 'CREAR_PEDIDO';

  async validar(contexto: PedidoContexto): Promise<void> {
    const datosPedidos = contexto.response.listaDatosPedidos;
    const items = contexto.request.pedidoCriterio.items;

    if (!datosPedidos.length)
      throw new BusinessException(
        'No se encontraron datos para crear el pedido',
      );
    if (!items.length)
      throw new BusinessException('El pedido debe tener al menos un item');
    if (datosPedidos.some((dato) => dato.meitPrecio == null)) {
      throw new BusinessException(
        'Uno o más items no tienen precio registrado',
      );
    }
    // en Java un item inactivo o inexistente quedaba con precio 0; aquí se rechaza el pedido
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
    const datos: DatosPedido = datosPedidos[0];

    contexto.request.pedido = {
      haacId: contexto.request.haacId,
      habitacion: datos.haacHabitacion,
      clienteNombre: datos.haacClienteNombre,
      estadoPedidoId: datos.estadoPedidoId,
      observacion: contexto.request.pedidoCriterio.observacion ?? null,
      total: deCentavos(total),
    };
    contexto.request.detallePedidoList = detalles;
  }
}
