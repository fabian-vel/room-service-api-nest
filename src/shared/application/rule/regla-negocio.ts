export interface ReglaNegocio<T> {
  readonly ruleId: string;
  validar(contexto: T): Promise<void>;
}
