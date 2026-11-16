import { Module } from '@nestjs/common';
import { AccesoHabitacionUseCase } from './application/usecase/acceso-habitacion.use-case.js';
import { AccesoHabitacionRepository } from './domain/port/acceso-habitacion.repository.js';
import { AccesoHabitacionRepositoryAdapter } from './infrastructure/persistence/acceso-habitacion.repository-adapter.js';
import { AccesoHabitacionController } from './interfaces/http/acceso-habitacion.controller.js';

@Module({
  controllers: [AccesoHabitacionController],
  // el puerto AccesoHabitacionRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    AccesoHabitacionUseCase,
    {
      provide: AccesoHabitacionRepository,
      useClass: AccesoHabitacionRepositoryAdapter,
    },
  ],
})
export class AccesoHabitacionModule {}
