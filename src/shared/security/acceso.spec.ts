import { HABITACION, tieneAcceso } from './acceso.js';

describe('tieneAcceso', () => {
  it.each([
    [['MAESTROS'], { rol: 'ADMIN' }, true],
    [['MAESTROS'], { rol: 'AUX_ADMIN' }, true],
    [['MAESTROS'], { rol: 'COCINA' }, false],
    [['CONSTANTES'], { rol: 'AUX_ADMIN' }, false],
    [['REPORTES'], { rol: 'COCINA' }, true],
    [['REPORTES'], { rol: 'MESERO' }, false],
    [['CONSULTA_PEDIDOS'], { rol: 'RECEPCION' }, true],
    [['MAESTROS'], { accesoId: 1 }, false],
    [[HABITACION], { accesoId: 1 }, true],
    [[HABITACION], { rol: 'ADMIN' }, false],
    [[HABITACION, 'MAESTROS'], { rol: 'ADMIN' }, true],
    [[], { rol: 'ADMIN' }, false],
    [['MAESTROS'], { rol: 'INVENTADO' }, false],
  ])('%j con %j: %s', (quienes, claims, esperado) => {
    expect(tieneAcceso(quienes, claims)).toBe(esperado);
  });
});
