import { Module } from '@nestjs/common';
import { EtiquetaUseCase } from './application/usecase/etiqueta.use-case.js';
import { EtiquetaRepository } from './domain/port/etiqueta.repository.js';
import { EtiquetaRepositoryAdapter } from './infrastructure/persistence/etiqueta.repository-adapter.js';
import { EtiquetaController } from './interfaces/http/etiqueta.controller.js';

@Module({
  controllers: [EtiquetaController],
  // el puerto EtiquetaRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    EtiquetaUseCase,
    { provide: EtiquetaRepository, useClass: EtiquetaRepositoryAdapter },
  ],
})
export class EtiquetaModule {}
