import type {
  AccesoHabitacion,
  AccesoRequest,
} from '../../domain/model/acceso-habitacion.js';
import type { AccesoHabitacionRepository } from '../../domain/port/acceso-habitacion.repository.js';
import {
  AccesoHabitacionUseCase,
  generarCodigo,
  validarAcceso,
} from './acceso-habitacion.use-case.js';

const manana = new Date(Date.now() + 86_400_000).toISOString();
const valido: AccesoRequest = {
  haacHabitacion: ' 302 ',
  haacClienteNombre: '  Juan Pérez ',
  haacClienteDoc: '  ',
  haacFechaInicio: new Date().toISOString(),
  haacFechaFin: manana,
};

describe('validarAcceso', () => {
  it('normaliza textos y convierte las fechas', () => {
    const acceso = validarAcceso(valido, true);
    expect(acceso).toMatchObject({
      haacId: null,
      haacHabitacion: '302',
      haacClienteNombre: 'Juan Pérez',
      haacClienteDoc: null,
    });
    expect(acceso.haacFechaFin).toEqual(new Date(manana));
  });

  it('al actualizar no exige habitación', () => {
    expect(() =>
      validarAcceso({ ...valido, haacHabitacion: undefined }, false),
    ).not.toThrow();
  });

  it.each([
    [{ haacHabitacion: ' ' }, 'habitación es obligatoria'],
    [{ haacHabitacion: 'x'.repeat(11) }, 'más de 10'],
    [{ haacClienteNombre: '' }, 'nombre del huésped es obligatorio'],
    [{ haacClienteDoc: 'x'.repeat(21) }, 'más de 20'],
    [{ haacFechaInicio: 'ayer' }, 'fecha de inicio no es válida'],
    [{ haacFechaFin: 123 }, 'fecha de fin no es válida'],
    [{ haacFechaFin: valido.haacFechaInicio }, 'posterior a la de inicio'],
  ])('rechaza %j', (cambio, mensaje) => {
    expect(() => validarAcceso({ ...valido, ...cambio }, true)).toThrow(
      mensaje,
    );
  });
});

it('generarCodigo: 6 caracteres sin los que se confunden', () => {
  for (let i = 0; i < 200; i++)
    expect(generarCodigo()).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
});

describe('AccesoHabitacionUseCase', () => {
  let traslape: boolean;
  let disponibles: boolean[];
  let actual: Partial<AccesoHabitacion> | null;
  const insertados: string[] = [];
  const repo = {
    consultarAcceso: async () => actual,
    existeTraslape: async () => traslape,
    codigoDisponible: async () => disponibles.shift() ?? true,
    insertarAcceso: async (_: unknown, codigo: string) => {
      insertados.push(codigo);
      return 5;
    },
    actualizarAcceso: async () => 1,
    cambiarCodigo: async () => 0,
  } as unknown as AccesoHabitacionRepository;
  const useCase = new AccesoHabitacionUseCase(repo);

  beforeEach(() => {
    traslape = false;
    disponibles = [];
    actual = { haacHabitacion: '302', haacEstado: 'A' };
    insertados.length = 0;
  });

  it('registra con un código libre (reintenta si está ocupado)', async () => {
    disponibles = [false, true];
    const res = await useCase.registrarAcceso(valido);
    expect(res.haacId).toBe(5);
    expect(res.haacCodigo).toMatch(/^[A-Z2-9]{6}$/);
    expect(insertados).toEqual([res.haacCodigo]);
  });

  it('no registra si la fecha de fin ya pasó', async () => {
    await expect(
      useCase.registrarAcceso({
        ...valido,
        haacFechaInicio: '2020-01-01T00:00:00Z',
        haacFechaFin: '2020-01-02T00:00:00Z',
      }),
    ).rejects.toThrow('ya pasó');
  });

  it('no registra si se cruza con otro acceso de la habitación', async () => {
    traslape = true;
    await expect(useCase.registrarAcceso(valido)).rejects.toThrow(
      'se cruza con esas fechas',
    );
    expect(insertados).toEqual([]);
  });

  it('si nunca encuentra un código libre falla sin insertar', async () => {
    disponibles = [false, false, false, false, false];
    await expect(useCase.registrarAcceso(valido)).rejects.toThrow(
      'No se pudo generar un código',
    );
    expect(insertados).toEqual([]);
  });

  it('no actualiza un acceso finalizado', async () => {
    actual = { haacHabitacion: '302', haacEstado: 'I' };
    await expect(
      useCase.actualizarAcceso({ ...valido, haacId: 5 }),
    ).rejects.toThrow('finalizado');
  });

  it('renovar el código de un acceso inexistente avisa', async () => {
    await expect(useCase.renovarCodigo(99)).rejects.toThrow(
      'no encontrado o finalizado',
    );
  });
});
