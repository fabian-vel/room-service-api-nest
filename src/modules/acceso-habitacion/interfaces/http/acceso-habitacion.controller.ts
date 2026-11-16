import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Acceso } from '../../../../shared/security/acceso.js';
import { param } from '../../../../shared/util/query-param.util.js';
import { AccesoHabitacionUseCase } from '../../application/usecase/acceso-habitacion.use-case.js';
import type { AccesoRequest } from '../../domain/model/acceso-habitacion.js';
import { AccesoHabitacionDocs } from './acceso-habitacion.docs.js';

@AccesoHabitacionDocs.controller()
@Acceso('ACCESOS')
@Controller('accesos')
export class AccesoHabitacionController {
  constructor(private readonly accesoUseCase: AccesoHabitacionUseCase) {}

  @Get()
  @AccesoHabitacionDocs.consultar()
  async consultarAccesos(@Query() query: Record<string, unknown>) {
    const accesos = await this.accesoUseCase.consultarAccesos(
      param(query, 'habitacion'),
    );
    return ApiResponse.ok(
      'Accesos consultados exitosamente',
      accesos,
      accesos.length,
    );
  }

  @Post()
  @HttpCode(200)
  @AccesoHabitacionDocs.registrar()
  async registrarAcceso(@Body() acceso: AccesoRequest) {
    const codigo = await this.accesoUseCase.registrarAcceso(acceso ?? {});
    return ApiResponse.ok('Huésped registrado exitosamente', codigo, 1);
  }

  @Put(':id')
  @AccesoHabitacionDocs.actualizar()
  async actualizarAcceso(
    @Param('id', ParseIntPipe) id: number,
    @Body() acceso: AccesoRequest,
  ) {
    const filas = await this.accesoUseCase.actualizarAcceso({
      ...acceso,
      haacId: id,
    });
    return ApiResponse.ok('Acceso actualizado exitosamente', filas, 1);
  }

  @Post(':id/codigo')
  @HttpCode(200)
  @AccesoHabitacionDocs.renovarCodigo()
  async renovarCodigo(@Param('id', ParseIntPipe) id: number) {
    const codigo = await this.accesoUseCase.renovarCodigo(id);
    return ApiResponse.ok('Código de acceso renovado', codigo, 1);
  }

  @Post(':id/finalizar')
  @HttpCode(200)
  @AccesoHabitacionDocs.finalizar()
  async finalizarAcceso(@Param('id', ParseIntPipe) id: number) {
    const filas = await this.accesoUseCase.finalizarAcceso(id);
    return ApiResponse.ok('Acceso finalizado', filas, 1);
  }
}
