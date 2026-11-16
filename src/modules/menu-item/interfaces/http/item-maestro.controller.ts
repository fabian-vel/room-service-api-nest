import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { MenuItemUseCase } from '../../application/usecase/menu-item.use-case.js';
import type { MenuItemGuardar } from '../../domain/model/menu-item.js';
import { ItemMaestroDocs } from './item-maestro.docs.js';
import { Acceso } from '../../../../shared/security/acceso.js';

// maestro de ítems del front; el menú de la app sigue en POST /menu
@ItemMaestroDocs.controller()
@Acceso('MAESTROS')
@Controller('items')
export class ItemMaestroController {
  constructor(private readonly menuItemUseCase: MenuItemUseCase) {}

  @Get()
  @ItemMaestroDocs.consultar()
  async consultarItems() {
    const items = await this.menuItemUseCase.consultarItems();
    return ApiResponse.ok(
      'Ítems consultados exitosamente',
      items,
      items.length,
    );
  }

  @Post()
  @HttpCode(200)
  @ItemMaestroDocs.insertar()
  async insertarItem(@Body() item: Partial<MenuItemGuardar>) {
    const id = await this.menuItemUseCase.insertarItem(item);
    return ApiResponse.ok('Ítem creado exitosamente', id, 1);
  }

  @Put(':id')
  @ItemMaestroDocs.actualizar()
  async actualizarItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() item: Partial<MenuItemGuardar>,
  ) {
    const filas = await this.menuItemUseCase.actualizarItem({
      ...item,
      meitId: id,
    });
    return ApiResponse.ok('Ítem actualizado exitosamente', filas, 1);
  }

  @Delete(':id')
  @ItemMaestroDocs.eliminar()
  async eliminarItem(@Param('id', ParseIntPipe) id: number) {
    const filas = await this.menuItemUseCase.eliminarItem(id);
    return ApiResponse.ok('Ítem eliminado exitosamente', filas, 1);
  }
}
