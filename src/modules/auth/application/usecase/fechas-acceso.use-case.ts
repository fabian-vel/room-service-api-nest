import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../shared/domain/exception/not-found.exception.js';
import { HabitacionAccesoRepository } from '../../domain/port/habitacion-acceso.repository.js';

export interface FechasAccesoResponse {
  haacId: number;
  haacFechaInicio: Date;
  haacFechaFin: Date;
}

@Injectable()
export class FechasAccesoUseCase {
  constructor(
    private readonly habitacionAccesoRepository: HabitacionAccesoRepository,
  ) {}

  async consultaFechaAcceso(haacId: unknown): Promise<FechasAccesoResponse> {
    // en Java un haacId nulo terminaba en 500 y un acceso inexistente en una respuesta vacía
    if (!Number.isInteger(haacId))
      throw new BusinessException('El haacId no puede ser nulo');
    const acceso = await this.habitacionAccesoRepository.consultaFechasAcceso(
      haacId as number,
    );
    if (!acceso) throw new NotFoundException('Acceso no encontrado');
    return {
      haacId: acceso.haacId,
      haacFechaInicio: acceso.haacFechaInicio,
      haacFechaFin: acceso.haacFechaFin,
    };
  }
}
