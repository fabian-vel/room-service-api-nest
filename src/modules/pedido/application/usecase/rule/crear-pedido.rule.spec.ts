import type { PedidoContexto } from '../../../domain/model/pedido-contexto.js';
import type { DatosPedido, ItemPedido } from '../../../domain/model/pedido.js';
import { CrearPedidoRule } from './crear-pedido.rule.js';

const dato = (meitId: number, meitPrecio: string | null): DatosPedido => ({
  haacHabitacion: '302',
  haacClienteNombre: 'Juan',
  meitId,
  meitPrecio,
  estadoPedidoId: 1,
});

const contexto = (
  items: ItemPedido[],
  datos: DatosPedido[],
): PedidoContexto => ({
  request: {
    pedidoCriterio: { observacion: 'sin hielo', items },
    haacId: 7,
    listItemId: items.map((i) => i.meitId),
  },
  response: { listaDatosPedidos: datos },
});

describe('CrearPedidoRule', () => {
  const regla = new CrearPedidoRule();

  it('arma pedido y detalle con subtotales y total exactos', async () => {
    // 0.10 * 3 en punto flotante da 0.30000000000000004; en centavos queda exacto
    const ctx = contexto(
      [
        { meitId: 1, cantidad: 3 },
        { meitId: 2, cantidad: 3, observacion: 'tibio' },
      ],
      [dato(1, '12000.00'), dato(2, '0.10')],
    );
    await regla.validar(ctx);
    expect(ctx.request.pedido).toEqual({
      haacId: 7,
      habitacion: '302',
      clienteNombre: 'Juan',
      estadoPedidoId: 1,
      observacion: 'sin hielo',
      total: '36000.30',
    });
    expect(ctx.request.detallePedidoList).toEqual([
      {
        meitId: 1,
        cantidad: 3,
        precioUnitario: '12000.00',
        subtotal: '36000.00',
        observacion: null,
      },
      {
        meitId: 2,
        cantidad: 3,
        precioUnitario: '0.10',
        subtotal: '0.30',
        observacion: 'tibio',
      },
    ]);
  });

  it.each([
    [
      'sin datos de la habitación',
      [],
      'No se encontraron datos para crear el pedido',
    ],
    [
      'un item sin precio',
      [dato(1, null)],
      'Uno o más items no tienen precio registrado',
    ],
    [
      'un item inactivo o inexistente',
      [dato(9, '100.00')],
      'Uno o más items no están disponibles',
    ],
  ])('rechaza el pedido con %s', async (_, datos, mensaje) => {
    await expect(
      regla.validar(contexto([{ meitId: 1, cantidad: 1 }], datos)),
    ).rejects.toThrow(mensaje);
  });
});
