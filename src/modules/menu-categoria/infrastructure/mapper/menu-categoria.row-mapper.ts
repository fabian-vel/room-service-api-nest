import type { MenuCategoria } from '../../domain/model/menu-categoria.js';
import type { MenuCategoriaRow } from '../../domain/model/menu-categoria-row.js';

export function mapMenuCategoriaRow(
  row: Record<string, any>,
): MenuCategoriaRow {
  return {
    padreId: row.meca_id_padre,
    padreNombre: row.meca_nombre_padre,
    padreDescripcion: row.meca_descripcion_padre ?? null,
    padreImagenUrl: row.meca_imagen_url_padre ?? null,
    hijoId: row.meca_id_hijo ?? null,
    hijoNombre: row.meca_nombre_hijo ?? null,
    hijoDescripcion: row.meca_descripcion_hijo ?? null,
    hijoImagenUrl: row.meca_imagen_url_hijo ?? null,
  };
}

export function mapMenuCategoria(row: Record<string, any>): MenuCategoria {
  return {
    mecaId: row.meca_id ?? null,
    mecaLlaveMst: row.meca_llave_mst ?? null,
    mecaNombre: row.meca_nombre ?? null,
    mecaDescripcion: row.meca_descripcion ?? null,
    mecaImagenUrl: row.meca_imagen_url ?? null,
    mecaParentId: row.meca_parent_id ?? null,
    mecaEstado: row.meca_estado ?? null,
    subCategorias: [],
  };
}
