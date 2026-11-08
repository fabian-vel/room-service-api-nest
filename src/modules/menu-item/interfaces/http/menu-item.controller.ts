import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { MenuItemUseCase } from '../../application/usecase/menu-item.use-case.js';
import type { MenuItemRequest } from '../../domain/model/menu-item.js';
import { MenuItemDocs } from './menu-item.docs.js';

@MenuItemDocs.controller()
@Controller('menu')
export class MenuItemController {
  constructor(private readonly menuItemUseCase: MenuItemUseCase) {}

  @Post()
  @HttpCode(200)
  @MenuItemDocs.consultarPorCategoria()
  async consultaItemsPorCategoria(@Body() request: MenuItemRequest) {
    const items =
      await this.menuItemUseCase.consultarItemsPorCategoria(request);
    return ApiResponse.ok('Menu consultados exitosamente', items, items.length);
  }
}
