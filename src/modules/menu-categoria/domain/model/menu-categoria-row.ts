/** Fila padre/hijo de la consulta de categorías, antes de agruparla en árbol */
export interface MenuCategoriaRow {
  padreId: number;
  padreNombre: string;
  padreDescripcion: string | null;
  padreImagenUrl: string | null;
  hijoId: number | null;
  hijoNombre: string | null;
  hijoDescripcion: string | null;
  hijoImagenUrl: string | null;
}
