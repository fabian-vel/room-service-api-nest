import { Injectable } from '@nestjs/common';
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

  async consultaFechaAcceso(haacId: number): Promise<FechasAccesoResponse> {
    const acceso =
      await this.habitacionAccesoRepository.consultaFechasAcceso(haacId);
    if (!acceso) throw new NotFoundException('Acceso no encontrado');
    return {
      haacId: acceso.haacId,
      haacFechaInicio: acceso.haacFechaInicio,
      haacFechaFin: acceso.haacFechaFin,
    };
  }
}
