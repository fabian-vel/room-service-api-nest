export interface ItemEspecial {
  meitId: number;
  meitNombre: string;
  meitImagenUrl: string | null;
  meitPrecio: number;
}

export interface ItemsEspeciales {
  itemsMasPedidos: ItemEspecial[];
  itemsMasRecientes: ItemEspecial[];
  itemsRecomendadosChef: ItemEspecial[];
}
