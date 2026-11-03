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
