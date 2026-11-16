import type { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { PagoNuevo } from '../../domain/model/factura.js';
import type { FacturaRepository } from '../../domain/port/factura.repository.js';
import { FacturaUseCase, validarPago } from './factura.use-case.js';

describe('validarPago', () => {
  it('normaliza la observación', () => {
    expect(
      validarPago({ pagoMetodo: 'TARJETA', pagoObservacion: '  ' }),
    ).toEqual({ metodo: 'TARJETA', observacion: null });
  });

  it.each([
    [{ pagoMetodo: 'BITCOIN' }, 'método de pago'],
    [{}, 'método de pago'],
    [
      { pagoMetodo: 'EFECTIVO', pagoObservacion: 5 },
      'observación no es válida',
    ],
    [
      { pagoMetodo: 'EFECTIVO', pagoObservacion: 'x'.repeat(256) },
      'más de 255',
    ],
  ])('rechaza %j', (request, mensaje) => {
    expect(() => validarPago(request)).toThrow(mensaje);
  });
});

describe('FacturaUseCase.cobrar', () => {
  let porCobrar: { pediId: number; espeLlaveMst: string }[];
  let empleadoActivo: boolean;
  const pagos: PagoNuevo[] = [];
  const marcados: number[][] = [];
  const repo = {
    bloquearPedidosPorCobrar: async () => porCobrar,
    insertarPago: async (pago: PagoNuevo) => {
      pagos.push(pago);
      return empleadoActivo ? 9 : null;
    },
    marcarPedidosPagados: async (_: number, ids: number[]) => {
      marcados.push(ids);
      return ids.length;
    },
  } as unknown as FacturaRepository;
  const transaccion: TransactionManager = { ejecutar: (fn) => fn() };
  const useCase = new FacturaUseCase(repo, transaccion);
  const cobrar = () =>
    useCase.cobrar(1, { pagoMetodo: 'EFECTIVO' }, 'recepcion1');

  beforeEach(() => {
    porCobrar = [
      { pediId: 10, espeLlaveMst: 'ESTA_PEDI_ENTR' },
      { pediId: 11, espeLlaveMst: 'ESTA_PEDI_ENTR' },
    ];
    empleadoActivo = true;
    pagos.length = 0;
    marcados.length = 0;
  });

  it('registra el pago y marca los pedidos', async () => {
    await expect(cobrar()).resolves.toBe(9);
    expect(pagos[0]).toEqual({
      haacId: 1,
      usuario: 'recepcion1',
      metodo: 'EFECTIVO',
      observacion: null,
      pediIds: [10, 11],
    });
    expect(marcados).toEqual([[10, 11]]);
  });

  it('sin pedidos pendientes no cobra', async () => {
    porCobrar = [];
    await expect(cobrar()).rejects.toThrow('No hay pedidos pendientes');
    expect(pagos).toEqual([]);
  });

  it('con pedidos sin entregar no cobra', async () => {
    porCobrar[1].espeLlaveMst = 'ESTA_PEDI_PREP';
    await expect(cobrar()).rejects.toThrow('1 pedido(s) sin entregar');
    expect(pagos).toEqual([]);
  });

  it('si el usuario no es un empleado activo no marca pedidos', async () => {
    empleadoActivo = false;
    await expect(cobrar()).rejects.toThrow('no es un empleado activo');
    expect(marcados).toEqual([]);
  });
});
