import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../shared/domain/exception/not-found.exception.js';
import { JwtService } from '../../../../shared/security/jwt.service.js';
import { BcryptPasswordEncoder } from '../../../../shared/security/password-encoder.js';
import type { EmpleadoRepository } from '../../domain/port/empleado.repository.js';
import { LoginEmpleadoUseCase } from './login-empleado.use-case.js';

// hash bcrypt $2a$ (el formato de las contraseñas en tbl_empleados) para 'clave-de-prueba'
const HASH_BCRYPT =
  '$2a$10$RRT3C3z4B6RseWMQ3KLKqe9WQxpl5EBb9kz0qG2z6zNufUiaFyMxO';

describe('LoginEmpleadoUseCase', () => {
  process.env.JWT_SECRET = 'x'.repeat(48);
  const jwtService = new JwtService();
  const repo = { findByUsuario: vi.fn() };
  const useCase = new LoginEmpleadoUseCase(
    repo as unknown as EmpleadoRepository,
    jwtService,
    new BcryptPasswordEncoder(),
  );
  const empleado = {
    emplId: 1,
    emplUsuario: 'cocina1',
    emplPassword: HASH_BCRYPT,
    emplNombre: 'Cocina',
    emplRol: 'COCINA',
  };

  it('valida el hash bcrypt y genera un token de 8 horas con usuario, nombre y rol', async () => {
    repo.findByUsuario.mockResolvedValue(empleado);
    const response = await useCase.ejecutar({
      usuario: 'cocina1',
      password: 'clave-de-prueba',
    });
    expect(response).toMatchObject({ nombre: 'Cocina', rol: 'COCINA' });
    const claims = jwtService.validarToken(response.token);
    expect(claims).toMatchObject({
      sub: 'cocina1',
      nombre: 'Cocina',
      rol: 'COCINA',
    });
    expect(claims.exp - claims.iat).toBe(8 * 60 * 60);
  });

  it.each([
    ['usuario inexistente', null, 'clave-de-prueba', NotFoundException],
    ['contraseña incorrecta', empleado, 'otra', BusinessException],
    ['contraseña que no es texto', empleado, undefined, BusinessException],
  ])('rechaza: %s', async (_, encontrado, password, tipo) => {
    repo.findByUsuario.mockResolvedValue(encontrado);
    const error = await useCase
      .ejecutar({ usuario: 'cocina1', password: password as string })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(tipo);
    expect((error as Error).message).toBe('Credenciales inválidas');
  });
});
