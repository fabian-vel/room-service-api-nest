import type { DatosPedido, ItemPedido } from '../../domain/model/pedido.js';
import { armarPedido } from './armar-pedido.js';

const dato = (meitId: number, meitPrecio: string | null): DatosPedido => ({
  haacHabitacion: '302',
  haacClienteNombre: 'Juan',
  meitId,
  meitPrecio,
  estadoPedidoId: 1,
});

const armar = (items: ItemPedido[], datos: DatosPedido[]) =>
  armarPedido({ observacion: 'sin hielo', items }, 7, datos);

describe('armarPedido', () => {
  it('arma pedido y detalle con subtotales y total exactos', () => {
    // 0.10 * 3 en punto flotante da 0.30000000000000004; en centavos queda exacto
    const { pedido, detalles } = armar(
      [
        { meitId: 1, cantidad: 3 },
        { meitId: 2, cantidad: 3, observacion: 'tibio' },
      ],
      [dato(1, '12000.00'), dato(2, '0.10')],
    );
    expect(pedido).toEqual({
      haacId: 7,
      habitacion: '302',
      clienteNombre: 'Juan',
      estadoPedidoId: 1,
      observacion: 'sin hielo',
      total: '36000.30',
    });
    expect(detalles).toEqual([
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
  ])('rechaza el pedido con %s', (_, datos, mensaje) => {
    expect(() => armar([{ meitId: 1, cantidad: 1 }], datos)).toThrow(mensaje);
  });
});
