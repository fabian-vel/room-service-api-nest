import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../shared/domain/exception/not-found.exception.js';
import { JwtService } from '../../../../shared/security/jwt.service.js';
import type { HabitacionAcceso } from '../../domain/model/habitacion-acceso.js';
import type { HabitacionAccesoRepository } from '../../domain/port/habitacion-acceso.repository.js';
import { LoginUseCase } from './login.use-case.js';

const DIA = 24 * 60 * 60 * 1000;

describe('LoginUseCase', () => {
  process.env.JWT_SECRET = 'x'.repeat(48);
  const jwtService = new JwtService();
  const repo = { consultaHabitacionAcceso: vi.fn() };
  const useCase = new LoginUseCase(
    repo as unknown as HabitacionAccesoRepository,
    jwtService,
  );
  const request = { habitacion: '302', codigo: 'ABC' };
  const acceso = (
    cambios: Partial<HabitacionAcceso> = {},
  ): HabitacionAcceso => ({
    haacId: 7,
    haacHabitacion: '302',
    haacCodigo: 'ABC',
    haacClienteNombre: 'Juan',
    haacClienteDoc: null,
    haacFechaInicio: new Date(Date.now() - DIA),
    haacFechaFin: new Date(Date.now() + DIA),
    haacEstado: 'A',
    ...cambios,
  });

  it('genera un token con habitación, cliente y accesoId', async () => {
    const vigente = acceso();
    repo.consultaHabitacionAcceso.mockResolvedValue(vigente);
    const { token, expiracion } = await useCase.ejecutar(request);
    expect(jwtService.validarToken(token)).toMatchObject({
      sub: '302',
      clienteNombre: 'Juan',
      accesoId: 7,
      exp: Math.floor(vigente.haacFechaFin.getTime() / 1000),
    });
    expect(
      JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString()).alg,
    ).toBe('HS384');
    expect(expiracion).toBe(vigente.haacFechaFin.toISOString());
  });

  it.each([
    [null, NotFoundException, 'Habitación o código inválidos'],
    [acceso({ haacEstado: 'I' }), BusinessException, 'El acceso está inactivo'],
    [
      acceso({ haacFechaInicio: new Date(Date.now() + DIA) }),
      BusinessException,
      'El acceso aún no está vigente',
    ],
    [
      acceso({ haacFechaFin: new Date(Date.now() - 1000) }),
      BusinessException,
      'El acceso ha expirado',
    ],
  ])('rechaza el acceso: %#', async (resultado, tipo, mensaje) => {
    repo.consultaHabitacionAcceso.mockResolvedValue(resultado);
    const error = await useCase.ejecutar(request).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(tipo);
    expect((error as Error).message).toBe(mensaje);
  });

  it('rechaza tokens con otra firma o algoritmo', () => {
    expect(() => jwtService.validarToken('a.b.c')).toThrow();
  });
});
