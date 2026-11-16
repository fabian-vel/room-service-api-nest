import { Module } from '@nestjs/common';
import { FacturaUseCase } from './application/usecase/factura.use-case.js';
import { FacturaRepository } from './domain/port/factura.repository.js';
import { FacturaRepositoryAdapter } from './infrastructure/persistence/factura.repository-adapter.js';
import { FacturaController } from './interfaces/http/factura.controller.js';

@Module({
  controllers: [FacturaController],
  // el puerto FacturaRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    FacturaUseCase,
    { provide: FacturaRepository, useClass: FacturaRepositoryAdapter },
  ],
})
export class FacturaModule {}
