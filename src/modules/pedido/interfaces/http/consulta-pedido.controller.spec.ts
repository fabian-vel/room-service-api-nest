import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { toFiltro } from './consulta-pedido.controller.js';

describe('toFiltro', () => {
  it('sin parámetros usa página 1 de 20 y no filtra', () => {
    expect(toFiltro({})).toEqual({
      fechaDesde: undefined,
      fechaHasta: undefined,
      estadoPedido: undefined,
      habitacion: undefined,
      producto: undefined,
      page: 1,
      size: 20,
    });
  });

  it('recorta espacios, ignora vacíos y toma el primero si el parámetro se repite', () => {
    expect(
      toFiltro({
        habitacion: ' 302 ',
        producto: '  ',
        fechaDesde: '2026-09-01',
        estadoPedido: '4',
        page: ['2', '9'],
      }),
    ).toMatchObject({
      habitacion: '302',
      producto: undefined,
      fechaDesde: '2026-09-01',
      estadoPedido: 4,
      page: 2,
    });
  });

  it.each([
    ['fechaDesde', '2026-02-30'],
    ['fechaHasta', '01/09/2026'],
    ['estadoPedido', 'abc'],
    ['estadoPedido', '40000'],
    ['page', '1.5'],
  ])('rechaza %s=%s con 422', (nombre, valor) => {
    expect(() => toFiltro({ [nombre]: valor })).toThrow(
      new BusinessException(`El parámetro ${nombre} no es válido`),
    );
  });
});
