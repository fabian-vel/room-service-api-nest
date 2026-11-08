import { Module } from '@nestjs/common';
import { CambiarEstadoPedidoUseCase } from './application/usecase/cambiar-estado-pedido.use-case.js';
import { PedidoNotificationUseCase } from './application/usecase/pedido-notification.use-case.js';
import { PedidoUseCase } from './application/usecase/pedido.use-case.js';
import { EstadoPedidoRepository } from './domain/port/estado-pedido.repository.js';
import { InferirDatosPedidoRepository } from './domain/port/inferir-datos-pedido.repository.js';
import { InsertarDetallePedidoRepository } from './domain/port/insertar-detalle-pedido.repository.js';
import { InsertarPedidoRepository } from './domain/port/insertar-pedido.repository.js';
import { EstadoPedidoAdapter } from './infrastructure/persistence/estado-pedido.adapter.js';
import { InferirDatosPedidoAdapter } from './infrastructure/persistence/inferir-datos-pedido.adapter.js';
import { InsertarDetallePedidoAdapter } from './infrastructure/persistence/insertar-detalle-pedido.adapter.js';
import { InsertarPedidoAdapter } from './infrastructure/persistence/insertar-pedido.adapter.js';
import { PedidoController } from './interfaces/http/pedido.controller.js';
import { PedidoGateway } from './interfaces/ws/pedido.gateway.js';

@Module({
  controllers: [PedidoController],
  providers: [
    PedidoUseCase,
    CambiarEstadoPedidoUseCase,
    PedidoNotificationUseCase,
    PedidoGateway,
    {
      provide: InferirDatosPedidoRepository,
      useClass: InferirDatosPedidoAdapter,
    },
    { provide: InsertarPedidoRepository, useClass: InsertarPedidoAdapter },
    { provide: EstadoPedidoRepository, useClass: EstadoPedidoAdapter },
    {
      provide: InsertarDetallePedidoRepository,
      useClass: InsertarDetallePedidoAdapter,
    },
  ],
})
export class PedidoModule {}
