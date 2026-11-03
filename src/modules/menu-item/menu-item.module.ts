import { Module } from '@nestjs/common';
import { MenuItemUseCase } from './application/usecase/menu-item.use-case.js';
import { MenuItemRepository } from './domain/port/menu-item.repository.js';
import { MenuItemRepositoryAdapter } from './infrastructure/persistence/menu-item.repository-adapter.js';
import { MenuItemController } from './interfaces/http/menu-item.controller.js';

@Module({
  controllers: [MenuItemController],
  // el puerto MenuItemRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    MenuItemUseCase,
    { provide: MenuItemRepository, useClass: MenuItemRepositoryAdapter },
  ],
})
export class MenuItemModule {}
