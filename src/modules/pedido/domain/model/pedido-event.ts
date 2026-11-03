export enum PedidoEventType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  CANCELLED = 'CANCELLED',
}

export interface PedidoEvent<T = unknown> {
  type: PedidoEventType;
  pedidoId: number;
  haacId?: number;
  eventDate: string;
  payload?: T;
}
