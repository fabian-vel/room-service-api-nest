import { BusinessException } from '../../domain/exception/business.exception.js';
import type { ReglaNegocio } from '../rule/regla-negocio.js';

export class MotorReglas<T> {
  private readonly reglasMap: Map<string, ReglaNegocio<T>>;

  constructor(reglas: ReglaNegocio<T>[]) {
    this.reglasMap = new Map(reglas.map((regla) => [regla.ruleId, regla]));
  }

  /** Ejecuta las reglas en el orden dado; la primera que falla detiene el resto */
  async aplicar(ruleIds: string[], contexto: T): Promise<void> {
    for (const ruleId of ruleIds) {
      const regla = this.reglasMap.get(ruleId);
      if (!regla) throw new BusinessException(`Regla no encontrada: ${ruleId}`);
      await regla.validar(contexto);
    }
  }
}
