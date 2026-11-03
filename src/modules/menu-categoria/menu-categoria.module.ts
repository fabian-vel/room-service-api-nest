import { Module } from '@nestjs/common';
import { MenuCategoriaUseCase } from './application/usecase/menu-categoria.use-case.js';
import { MenuCategoriaRepository } from './domain/port/menu-categoria.repository.js';
import { MenuCategoriaRepositoryAdapter } from './infrastructure/persistence/menu-categoria.repository-adapter.js';
import { MenuCategoriaController } from './interfaces/http/menu-categoria.controller.js';

@Module({
  controllers: [MenuCategoriaController],
  // el puerto MenuCategoriaRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    MenuCategoriaUseCase,
    {
      provide: MenuCategoriaRepository,
      useClass: MenuCategoriaRepositoryAdapter,
    },
  ],
})
export class MenuCategoriaModule {}
