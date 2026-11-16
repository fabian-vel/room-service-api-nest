import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Acceso } from '../../../../shared/security/acceso.js';
import { Claims } from '../../../../shared/security/claims.decorator.js';
import type { Claims as ClaimsToken } from '../../../../shared/security/jwt.service.js';
import { param } from '../../../../shared/util/query-param.util.js';
import { FacturaUseCase } from '../../application/usecase/factura.use-case.js';
import type { PagoRequest } from '../../domain/model/factura.js';
import { FacturaDocs } from './factura.docs.js';

@FacturaDocs.controller()
@Acceso('FACTURA')
@Controller('facturas')
export class FacturaController {
  constructor(private readonly facturaUseCase: FacturaUseCase) {}

  @Get()
  @FacturaDocs.buscar()
  async buscarAccesos(@Query() query: Record<string, unknown>) {
    const accesos = await this.facturaUseCase.buscarAccesos(
      param(query, 'habitacion'),
    );
    return ApiResponse.ok(
      'Accesos consultados exitosamente',
      accesos,
      accesos.length,
    );
  }

  @Get(':haacId')
  @FacturaDocs.consultar()
  async consultarFactura(@Param('haacId', ParseIntPipe) haacId: number) {
    const factura = await this.facturaUseCase.consultarFactura(haacId);
    return ApiResponse.ok('Factura consultada exitosamente', factura, 1);
  }

  @Post(':haacId/pagos')
  @HttpCode(200)
  @FacturaDocs.cobrar()
  async cobrar(
    @Param('haacId', ParseIntPipe) haacId: number,
    @Body() request: PagoRequest,
    @Claims() claims: ClaimsToken,
  ) {
    const pagoId = await this.facturaUseCase.cobrar(
      haacId,
      request ?? {},
      claims.sub,
    );
    return ApiResponse.ok('Pago registrado exitosamente', pagoId, 1);
  }
}
