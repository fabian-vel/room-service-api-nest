import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { esTextoVacio } from '../../../../shared/util/validacion.util.js';
import type { Etiqueta } from '../../domain/model/etiqueta.js';
import type { EtiquetaRequest } from '../../domain/model/etiqueta-request.js';
import { EtiquetaRepository } from '../../domain/port/etiqueta.repository.js';

@Injectable()
export class EtiquetaUseCase {
  constructor(private readonly etiquetaRepository: EtiquetaRepository) {}

  async consultaEtiqueta(request: EtiquetaRequest): Promise<Etiqueta[]> {
    if (request.consultaPorCategoria && request.mecaId == null) {
      throw new BusinessException('El id de la categoría es obligatorio');
    } else if (!request.consultaPorCategoria && request.meitId == null) {
      throw new BusinessException('El id del item del menú es obligatorio');
    }
    return this.etiquetaRepository.consultaEtiqueta(request);
  }

  consultarEtiquetas(): Promise<Etiqueta[]> {
    return this.etiquetaRepository.consultarEtiquetas();
  }

  async insertarEtiqueta(etiqueta: Etiqueta): Promise<number> {
    this.validar(etiqueta);
    return this.etiquetaRepository.insertarEtiqueta(etiqueta);
  }

  async actualizarEtiqueta(etiqueta: Etiqueta): Promise<number> {
    if (etiqueta.etiqId == null)
      throw new BusinessException('El id de la etiqueta es obligatorio');
    this.validar(etiqueta);
    const rows = await this.etiquetaRepository.actualizarEtiqueta(etiqueta);
    if (rows === 0) throw new BusinessException('Etiqueta no encontrada');
    return rows;
  }

  async eliminarEtiqueta(etiqId: number): Promise<number> {
    if (etiqId == null)
      throw new BusinessException('El id de la etiqueta es obligatorio');
    const rows = await this.etiquetaRepository.eliminarEtiqueta(etiqId);
    if (rows === 0) throw new BusinessException('Etiqueta no encontrada');
    return rows;
  }

  private validar(etiqueta: Etiqueta) {
    if (esTextoVacio(etiqueta.etiqLlaveMst))
      throw new BusinessException('La llave de la etiqueta es obligatoria');
    if (esTextoVacio(etiqueta.etiqNombre))
      throw new BusinessException('El nombre de la etiqueta es obligatorio');
  }
}
