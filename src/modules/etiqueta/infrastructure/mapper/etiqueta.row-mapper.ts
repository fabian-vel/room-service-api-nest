import type { Etiqueta } from '../../domain/model/etiqueta.js';

export function mapEtiquetaRow(row: Record<string, any>): Etiqueta {
  return {
    etiqId: row.etiq_id ?? null,
    etiqLlaveMst: row.etic_llave_mst ?? null,
    etiqNombre: row.etiq_nombre ?? null,
    etiqDescripcion: row.etiq_descripcion ?? null,
    etiqEstado: row.etiq_estado ?? null,
  };
}
