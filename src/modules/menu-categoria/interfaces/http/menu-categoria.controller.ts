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
import { SuccessMessages } from '../../../../shared/constant/success-messages.js';
import { MenuCategoriaUseCase } from '../../application/usecase/menu-categoria.use-case.js';
import type { MenuCategoria } from '../../domain/model/menu-categoria.js';

@Controller('categorias')
export class MenuCategoriaController {
  constructor(private readonly menuCategoriaUseCase: MenuCategoriaUseCase) {}

  @Get()
  async consultarCategorias() {
    const categorias = await this.menuCategoriaUseCase.consultarCategorias();
    return ApiResponse.ok(
      SuccessMessages.CATEGORIAS_CONSULTADAS,
      categorias,
      categorias.length,
    );
  }

  @Get('todas')
  async consultarCategoriasTodas() {
    const categorias =
      await this.menuCategoriaUseCase.consultarCategoriasTodas();
    return ApiResponse.ok(
      'Categorías consultadas exitosamente',
      categorias,
      categorias.length,
    );
  }

  @Post()
  @HttpCode(200)
  async insertarCategoria(@Body() categoria: MenuCategoria) {
    const id = await this.menuCategoriaUseCase.insertarCategoria(categoria);
    return ApiResponse.ok('Categoría creada exitosamente', id, 1);
  }

  @Put(':id')
  async actualizarCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() categoria: MenuCategoria,
  ) {
    const rows = await this.menuCategoriaUseCase.actualizarCategoria({
      ...categoria,
      mecaId: id,
    });
    return ApiResponse.ok('Categoría actualizada exitosamente', rows, 1);
  }

  @Delete(':id')
  async eliminarCategoria(@Param('id', ParseIntPipe) id: number) {
    const rows = await this.menuCategoriaUseCase.eliminarCategoria(id);
    return ApiResponse.ok('Categoría eliminada exitosamente', rows, 1);
  }
}
