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
import { EtiquetaUseCase } from '../../application/usecase/etiqueta.use-case.js';
import type { Etiqueta } from '../../domain/model/etiqueta.js';
import type { EtiquetaRequest } from '../../domain/model/etiqueta-request.js';
import { EtiquetaDocs } from './etiqueta.docs.js';

@EtiquetaDocs.controller()
@Controller('etiquetas')
export class EtiquetaController {
  constructor(private readonly etiquetaUseCase: EtiquetaUseCase) {}

  @Post('consulta')
  @HttpCode(200)
  @EtiquetaDocs.consultaPorFiltro()
  async consultaEtiqueta(@Body() request: EtiquetaRequest) {
    const etiquetas = await this.etiquetaUseCase.consultaEtiqueta(request);
    return ApiResponse.ok(
      'Etiquetas consultadas exitosamente',
      etiquetas,
      etiquetas.length,
    );
  }

  @Get()
  @EtiquetaDocs.consultar()
  async consultarEtiquetas() {
    const etiquetas = await this.etiquetaUseCase.consultarEtiquetas();
    return ApiResponse.ok(
      'Etiquetas consultadas exitosamente',
      etiquetas,
      etiquetas.length,
    );
  }

  @Post()
  @HttpCode(200)
  @EtiquetaDocs.insertar()
  async insertarEtiqueta(@Body() etiqueta: Etiqueta) {
    const id = await this.etiquetaUseCase.insertarEtiqueta(etiqueta);
    return ApiResponse.ok('Etiqueta creada exitosamente', id, 1);
  }

  @Put(':id')
  @EtiquetaDocs.actualizar()
  async actualizarEtiqueta(
    @Param('id', ParseIntPipe) id: number,
    @Body() etiqueta: Etiqueta,
  ) {
    const rows = await this.etiquetaUseCase.actualizarEtiqueta({
      ...etiqueta,
      etiqId: id,
    });
    return ApiResponse.ok('Etiqueta actualizada exitosamente', rows, 1);
  }

  @Delete(':id')
  @EtiquetaDocs.eliminar()
  async eliminarEtiqueta(@Param('id', ParseIntPipe) id: number) {
    const rows = await this.etiquetaUseCase.eliminarEtiqueta(id);
    return ApiResponse.ok('Etiqueta eliminada exitosamente', rows, 1);
  }
}
