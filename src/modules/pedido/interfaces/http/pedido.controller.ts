import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Claims } from '../../../../shared/security/claims.decorator.js';
import type { Claims as ClaimsToken } from '../../../../shared/security/jwt.service.js';
import { CambiarEstadoPedidoUseCase } from '../../application/usecase/cambiar-estado-pedido.use-case.js';
import { CancelarPedidoUseCase } from '../../application/usecase/cancelar-pedido.use-case.js';
import { PedidoUseCase } from '../../application/usecase/pedido.use-case.js';
import type { PedidoCriterio } from '../../domain/model/pedido.js';
import { PedidoDocs } from './pedido.docs.js';
import { Acceso, HABITACION } from '../../../../shared/security/acceso.js';

@PedidoDocs.controller()
@Controller('pedido')
export class PedidoController {
  constructor(
    private readonly pedidoUseCase: PedidoUseCase,
    private readonly cambiarEstadoPedidoUseCase: CambiarEstadoPedidoUseCase,
    private readonly cancelarPedidoUseCase: CancelarPedidoUseCase,
  ) {}

  @Post()
  @Acceso(HABITACION)
  @HttpCode(200)
  @PedidoDocs.crear()
  async crearPedido(
    @Body() criterio: PedidoCriterio,
    @Claims() claims: ClaimsToken,
  ) {
    if (!('accesoId' in claims))
      throw new ForbiddenException('El token no corresponde a una habitación');
    const mensaje = await this.pedidoUseCase.crearPedido(
      criterio,
      claims.accesoId,
    );
    return ApiResponse.ok('Pedido creado exitosamente', mensaje, 1);
  }

  @Put(':id/estado')
  @Acceso('GESTION_PEDIDOS')
  @PedidoDocs.cambiarEstado()
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estadoPedido?: number },
    @Claims() claims: ClaimsToken,
  ) {
    // el guard ya rechaza el token de habitación; el mesero solo entrega
    const estado = await this.cambiarEstadoPedidoUseCase.cambiarEstado(
      id,
      body?.estadoPedido,
      'rol' in claims && claims.rol === 'MESERO',
    );
    return ApiResponse.ok('Estado del pedido actualizado', estado, 1);
  }

  @Post(':id/cancelar')
  @Acceso(HABITACION)
  @HttpCode(200)
  @PedidoDocs.cancelar()
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Claims() claims: ClaimsToken,
  ) {
    if (!('accesoId' in claims))
      throw new ForbiddenException('El token no corresponde a una habitación');
    const estado = await this.cancelarPedidoUseCase.cancelar(
      id,
      claims.accesoId,
    );
    return ApiResponse.ok('Pedido cancelado', estado, 1);
  }
}
