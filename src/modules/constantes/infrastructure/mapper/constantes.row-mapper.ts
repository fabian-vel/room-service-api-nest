import type { Constantes } from '../../domain/model/constantes.js';

export function mapConstantesRow(row: Record<string, any>): Constantes {
  return {
    consId: row.cons_id ?? null,
    consLlave: row.cons_llave ?? null,
    consValor: row.cons_valor ?? null,
    consDescripcion: row.cons_descripcion ?? null,
    consEstado: row.cons_estado ?? null,
  };
}
