import { Module } from '@nestjs/common';
import { EmpleadoUseCase } from './application/usecase/empleado.use-case.js';
import { EmpleadoRepository } from './domain/port/empleado.repository.js';
import { EmpleadoRepositoryAdapter } from './infrastructure/persistence/empleado.repository-adapter.js';
import { EmpleadoController } from './interfaces/http/empleado.controller.js';

@Module({
  controllers: [EmpleadoController],
  // el puerto EmpleadoRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    EmpleadoUseCase,
    { provide: EmpleadoRepository, useClass: EmpleadoRepositoryAdapter },
  ],
})
export class EmpleadoModule {}
