import type { Etiqueta } from '../../../etiqueta/domain/model/etiqueta.js';

export interface MenuItem {
  meitId: number;
  meitNombre: string;
  meitDescripcion: string | null;
  meitPrecio: number;
  meitImagenUrl: string | null;
  mecaId: number;
  mecaParentId: number | null;
  etiquetas: Etiqueta[];
}

export interface MenuItemRequest {
  mecaId?: number | null;
}

// maestro de ítems: lista con los nombres de la categoría y su padre
export interface MenuItemMaestro {
  meitId: number;
  meitNombre: string;
  meitDescripcion: string | null;
  meitPrecio: number;
  meitImagenUrl: string | null;
  mecaId: number;
  mecaNombre: string;
  mecaParentId: number | null;
  mecaParentNombre: string | null;
  etiquetas: { etiqId: number; etiqNombre: string }[];
}

// crear o actualizar: mecaId es la subcategoría; el padre se toma de ella
export interface MenuItemGuardar {
  meitId?: number | null;
  meitNombre: string;
  meitDescripcion: string | null;
  meitPrecio: number;
  meitImagenUrl: string | null;
  mecaId: number;
  etiqIds: number[];
}
