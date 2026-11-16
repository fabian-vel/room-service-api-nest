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
import { Acceso } from '../../../../shared/security/acceso.js';
import { Claims } from '../../../../shared/security/claims.decorator.js';
import type { Claims as ClaimsToken } from '../../../../shared/security/jwt.service.js';
import { EmpleadoUseCase } from '../../application/usecase/empleado.use-case.js';
import type { EmpleadoGuardar } from '../../domain/model/empleado.js';
import { EmpleadoDocs } from './empleado.docs.js';

@EmpleadoDocs.controller()
@Acceso('EMPLEADOS')
@Controller('empleados')
export class EmpleadoController {
  constructor(private readonly empleadoUseCase: EmpleadoUseCase) {}

  @Get()
  @EmpleadoDocs.consultar()
  async consultarEmpleados() {
    const empleados = await this.empleadoUseCase.consultarEmpleados();
    return ApiResponse.ok(
      'Empleados consultados exitosamente',
      empleados,
      empleados.length,
    );
  }

  @Post()
  @HttpCode(200)
  @EmpleadoDocs.insertar()
  async insertarEmpleado(@Body() empleado: Partial<EmpleadoGuardar>) {
    const id = await this.empleadoUseCase.insertarEmpleado(empleado);
    return ApiResponse.ok('Empleado creado exitosamente', id, 1);
  }

  @Put(':id')
  @EmpleadoDocs.actualizar()
  async actualizarEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Body() empleado: Partial<EmpleadoGuardar>,
    @Claims() claims: ClaimsToken,
  ) {
    const filas = await this.empleadoUseCase.actualizarEmpleado(
      { ...empleado, emplId: id },
      claims.sub,
    );
    return ApiResponse.ok('Empleado actualizado exitosamente', filas, 1);
  }

  @Delete(':id')
  @EmpleadoDocs.eliminar()
  async eliminarEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Claims() claims: ClaimsToken,
  ) {
    const filas = await this.empleadoUseCase.eliminarEmpleado(id, claims.sub);
    return ApiResponse.ok('Empleado eliminado exitosamente', filas, 1);
  }
}
