import { Module } from '@nestjs/common';
import { MotorReglas } from '../../shared/application/engine/motor-reglas.js';
import type { ReglaNegocio } from '../../shared/application/rule/regla-negocio.js';
import { PedidoNotificationUseCase } from './application/usecase/pedido-notification.use-case.js';
import {
  MOTOR_REGLAS_PEDIDO,
  PedidoUseCase,
} from './application/usecase/pedido.use-case.js';
import { CrearPedidoRule } from './application/usecase/rule/crear-pedido.rule.js';
import { InferirDatosPedidoRule } from './application/usecase/rule/inferir-datos-pedido.rule.js';
import { InsertarDetallePedidoRule } from './application/usecase/rule/insertar-detalle-pedido.rule.js';
import { InsertarPedidoRule } from './application/usecase/rule/insertar-pedido.rule.js';
import type { PedidoContexto } from './domain/model/pedido-contexto.js';
import { InferirDatosPedidoRepository } from './domain/port/inferir-datos-pedido.repository.js';
import { InsertarDetallePedidoRepository } from './domain/port/insertar-detalle-pedido.repository.js';
import { InsertarPedidoRepository } from './domain/port/insertar-pedido.repository.js';
import { InferirDatosPedidoAdapter } from './infrastructure/persistence/inferir-datos-pedido.adapter.js';
import { InsertarDetallePedidoAdapter } from './infrastructure/persistence/insertar-detalle-pedido.adapter.js';
import { InsertarPedidoAdapter } from './infrastructure/persistence/insertar-pedido.adapter.js';
import { PedidoController } from './interfaces/http/pedido.controller.js';

const REGLAS = [
  InferirDatosPedidoRule,
  CrearPedidoRule,
  InsertarPedidoRule,
  InsertarDetallePedidoRule,
];

@Module({
  controllers: [PedidoController],
  providers: [
    PedidoUseCase,
    PedidoNotificationUseCase,
    ...REGLAS,
    // el motor recibe todas las reglas, como el List<ReglaNegocio> que Spring inyectaba en Java
    {
      provide: MOTOR_REGLAS_PEDIDO,
      useFactory: (...reglas: ReglaNegocio<PedidoContexto>[]) =>
        new MotorReglas(reglas),
      inject: REGLAS,
    },
    // cada puerto se resuelve con su adaptador de PostgreSQL
    {
      provide: InferirDatosPedidoRepository,
      useClass: InferirDatosPedidoAdapter,
    },
    { provide: InsertarPedidoRepository, useClass: InsertarPedidoAdapter },
    {
      provide: InsertarDetallePedidoRepository,
      useClass: InsertarDetallePedidoAdapter,
    },
  ],
  // el WebSocket de cocina (siguiente paso) se suscribe a las notificaciones
  exports: [PedidoNotificationUseCase],
})
export class PedidoModule {}
