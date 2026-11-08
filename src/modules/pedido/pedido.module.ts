import { Module } from '@nestjs/common';
import { CambiarEstadoPedidoUseCase } from './application/usecase/cambiar-estado-pedido.use-case.js';
import { CancelarPedidoUseCase } from './application/usecase/cancelar-pedido.use-case.js';
import { ConsultaPedidoUseCase } from './application/usecase/consulta-pedido.use-case.js';
import { PedidoNotificationUseCase } from './application/usecase/pedido-notification.use-case.js';
import { PedidoUseCase } from './application/usecase/pedido.use-case.js';
import { ConsultaPedidoRepository } from './domain/port/consulta-pedido.repository.js';
import { PedidoRepository } from './domain/port/pedido.repository.js';
import { ConsultaPedidoAdapter } from './infrastructure/persistence/consulta-pedido.adapter.js';
import { PedidoAdapter } from './infrastructure/persistence/pedido.adapter.js';
import { ConsultaPedidoController } from './interfaces/http/consulta-pedido.controller.js';
import { PedidoController } from './interfaces/http/pedido.controller.js';
import { PedidoGateway } from './interfaces/ws/pedido.gateway.js';

@Module({
  controllers: [PedidoController, ConsultaPedidoController],
  providers: [
    PedidoUseCase,
    CambiarEstadoPedidoUseCase,
    CancelarPedidoUseCase,
    ConsultaPedidoUseCase,
    PedidoNotificationUseCase,
    PedidoGateway,
    { provide: PedidoRepository, useClass: PedidoAdapter },
    { provide: ConsultaPedidoRepository, useClass: ConsultaPedidoAdapter },
  ],
})
export class PedidoModule {}
