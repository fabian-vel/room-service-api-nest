import { Controller, ForbiddenException, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Claims } from '../../../../shared/security/claims.decorator.js';
import type { Claims as ClaimsToken } from '../../../../shared/security/jwt.service.js';
import { ConsultaPedidoUseCase } from '../../application/usecase/consulta-pedido.use-case.js';
import type { ConsultaPedidoFiltro } from '../../domain/model/consulta-pedido.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;
const SHORT_MAX = 32767;
const INT_MAX = 2147483647;

@ApiTags('Pedidos')
@Controller()
export class ConsultaPedidoController {
  constructor(private readonly consultaPedidoUseCase: ConsultaPedidoUseCase) {}

  @Get('consulta-pedidos')
  async consultarPedidoPorUsuario(@Claims() claims: ClaimsToken) {
    // solo los tokens de habitación traen accesoId
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
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: 'string',
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: 'string',
    description: 'YYYY-MM-DD (incluye todo el día)',
  })
  @ApiQuery({
    name: 'estadoPedido',
    required: false,
    type: 'integer',
    description:
      'espe_id de mst_estados_pedido (1 pendiente, 2 en preparación, 3 entregado, 4 cancelado)',
  })
  @ApiQuery({
    name: 'habitacion',
    required: false,
    type: 'string',
    description: 'Número exacto de habitación',
  })
  @ApiQuery({
    name: 'producto',
    required: false,
    type: 'string',
    description: 'Parte del nombre de un producto del pedido',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'integer',
    description: 'Página, desde 1 (por defecto 1)',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: 'integer',
    description: 'Tamaño de página, 1 a 100 (por defecto 20)',
  })
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

/** Valor del parámetro sin espacios; undefined si no viene o está vacío (si se repite, toma el primero) */
function param(
  query: Record<string, unknown>,
  nombre: string,
): string | undefined {
  const valor = Array.isArray(query[nombre]) ? query[nombre][0] : query[nombre];
  const texto = typeof valor === 'string' ? valor.trim() : '';
  return texto || undefined;
}

function invalido(nombre: string): never {
  throw new BusinessException(`El parámetro ${nombre} no es válido`);
}

function fecha(
  query: Record<string, unknown>,
  nombre: string,
): string | undefined {
  const valor = param(query, nombre);
  if (valor === undefined) return undefined;
  // YYYY-MM-DD y que la fecha exista (rechaza 2026-02-30)
  const valida =
    /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
    new Date(`${valor}T00:00:00Z`).toISOString().startsWith(valor);
  return valida ? valor : invalido(nombre);
}

function entero(
  query: Record<string, unknown>,
  nombre: string,
  maximo: number,
): number | undefined {
  const valor = param(query, nombre);
  if (valor === undefined) return undefined;
  const numero = Number(valor);
  return /^[+-]?\d+$/.test(valor) && Math.abs(numero) <= maximo
    ? numero
    : invalido(nombre);
}
