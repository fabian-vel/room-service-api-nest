import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import type { Pagina } from '../../../../shared/domain/model/pagina.js';
import type {
  ConsultaPedido,
  ConsultaPedidoFiltro,
} from '../../domain/model/consulta-pedido.js';
import { ConsultaPedidoRepository } from '../../domain/port/consulta-pedido.repository.js';

const MAX_SIZE = 100;

@Injectable()
export class ConsultaPedidoUseCase {
  constructor(
    private readonly consultaPedidoRepository: ConsultaPedidoRepository,
  ) {}

  consultarPedidoPorUsuario(haacId: number): Promise<ConsultaPedido[]> {
    return this.consultaPedidoRepository.consultarPedidoPorUsuario(haacId);
  }

  consultarPedidoFechaActual(): Promise<ConsultaPedido[]> {
    return this.consultaPedidoRepository.consultarPedidoFechaActual();
  }

  async consultarPedidoFiltro(
    filtro: ConsultaPedidoFiltro,
  ): Promise<Pagina<ConsultaPedido>> {
    if (filtro.page < 1) {
      throw new BusinessException('La página debe ser mayor o igual a 1');
    }
    if (filtro.size < 1 || filtro.size > MAX_SIZE) {
      throw new BusinessException(
        `El tamaño de página debe estar entre 1 y ${MAX_SIZE}`,
      );
    }
    // YYYY-MM-DD se compara bien como texto
    if (
      filtro.fechaDesde &&
      filtro.fechaHasta &&
      filtro.fechaDesde > filtro.fechaHasta
    ) {
      throw new BusinessException(
        'La fecha inicial no puede ser mayor a la fecha final',
      );
    }
    return this.consultaPedidoRepository.consultarPedidoFiltro(filtro);
  }
}
