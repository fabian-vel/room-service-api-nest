import type { Etiqueta } from '../model/etiqueta.js';
import type { EtiquetaRequest } from '../model/etiqueta-request.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class EtiquetaRepository {
  abstract consultaEtiqueta(request: EtiquetaRequest): Promise<Etiqueta[]>;
  abstract consultarEtiquetas(): Promise<Etiqueta[]>;
  abstract insertarEtiqueta(etiqueta: Etiqueta): Promise<number>;
  abstract actualizarEtiqueta(etiqueta: Etiqueta): Promise<number>;
  abstract eliminarEtiqueta(etiqId: number): Promise<number>;
}
