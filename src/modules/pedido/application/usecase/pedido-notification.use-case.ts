import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import {
  type PedidoEvent,
  PedidoEventType,
} from '../../domain/model/pedido-event.js';

const EVENTO = 'pedido';

/** Publica los eventos de pedidos a quien esté suscrito (WebSocket de cocina) */
@Injectable()
export class PedidoNotificationUseCase {
  private readonly emitter = new EventEmitter();

  /** Se suscribe a los eventos; devuelve la función para cancelar la suscripción */
  events(listener: (event: PedidoEvent) => void): () => void {
    this.emitter.on(EVENTO, listener);
    return () => this.emitter.off(EVENTO, listener);
  }

  publish(event: PedidoEvent): void {
    this.emitter.emit(EVENTO, event);
  }

  publishCreated(pedidoId: number): void {
    this.publish({
      type: PedidoEventType.CREATED,
      pedidoId,
      eventDate: new Date().toISOString(),
    });
  }

  publishCancelled(
    pedidoId: number,
    haacId: number,
    estado: { espeId: number; espeNombre: string },
  ): void {
    this.publish({
      type: PedidoEventType.CANCELLED,
      pedidoId,
      haacId,
      eventDate: new Date().toISOString(),
      payload: estado,
    });
  }

  publishStatusChanged(
    pedidoId: number,
    haacId: number,
    estado: { espeId: number; espeNombre: string },
  ): void {
    this.publish({
      type: PedidoEventType.STATUS_CHANGED,
      pedidoId,
      haacId,
      eventDate: new Date().toISOString(),
      payload: estado,
    });
  }
}
