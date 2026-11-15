import type {
  MenuItem,
  MenuItemGuardar,
  MenuItemMaestro,
} from '../model/menu-item.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class MenuItemRepository {
  abstract consultaMenuItemsPorCategoria(mecaId: number): Promise<MenuItem[]>;
  abstract consultarItems(): Promise<MenuItemMaestro[]>;
  /** id creado; null si la categoría no es una subcategoría activa */
  abstract insertarItem(item: MenuItemGuardar): Promise<number | null>;
  /** filas actualizadas: 0 si el ítem no existe o la categoría no es válida */
  abstract actualizarItem(item: MenuItemGuardar): Promise<number>;
  abstract eliminarItem(meitId: number): Promise<number>;
  /** deja al ítem exactamente con estas etiquetas */
  abstract reemplazarEtiquetas(
    meitId: number,
    etiqIds: number[],
  ): Promise<void>;
}
