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
import { ConstantesUseCase } from '../../application/usecase/constantes.use-case.js';
import type { Constantes } from '../../domain/model/constantes.js';
import { ConstantesDocs } from './constantes.docs.js';

@ConstantesDocs.controller()
@Controller('constantes')
export class ConstantesController {
  constructor(private readonly constantesUseCase: ConstantesUseCase) {}

  @Get()
  @ConstantesDocs.consultar()
  async consultarConstantes() {
    const constantes = await this.constantesUseCase.consultarConstantes();
    return ApiResponse.ok(
      'Constantes consultadas exitosamente',
      constantes,
      constantes.length,
    );
  }

  @Post()
  @HttpCode(200)
  @ConstantesDocs.insertar()
  async insertarConstante(@Body() constante: Constantes) {
    const id = await this.constantesUseCase.insertarConstante(constante);
    return ApiResponse.ok('Constante creada exitosamente', id, 1);
  }

  @Put(':id')
  @ConstantesDocs.actualizar()
  async actualizarConstante(
    @Param('id', ParseIntPipe) id: number,
    @Body() constante: Constantes,
  ) {
    const rows = await this.constantesUseCase.actualizarConstante({
      ...constante,
      consId: id,
    });
    return ApiResponse.ok('Constante actualizada exitosamente', rows, 1);
  }

  @Delete(':id')
  @ConstantesDocs.eliminar()
  async eliminarConstante(@Param('id', ParseIntPipe) id: number) {
    const rows = await this.constantesUseCase.eliminarConstante(id);
    return ApiResponse.ok('Constante eliminada exitosamente', rows, 1);
  }
}
