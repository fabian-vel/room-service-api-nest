import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import type { MenuCategoria } from '../../domain/model/menu-categoria.js';
import type { MenuCategoriaRepository } from '../../domain/port/menu-categoria.repository.js';
import {
  agruparCategorias,
  MenuCategoriaUseCase,
} from './menu-categoria.use-case.js';

const fila = (padreId: number, hijoId: number | null) => ({
  padreId,
  padreNombre: `P${padreId}`,
  padreDescripcion: null,
  padreImagenUrl: null,
  hijoId,
  hijoNombre: hijoId ? `H${hijoId}` : null,
  hijoDescripcion: null,
  hijoImagenUrl: null,
});

describe('agruparCategorias', () => {
  it('agrupa hijos bajo su padre en el orden de llegada', () => {
    const arbol = agruparCategorias([fila(1, 10), fila(2, null), fila(1, 11)]);
    expect(
      arbol.map((p) => [
        p.mecaId,
        p.subCategorias.map((h) => [h.mecaId, h.mecaParentId]),
      ]),
    ).toEqual([
      [
        1,
        [
          [10, 1],
          [11, 1],
        ],
      ],
      [2, []],
    ]);
  });
});

describe('MenuCategoriaUseCase', () => {
  const repo = { actualizarCategoria: vi.fn(), insertarCategoria: vi.fn() };
  const useCase = new MenuCategoriaUseCase(
    repo as unknown as MenuCategoriaRepository,
  );
  const valida = {
    mecaId: 1,
    mecaLlaveMst: 'K',
    mecaNombre: 'N',
  } as MenuCategoria;

  it('rechaza llave vacía o que no es texto con 422', async () => {
    await expect(
      useCase.insertarCategoria({ ...valida, mecaLlaveMst: '  ' }),
    ).rejects.toThrow(
      new BusinessException('La llave de la categoría es obligatoria'),
    );
    await expect(
      useCase.insertarCategoria({ ...valida, mecaNombre: 5 as never }),
    ).rejects.toBeInstanceOf(BusinessException);
    expect(repo.insertarCategoria).not.toHaveBeenCalled();
  });

  it('falla si la actualización no afecta filas', async () => {
    repo.actualizarCategoria.mockResolvedValue(0);
    await expect(useCase.actualizarCategoria(valida)).rejects.toThrow(
      'Categoría no encontrada',
    );
  });
});
