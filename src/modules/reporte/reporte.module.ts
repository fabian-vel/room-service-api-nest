import { Module } from '@nestjs/common';
import { ReporteUseCase } from './application/usecase/reporte.use-case.js';
import { ReporteRepository } from './domain/port/reporte.repository.js';
import { ReporteAdapter } from './infrastructure/persistence/reporte.adapter.js';
import { ReporteController } from './interfaces/http/reporte.controller.js';

@Module({
  controllers: [ReporteController],
  providers: [
    ReporteUseCase,
    { provide: ReporteRepository, useClass: ReporteAdapter },
  ],
})
export class ReporteModule {}
