import type { ItemEspecial } from '../model/items-especiales.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class ItemsEspecialesRepository {
  abstract consultarItemsMasPedidos(cantidad: number): Promise<ItemEspecial[]>;
  abstract consultarItemsMasRecientes(
    cantidad: number,
  ): Promise<ItemEspecial[]>;
  abstract consultarItemsRecomendadosChef(
    cantidad: number,
    etiqueta: number,
  ): Promise<ItemEspecial[]>;
}
