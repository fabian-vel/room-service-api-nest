import type { CambioEstadoContexto } from '../../../domain/model/cambio-estado-contexto.js';
import { ValidarTransicionEstadoRule } from './validar-transicion-estado.rule.js';

const ESTADOS: Record<string, string> = {
  ESTA_PEDI_PEND: 'Pendiente',
  ESTA_PEDI_PREP: 'En preparación',
  ESTA_PEDI_ENTR: 'Entregado',
  ESTA_PEDI_CANC: 'Cancelado',
};

const contexto = (desde: string, hacia: string): CambioEstadoContexto => ({
  request: { pediId: 1, espeIdDestino: 0 },
  response: {
    actual: {
      pediId: 1,
      haacId: 1,
      estado: { espeId: 0, espeLlaveMst: desde, espeNombre: ESTADOS[desde] },
    },
    destino: { espeId: 0, espeLlaveMst: hacia, espeNombre: ESTADOS[hacia] },
  },
});

describe('ValidarTransicionEstadoRule', () => {
  const regla = new ValidarTransicionEstadoRule();

  it.each([
    ['ESTA_PEDI_PEND', 'ESTA_PEDI_PREP'],
    ['ESTA_PEDI_PEND', 'ESTA_PEDI_CANC'],
    ['ESTA_PEDI_PREP', 'ESTA_PEDI_ENTR'],
  ])('permite %s -> %s', async (desde, hacia) => {
    await expect(
      regla.validar(contexto(desde, hacia)),
    ).resolves.toBeUndefined();
  });

  it.each([
    ['ESTA_PEDI_PEND', 'ESTA_PEDI_ENTR'],
    ['ESTA_PEDI_PEND', 'ESTA_PEDI_PEND'],
    ['ESTA_PEDI_PREP', 'ESTA_PEDI_CANC'],
    ['ESTA_PEDI_PREP', 'ESTA_PEDI_PEND'],
    ['ESTA_PEDI_ENTR', 'ESTA_PEDI_PREP'],
    ['ESTA_PEDI_CANC', 'ESTA_PEDI_PEND'],
  ])('rechaza %s -> %s', async (desde, hacia) => {
    await expect(regla.validar(contexto(desde, hacia))).rejects.toThrow(
      `No se puede pasar el pedido de "${ESTADOS[desde]}" a "${ESTADOS[hacia]}"`,
    );
  });
});
