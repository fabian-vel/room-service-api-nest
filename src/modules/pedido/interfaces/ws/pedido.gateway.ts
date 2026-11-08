import { Logger } from '@nestjs/common';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import type { IncomingMessage } from 'node:http';
import type { WebSocket } from 'ws';
import {
  type Claims,
  JwtService,
} from '../../../../shared/security/jwt.service.js';
import { PedidoNotificationUseCase } from '../../application/usecase/pedido-notification.use-case.js';

// 1003 = NOT_ACCEPTABLE
const CIERRE_TOKEN_INVALIDO = 1003;

/**
 * ws://host:puerto/ws/pedidos?token=<jwt>: con token de empleado envía cada evento de pedido;
 * con token de habitación, solo los eventos de sus pedidos (cambio de estado y cancelación)
 */
@WebSocketGateway({ path: '/ws/pedidos' })
export class PedidoGateway implements OnGatewayConnection {
  private readonly logger = new Logger(PedidoGateway.name);

  constructor(
    private readonly notificationUseCase: PedidoNotificationUseCase,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: WebSocket, request: IncomingMessage) {
    // el navegador no permite headers en el handshake, por eso el token viaja en la URL
    const token = new URL(
      request.url ?? '',
      'http://localhost',
    ).searchParams.get('token');
    if (!token) {
      this.logger.warn('WebSocket sin token - cerrando sesión');
      return client.close(CIERRE_TOKEN_INVALIDO);
    }

    let claims: Claims;
    try {
      claims = this.jwtService.validarToken(token);
    } catch (error) {
      this.logger.warn(`Token WebSocket inválido: ${(error as Error).message}`);
      return client.close(CIERRE_TOKEN_INVALIDO);
    }

    // la cocina recibe todos los eventos; una habitación solo los de sus pedidos
    const haacId = 'accesoId' in claims ? claims.accesoId : null;
    this.logger.log(`WebSocket autenticado: ${claims.sub}`);
    const cancelar = this.notificationUseCase.events((evento) => {
      if (haacId !== null && evento.haacId !== haacId) return;
      client.send(JSON.stringify(evento));
    });
    client.on('close', cancelar);
  }
}
