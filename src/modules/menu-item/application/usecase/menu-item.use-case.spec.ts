import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import type { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import type { MenuItemRepository } from '../../domain/port/menu-item.repository.js';
import { MenuItemUseCase, validarItem } from './menu-item.use-case.js';

const valido = {
  meitNombre: '  Hamburguesa  ',
  meitDescripcion: '   ',
  meitPrecio: 25000,
  meitImagenUrl: null,
  mecaId: 4,
  etiqIds: [1, 5, 1],
};

describe('validarItem', () => {
  it('normaliza textos, vacíos a null y quita etiquetas repetidas', () => {
    expect(validarItem(valido)).toEqual({
      meitId: null,
      meitNombre: 'Hamburguesa',
      meitDescripcion: null,
      meitPrecio: 25000,
      meitImagenUrl: null,
      mecaId: 4,
      etiqIds: [1, 5],
    });
  });

  it('sin etiquetas deja la lista vacía', () => {
    expect(validarItem({ ...valido, etiqIds: undefined }).etiqIds).toEqual([]);
  });

  it.each([
    [{ meitNombre: ' ' }, 'nombre del ítem es obligatorio'],
    [{ meitNombre: 'x'.repeat(101) }, 'más de 100 caracteres'],
    [{ meitPrecio: 0 }, 'precio'],
    [{ meitPrecio: '100' }, 'precio'],
    [{ meitPrecio: Number.NaN }, 'precio'],
    [{ mecaId: undefined }, 'categoría del ítem es obligatoria'],
    [{ meitImagenUrl: 'x'.repeat(501) }, 'más de 500 caracteres'],
    [{ etiqIds: [1, 'a'] }, 'lista de ids'],
  ])('rechaza %o', (cambio, mensaje) => {
    const datos = { ...valido, ...cambio } as never;
    expect(() => validarItem(datos)).toThrow(BusinessException);
    expect(() => validarItem(datos)).toThrow(mensaje);
  });
});

describe('MenuItemUseCase', () => {
  const repo = {
    insertarItem: vi.fn(),
    actualizarItem: vi.fn(),
    eliminarItem: vi.fn(),
    reemplazarEtiquetas: vi.fn(),
  };
  const transaccion = { ejecutar: vi.fn((fn: () => Promise<unknown>) => fn()) };
  const useCase = new MenuItemUseCase(
    repo as unknown as MenuItemRepository,
    transaccion as unknown as TransactionManager,
  );

  beforeEach(() => vi.clearAllMocks());

  it('insertarItem guarda el ítem y sus etiquetas en una transacción', async () => {
    repo.insertarItem.mockResolvedValue(30);
    await expect(useCase.insertarItem(valido)).resolves.toBe(30);
    expect(transaccion.ejecutar).toHaveBeenCalledOnce();
    expect(repo.reemplazarEtiquetas).toHaveBeenCalledWith(30, [1, 5]);
  });

  it('insertarItem con categoría inválida no guarda etiquetas', async () => {
    repo.insertarItem.mockResolvedValue(null);
    await expect(useCase.insertarItem(valido)).rejects.toThrow(
      'subcategoría activa',
    );
    expect(repo.reemplazarEtiquetas).not.toHaveBeenCalled();
  });

  it('actualizarItem sin id falla antes de ir a la BD', async () => {
    await expect(useCase.actualizarItem(valido)).rejects.toThrow(
      'id del ítem es obligatorio',
    );
    expect(repo.actualizarItem).not.toHaveBeenCalled();
  });

  it('actualizarItem que no encuentra el ítem no toca las etiquetas', async () => {
    repo.actualizarItem.mockResolvedValue(0);
    await expect(
      useCase.actualizarItem({ ...valido, meitId: 9 }),
    ).rejects.toThrow('Ítem no encontrado');
    expect(repo.reemplazarEtiquetas).not.toHaveBeenCalled();
  });

  it('actualizarItem reemplaza las etiquetas del ítem', async () => {
    repo.actualizarItem.mockResolvedValue(1);
    await expect(
      useCase.actualizarItem({ ...valido, meitId: 9 }),
    ).resolves.toBe(1);
    expect(repo.reemplazarEtiquetas).toHaveBeenCalledWith(9, [1, 5]);
  });

  it('eliminarItem de un ítem inexistente responde no encontrado', async () => {
    repo.eliminarItem.mockResolvedValue(0);
    await expect(useCase.eliminarItem(9)).rejects.toThrow('Ítem no encontrado');
  });
});
