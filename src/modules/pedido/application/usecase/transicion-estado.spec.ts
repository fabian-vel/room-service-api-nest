import type { EstadoPedido } from '../../domain/model/estado-pedido.js';
import { validarTransicion } from './transicion-estado.js';

const ESTADOS: Record<string, string> = {
  ESTA_PEDI_PEND: 'Pendiente',
  ESTA_PEDI_PREP: 'En preparación',
  ESTA_PEDI_ENTR: 'Entregado',
  ESTA_PEDI_CANC: 'Cancelado',
};

const estado = (llave: string): EstadoPedido => ({
  espeId: 0,
  espeLlaveMst: llave,
  espeNombre: ESTADOS[llave],
});

describe('validarTransicion', () => {
  it.each([
    ['ESTA_PEDI_PEND', 'ESTA_PEDI_PREP'],
    ['ESTA_PEDI_PEND', 'ESTA_PEDI_CANC'],
    ['ESTA_PEDI_PREP', 'ESTA_PEDI_ENTR'],
  ])('permite %s -> %s', (desde, hacia) => {
    expect(() => validarTransicion(estado(desde), estado(hacia))).not.toThrow();
  });

  it.each([
    ['ESTA_PEDI_PEND', 'ESTA_PEDI_ENTR'],
    ['ESTA_PEDI_PEND', 'ESTA_PEDI_PEND'],
    ['ESTA_PEDI_PREP', 'ESTA_PEDI_CANC'],
    ['ESTA_PEDI_PREP', 'ESTA_PEDI_PEND'],
    ['ESTA_PEDI_ENTR', 'ESTA_PEDI_PREP'],
    ['ESTA_PEDI_CANC', 'ESTA_PEDI_PEND'],
  ])('rechaza %s -> %s', (desde, hacia) => {
    expect(() => validarTransicion(estado(desde), estado(hacia))).toThrow(
      `No se puede pasar el pedido de "${ESTADOS[desde]}" a "${ESTADOS[hacia]}"`,
    );
  });
});
