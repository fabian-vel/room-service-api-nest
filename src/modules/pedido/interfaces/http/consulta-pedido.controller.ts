import { Controller, ForbiddenException, Get, Query } from '@nestjs/common';
import {
  entero,
  fecha,
  param,
} from '../../../../shared/util/query-param.util.js';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Claims } from '../../../../shared/security/claims.decorator.js';
import type { Claims as ClaimsToken } from '../../../../shared/security/jwt.service.js';
import { ConsultaPedidoUseCase } from '../../application/usecase/consulta-pedido.use-case.js';
import type { ConsultaPedidoFiltro } from '../../domain/model/consulta-pedido.js';
import { ConsultaPedidoDocs } from './consulta-pedido.docs.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;
const SHORT_MAX = 32767;
const INT_MAX = 2147483647;

@ConsultaPedidoDocs.controller()
@Controller()
export class ConsultaPedidoController {
  constructor(private readonly consultaPedidoUseCase: ConsultaPedidoUseCase) {}

  @Get('consulta-pedidos')
  @ConsultaPedidoDocs.porHabitacion()
  async consultarPedidoPorUsuario(@Claims() claims: ClaimsToken) {
    if (!('accesoId' in claims))
      throw new ForbiddenException('El token no corresponde a una habitación');
    const pedidos = await this.consultaPedidoUseCase.consultarPedidoPorUsuario(
      claims.accesoId,
    );
    return ApiResponse.ok(
      'Pedidos consultados exitosamente',
      pedidos,
      pedidos.length,
    );
  }

  @Get('consulta-pedidos-fecha-actual')
  @ConsultaPedidoDocs.fechaActual()
  async consultarPedidoFechaActual() {
    const pedidos =
      await this.consultaPedidoUseCase.consultarPedidoFechaActual();
    return ApiResponse.ok(
      'Pedidos del dia consultados exitosamente',
      pedidos,
      pedidos.length,
    );
  }

  @Get('pedidos')
  @ConsultaPedidoDocs.filtro()
  async consultarPedidoFiltro(@Query() query: Record<string, unknown>) {
    const pagina = await this.consultaPedidoUseCase.consultarPedidoFiltro(
      toFiltro(query),
    );
    return ApiResponse.ok(
      'Pedidos consultados exitosamente',
      pagina,
      pagina.items.length,
    );
  }
}

export function toFiltro(query: Record<string, unknown>): ConsultaPedidoFiltro {
  return {
    fechaDesde: fecha(query, 'fechaDesde'),
    fechaHasta: fecha(query, 'fechaHasta'),
    estadoPedido: entero(query, 'estadoPedido', SHORT_MAX),
    habitacion: param(query, 'habitacion'),
    producto: param(query, 'producto'),
    page: entero(query, 'page', INT_MAX) ?? DEFAULT_PAGE,
    size: entero(query, 'size', INT_MAX) ?? DEFAULT_SIZE,
  };
}
