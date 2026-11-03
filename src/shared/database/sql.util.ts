import type { Pool, QueryResult, QueryResultRow } from 'pg';
import { InternalServerErrorException } from '../domain/exception/internal-server-error.exception.js';

// :nombre (no ::cast) -> $n, para reutilizar los .sql del API Java tal cual
const NAMED_PARAM = /(?<![:\w]):([A-Za-z_]\w*)/g;

export function toPositional(sql: string, params: Record<string, unknown>) {
  const names: string[] = [];
  const text = sql.replace(NAMED_PARAM, (_, name: string) => {
    if (!(name in params)) throw new Error(`Parámetro SQL sin valor: ${name}`);
    let index = names.indexOf(name);
    if (index === -1) index = names.push(name) - 1;
    return `$${index + 1}`;
  });
  return { text, values: names.map((name) => params[name] ?? null) };
}

/** Ejecuta un .sql con parámetros nombrados; los errores de BD se reportan con mensajeError (como AdapterErrorUtil) */
export async function ejecutarSql<T extends QueryResultRow>(
  pool: Pool,
  sql: string,
  params: Record<string, unknown>,
  mensajeError: string,
): Promise<QueryResult<T>> {
  try {
    const { text, values } = toPositional(sql, params);
    return await pool.query<T>(text, values);
  } catch (error) {
    throw new InternalServerErrorException(mensajeError, error);
  }
}
