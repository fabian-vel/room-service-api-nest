import type { MenuCategoria } from '../model/menu-categoria.js';
import type { MenuCategoriaRow } from '../model/menu-categoria-row.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class MenuCategoriaRepository {
  abstract consultarCategorias(): Promise<MenuCategoriaRow[]>;
  abstract consultarCategoriasTodas(): Promise<MenuCategoria[]>;
  abstract insertarCategoria(categoria: MenuCategoria): Promise<number>;
  abstract actualizarCategoria(categoria: MenuCategoria): Promise<number>;
  abstract eliminarCategoria(mecaId: number): Promise<number>;
}
