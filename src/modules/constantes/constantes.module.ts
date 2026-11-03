import { Module } from '@nestjs/common';
import { ConstantesUseCase } from './application/usecase/constantes.use-case.js';
import { ConstantesRepository } from './domain/port/constantes.repository.js';
import { ConstantesAdapter } from './infrastructure/persistence/constantes.adapter.js';
import { ConstantesController } from './interfaces/http/constantes.controller.js';

@Module({
  controllers: [ConstantesController],
  // el puerto ConstantesRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    ConstantesUseCase,
    { provide: ConstantesRepository, useClass: ConstantesAdapter },
  ],
})
export class ConstantesModule {}
