import { BusinessException } from '../domain/exception/business.exception.js';

export function getConstante(
  constantes: Map<string, string>,
  llave: string,
): string {
  const valor = constantes.get(llave);
  if (valor == null)
    throw new BusinessException(`Constante no encontrada: ${llave}`);
  return valor;
}

/** Valor numérico de una constante; 422 si no existe o no es un número */
export function getConstanteNumero(
  constantes: Map<string, string>,
  llave: string,
): number {
  const valor = getConstante(constantes, llave);
  if (!/^[+-]?\d+$/.test(valor.trim()))
    throw new BusinessException(`Constante inválida: ${llave}`);
  return Number(valor);
}
