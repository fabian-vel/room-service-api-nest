import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { MenuItemUseCase } from '../../application/usecase/menu-item.use-case.js';
import type { MenuItemRequest } from '../../domain/model/menu-item.js';

@ApiTags('Menú')
@Controller('menu')
export class MenuItemController {
  constructor(private readonly menuItemUseCase: MenuItemUseCase) {}

  @Post()
  @HttpCode(200)
  @ApiBody({ schema: { example: { mecaId: 1 } } })
  async consultaItemsPorCategoria(@Body() request: MenuItemRequest) {
    const items =
      await this.menuItemUseCase.consultarItemsPorCategoria(request);
    return ApiResponse.ok('Menu consultados exitosamente', items, items.length);
  }
}
