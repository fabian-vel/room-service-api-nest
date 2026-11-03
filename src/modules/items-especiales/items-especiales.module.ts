import { Module } from '@nestjs/common';
import { ConstantesModule } from '../constantes/constantes.module.js';
import { ItemsEspecialesUseCase } from './application/usecase/items-especiales.use-case.js';
import { ItemsEspecialesRepository } from './domain/port/items-especiales.repository.js';
import { ItemsEspecialesAdapter } from './infrastructure/persistence/items-especiales.adapter.js';
import { ItemsEspecialesController } from './interfaces/http/items-especiales.controller.js';

@Module({
  imports: [ConstantesModule],
  controllers: [ItemsEspecialesController],
  // el puerto ItemsEspecialesRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    ItemsEspecialesUseCase,
    { provide: ItemsEspecialesRepository, useClass: ItemsEspecialesAdapter },
  ],
})
export class ItemsEspecialesModule {}
