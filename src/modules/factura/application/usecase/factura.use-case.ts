import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { NotFoundException } from '../../../../shared/domain/exception/not-found.exception.js';
import { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import {
  type AccesoFactura,
  type Factura,
  METODOS_PAGO,
  type PagoRequest,
} from '../../domain/model/factura.js';
import { FacturaRepository } from '../../domain/port/factura.repository.js';

@Injectable()
export class FacturaUseCase {
  constructor(
    private readonly facturaRepository: FacturaRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  buscarAccesos(habitacion?: string): Promise<AccesoFactura[]> {
    const texto = habitacion?.trim() || null;
    if (texto && texto.length > 10)
      throw new BusinessException(
        'La habitación no puede tener más de 10 caracteres',
      );
    return this.facturaRepository.buscarAccesos({ habitacion: texto });
  }

  async consultarFactura(haacId: number): Promise<Factura> {
    const [acceso] = await this.facturaRepository.buscarAccesos({ haacId });
    if (!acceso)
      throw new NotFoundException('Acceso de habitación no encontrado');
    const [pedidos, pagos] = await Promise.all([
      this.facturaRepository.consultarPedidos(haacId),
      this.facturaRepository.consultarPagos(haacId),
    ]);
    return { acceso, pedidos, pagos };
  }

  /** Cobra todos los pedidos pendientes del acceso; solo si ya están entregados */
  async cobrar(
    haacId: number,
    request: PagoRequest,
    usuario: string,
  ): Promise<number> {
    const { metodo, observacion } = validarPago(request);

    // en una transacción: los pedidos quedan bloqueados, así no se cobran dos veces
    return this.transactionManager.ejecutar(async () => {
      const pedidos =
        await this.facturaRepository.bloquearPedidosPorCobrar(haacId);
      if (pedidos.length === 0)
        throw new BusinessException('No hay pedidos pendientes de cobro');

      const sinEntregar = pedidos.filter(
        (p) => p.espeLlaveMst !== 'ESTA_PEDI_ENTR',
      ).length;
      if (sinEntregar > 0)
        throw new BusinessException(
          `Hay ${sinEntregar} pedido(s) sin entregar; se cobran cuando estén entregados`,
        );

      const pediIds = pedidos.map((p) => p.pediId);
      const pagoId = await this.facturaRepository.insertarPago({
        haacId,
        usuario,
        metodo,
        observacion,
        pediIds,
      });
      if (pagoId == null)
        throw new BusinessException(
          'El usuario de la sesión no es un empleado activo',
        );
      await this.facturaRepository.marcarPedidosPagados(pagoId, pediIds);
      return pagoId;
    });
  }
}

export function validarPago(request: PagoRequest) {
  if (!METODOS_PAGO.includes(request.pagoMetodo as string))
    throw new BusinessException(
      `El método de pago debe ser uno de: ${METODOS_PAGO.join(', ')}`,
    );
  const observacion = request.pagoObservacion;
  if (observacion != null && typeof observacion !== 'string')
    throw new BusinessException('La observación no es válida');
  const texto = observacion?.trim() || null;
  if (texto && texto.length > 255)
    throw new BusinessException(
      'La observación no puede tener más de 255 caracteres',
    );
  return { metodo: request.pagoMetodo as string, observacion: texto };
}
