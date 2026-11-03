import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Claims } from '../../../../shared/security/claims.decorator.js';
import type { Claims as ClaimsToken } from '../../../../shared/security/jwt.service.js';
import { PedidoUseCase } from '../../application/usecase/pedido.use-case.js';
import type { PedidoCriterio } from '../../domain/model/pedido.js';

@ApiTags('Pedidos')
@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoUseCase: PedidoUseCase) {}

  @Post()
  @HttpCode(200)
  @ApiBody({
    schema: {
      example: {
        observacion: 'Sin cebolla',
        items: [
          { meitId: 1, cantidad: 2, observacion: null },
          { meitId: 12, cantidad: 1, observacion: 'Bien frío' },
        ],
      },
    },
  })
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
}
