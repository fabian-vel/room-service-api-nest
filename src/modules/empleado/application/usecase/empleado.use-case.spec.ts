import type { PasswordEncoder } from '../../../../shared/security/password-encoder.js';
import type { EmpleadoGuardar } from '../../domain/model/empleado.js';
import type { EmpleadoRepository } from '../../domain/port/empleado.repository.js';
import { EmpleadoUseCase, validarEmpleado } from './empleado.use-case.js';

const valido = {
  emplUsuario: '  mesero2 ',
  emplNombre: '  Ana Pérez ',
  emplRol: 'MESERO',
  emplPassword: 'secreta123',
};

describe('validarEmpleado', () => {
  it('normaliza los textos', () => {
    expect(validarEmpleado(valido, true)).toEqual({
      emplId: null,
      emplUsuario: 'mesero2',
      emplNombre: 'Ana Pérez',
      emplRol: 'MESERO',
      emplPassword: 'secreta123',
    });
  });

  it('al actualizar la contraseña vacía conserva la actual (null)', () => {
    expect(
      validarEmpleado({ ...valido, emplPassword: '' }, false).emplPassword,
    ).toBeNull();
  });

  it.each([
    [{ emplUsuario: ' ' }, 'usuario es obligatorio'],
    [{ emplUsuario: 'con espacio' }, 'solo puede tener'],
    [{ emplUsuario: 'x'.repeat(51) }, 'más de 50'],
    [{ emplNombre: ' ' }, 'nombre del empleado es obligatorio'],
    [{ emplNombre: 'x'.repeat(101) }, 'más de 100'],
    [{ emplRol: 'JEFE' }, 'El rol debe ser uno de'],
    [{ emplPassword: undefined }, 'entre 8 y 72'],
    [{ emplPassword: 'corta' }, 'entre 8 y 72'],
    [{ emplPassword: 'x'.repeat(73) }, 'entre 8 y 72'],
    [{ emplPassword: 12345678 }, 'contraseña no es válida'],
  ])('rechaza %j', (cambio, mensaje) => {
    expect(() =>
      validarEmpleado(
        { ...valido, ...cambio } as Partial<EmpleadoGuardar>,
        true,
      ),
    ).toThrow(mensaje);
  });
});

describe('EmpleadoUseCase', () => {
  const guardados: EmpleadoGuardar[] = [];
  const repo: EmpleadoRepository = {
    consultarEmpleados: async () => [],
    insertarEmpleado: async (e) => {
      guardados.push(e);
      return e.emplUsuario === 'existe' ? null : 7;
    },
    actualizarEmpleado: async (e) => {
      guardados.push(e);
      return 1;
    },
    eliminarEmpleado: async () => 0,
  };
  const encoder: PasswordEncoder = {
    matches: async () => true,
    encode: async (raw) => `hash(${raw})`,
  };
  const useCase = new EmpleadoUseCase(repo, encoder);

  beforeEach(() => (guardados.length = 0));

  it('guarda la contraseña con hash', async () => {
    await expect(useCase.insertarEmpleado(valido)).resolves.toBe(7);
    expect(guardados[0].emplPassword).toBe('hash(secreta123)');
  });

  it('usuario repetido responde "ya existe"', async () => {
    await expect(
      useCase.insertarEmpleado({ ...valido, emplUsuario: 'existe' }),
    ).rejects.toThrow('El usuario ya existe');
  });

  it('actualizar sin contraseña no la cambia', async () => {
    await useCase.actualizarEmpleado(
      { ...valido, emplId: 3, emplPassword: null },
      'admin',
    );
    expect(guardados[0].emplPassword).toBeNull();
  });

  it('eliminar sin filas afectadas avisa', async () => {
    await expect(useCase.eliminarEmpleado(3, 'admin')).rejects.toThrow(
      'propio usuario',
    );
  });
});
