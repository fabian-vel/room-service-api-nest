import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { esTextoVacio } from '../../../../shared/util/validacion.util.js';
import type { Constantes } from '../../domain/model/constantes.js';
import { ConstantesRepository } from '../../domain/port/constantes.repository.js';

@Injectable()
export class ConstantesUseCase {
  constructor(private readonly constantesRepository: ConstantesRepository) {}

  consultarConstantes(): Promise<Constantes[]> {
    return this.constantesRepository.consultarConstantes();
  }

  async insertarConstante(constante: Constantes): Promise<number> {
    this.validar(constante);
    return this.constantesRepository.insertarConstante(constante);
  }

  async actualizarConstante(constante: Constantes): Promise<number> {
    if (constante.consId == null)
      throw new BusinessException('El id de la constante es obligatorio');
    this.validar(constante);
    const rows = await this.constantesRepository.actualizarConstante(constante);
    if (rows === 0) throw new BusinessException('Constante no encontrada');
    return rows;
  }

  async eliminarConstante(consId: number): Promise<number> {
    if (consId == null)
      throw new BusinessException('El id de la constante es obligatorio');
    const rows = await this.constantesRepository.eliminarConstante(consId);
    if (rows === 0) throw new BusinessException('Constante no encontrada');
    return rows;
  }

  private validar(constante: Constantes) {
    if (esTextoVacio(constante.consLlave))
      throw new BusinessException('La llave de la constante es obligatoria');
    if (esTextoVacio(constante.consValor))
      throw new BusinessException('El valor de la constante es obligatorio');
  }
}
