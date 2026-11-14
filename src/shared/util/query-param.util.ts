import { BusinessException } from '../domain/exception/business.exception.js';

type Query = Record<string, unknown>;

/** Valor del parámetro sin espacios; undefined si no viene o está vacío (si se repite, toma el primero) */
export function param(query: Query, nombre: string): string | undefined {
  const valor = Array.isArray(query[nombre]) ? query[nombre][0] : query[nombre];
  const texto = typeof valor === 'string' ? valor.trim() : '';
  return texto || undefined;
}

function invalido(nombre: string): never {
  throw new BusinessException(`El parámetro ${nombre} no es válido`);
}

export function fecha(query: Query, nombre: string): string | undefined {
  const valor = param(query, nombre);
  if (valor === undefined) return undefined;
  // YYYY-MM-DD y que la fecha exista (rechaza 2026-02-30)
  const valida =
    /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
    new Date(`${valor}T00:00:00Z`).toISOString().startsWith(valor);
  return valida ? valor : invalido(nombre);
}

export function entero(
  query: Query,
  nombre: string,
  maximo: number,
): number | undefined {
  const valor = param(query, nombre);
  if (valor === undefined) return undefined;
  const numero = Number(valor);
  return /^[+-]?\d+$/.test(valor) && Math.abs(numero) <= maximo
    ? numero
    : invalido(nombre);
}
