/** true si el valor no es un texto con contenido (null, vacío o solo espacios) */
export function esTextoVacio(valor: unknown): boolean {
  return typeof valor !== 'string' || valor.trim() === '';
}
