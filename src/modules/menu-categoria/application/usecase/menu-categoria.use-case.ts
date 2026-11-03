import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { esTextoVacio } from '../../../../shared/util/validacion.util.js';
import type { MenuCategoria } from '../../domain/model/menu-categoria.js';
import type { MenuCategoriaRow } from '../../domain/model/menu-categoria-row.js';
import { MenuCategoriaRepository } from '../../domain/port/menu-categoria.repository.js';

@Injectable()
export class MenuCategoriaUseCase {
  constructor(
    private readonly menuCategoriaRepository: MenuCategoriaRepository,
  ) {}

  async consultarCategorias(): Promise<MenuCategoria[]> {
    return agruparCategorias(
      await this.menuCategoriaRepository.consultarCategorias(),
    );
  }

  consultarCategoriasTodas(): Promise<MenuCategoria[]> {
    return this.menuCategoriaRepository.consultarCategoriasTodas();
  }

  async insertarCategoria(categoria: MenuCategoria): Promise<number> {
    this.validar(categoria);
    return this.menuCategoriaRepository.insertarCategoria(categoria);
  }

  async actualizarCategoria(categoria: MenuCategoria): Promise<number> {
    if (categoria.mecaId == null)
      throw new BusinessException('El id de la categoría es obligatorio');
    this.validar(categoria);
    const rows =
      await this.menuCategoriaRepository.actualizarCategoria(categoria);
    if (rows === 0) throw new BusinessException('Categoría no encontrada');
    return rows;
  }

  async eliminarCategoria(mecaId: number): Promise<number> {
    if (mecaId == null)
      throw new BusinessException('El id de la categoría es obligatorio');
    const rows = await this.menuCategoriaRepository.eliminarCategoria(mecaId);
    if (rows === 0) throw new BusinessException('Categoría no encontrada');
    return rows;
  }

  private validar(categoria: MenuCategoria) {
    if (esTextoVacio(categoria.mecaLlaveMst))
      throw new BusinessException('La llave de la categoría es obligatoria');
    if (esTextoVacio(categoria.mecaNombre))
      throw new BusinessException('El nombre de la categoría es obligatorio');
  }
}

/** Agrupa las filas padre/hijo en categorías con sus subcategorías, conservando el orden de llegada */
export function agruparCategorias(rows: MenuCategoriaRow[]): MenuCategoria[] {
  const padres = new Map<number, MenuCategoria>();
  for (const row of rows) {
    let padre = padres.get(row.padreId);
    if (!padre) {
      padre = categoria(
        row.padreId,
        row.padreNombre,
        row.padreDescripcion,
        row.padreImagenUrl,
        null,
      );
      padres.set(row.padreId, padre);
    }
    if (row.hijoId != null) {
      padre.subCategorias.push(
        categoria(
          row.hijoId,
          row.hijoNombre!,
          row.hijoDescripcion,
          row.hijoImagenUrl,
          row.padreId,
        ),
      );
    }
  }
  return [...padres.values()];
}

function categoria(
  mecaId: number,
  mecaNombre: string,
  mecaDescripcion: string | null,
  mecaImagenUrl: string | null,
  mecaParentId: number | null,
): MenuCategoria {
  // llave y estado no vienen en esta consulta (en Java también salen en null)
  return {
    mecaId,
    mecaLlaveMst: null,
    mecaNombre,
    mecaDescripcion,
    mecaImagenUrl,
    mecaParentId,
    mecaEstado: null,
    subCategorias: [],
  };
}
