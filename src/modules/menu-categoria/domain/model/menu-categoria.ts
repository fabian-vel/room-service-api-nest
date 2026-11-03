export interface MenuCategoria {
  mecaId: number | null;
  mecaLlaveMst: string | null;
  mecaNombre: string;
  mecaDescripcion: string | null;
  mecaImagenUrl: string | null;
  mecaParentId: number | null;
  mecaEstado: string | null;
  subCategorias: MenuCategoria[];
}
