import type { MenuItem } from '../model/menu-item.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class MenuItemRepository {
  abstract consultaMenuItemsPorCategoria(mecaId: number): Promise<MenuItem[]>;
}
