/** true si el valor no es un texto con contenido (equivale a null || isBlank() en Java) */
export function esTextoVacio(valor: unknown): boolean {
  return typeof valor !== 'string' || valor.trim() === '';
}
