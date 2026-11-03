export class SqlLoadException extends Error {
  constructor(path: string, cause?: unknown) {
    super(`Error cargando SQL: ${path}`, { cause });
    this.name = 'SqlLoadException';
  }
}
