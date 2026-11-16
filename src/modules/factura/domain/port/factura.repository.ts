import type {
  AccesoFactura,
  PagoFactura,
  PagoNuevo,
  PedidoFactura,
} from '../model/factura.js';

// clase abstracta (no interface) para que sirva de token de inyección en Nest
export abstract class FacturaRepository {
  /** Sin filtros devuelve solo los accesos con saldo pendiente */
  abstract buscarAccesos(filtro: {
    haacId?: number | null;
    habitacion?: string | null;
  }): Promise<AccesoFactura[]>;
  abstract consultarPedidos(haacId: number): Promise<PedidoFactura[]>;
  abstract consultarPagos(haacId: number): Promise<PagoFactura[]>;
  /** Pedidos sin pagar ni cancelar, bloqueados hasta el fin de la transacción */
  abstract bloquearPedidosPorCobrar(
    haacId: number,
  ): Promise<{ pediId: number; espeLlaveMst: string }[]>;
  /** Devuelve null si el usuario de la sesión no es un empleado activo */
  abstract insertarPago(pago: PagoNuevo): Promise<number | null>;
  abstract marcarPedidosPagados(
    pagoId: number,
    pediIds: number[],
  ): Promise<number>;
}
