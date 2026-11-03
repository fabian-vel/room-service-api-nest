import type { Constantes } from '../model/constantes.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class ConstantesRepository {
  /** valor de cada constante activa pedida, por llave */
  abstract consultaConstantes(llaves: string[]): Promise<Map<string, string>>;
  abstract consultarConstantes(): Promise<Constantes[]>;
  abstract insertarConstante(constante: Constantes): Promise<number>;
  abstract actualizarConstante(constante: Constantes): Promise<number>;
  abstract eliminarConstante(consId: number): Promise<number>;
}
