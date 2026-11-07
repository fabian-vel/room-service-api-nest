import { Module } from '@nestjs/common';
import { MotorReglas } from '../../shared/application/engine/motor-reglas.js';
import type { ReglaNegocio } from '../../shared/application/rule/regla-negocio.js';
import {
  CambiarEstadoPedidoUseCase,
  MOTOR_REGLAS_ESTADO_PEDIDO,
} from './application/usecase/cambiar-estado-pedido.use-case.js';
import { PedidoNotificationUseCase } from './application/usecase/pedido-notification.use-case.js';
import {
  MOTOR_REGLAS_PEDIDO,
  PedidoUseCase,
} from './application/usecase/pedido.use-case.js';
import { ActualizarEstadoPedidoRule } from './application/usecase/rule/actualizar-estado-pedido.rule.js';
import { ConsultarEstadoPedidoRule } from './application/usecase/rule/consultar-estado-pedido.rule.js';
import { ValidarTransicionEstadoRule } from './application/usecase/rule/validar-transicion-estado.rule.js';
import { CrearPedidoRule } from './application/usecase/rule/crear-pedido.rule.js';
import { InferirDatosPedidoRule } from './application/usecase/rule/inferir-datos-pedido.rule.js';
import { InsertarDetallePedidoRule } from './application/usecase/rule/insertar-detalle-pedido.rule.js';
import { InsertarPedidoRule } from './application/usecase/rule/insertar-pedido.rule.js';
import type { CambioEstadoContexto } from './domain/model/cambio-estado-contexto.js';
import type { PedidoContexto } from './domain/model/pedido-contexto.js';
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

const REGLAS = [
  InferirDatosPedidoRule,
  CrearPedidoRule,
  InsertarPedidoRule,
  InsertarDetallePedidoRule,
];

const REGLAS_ESTADO = [
  ConsultarEstadoPedidoRule,
  ValidarTransicionEstadoRule,
  ActualizarEstadoPedidoRule,
];

@Module({
  controllers: [PedidoController],
  providers: [
    PedidoUseCase,
    CambiarEstadoPedidoUseCase,
    PedidoNotificationUseCase,
    PedidoGateway,
    ...REGLAS,
    // el motor recibe todas las reglas del módulo
    {
      provide: MOTOR_REGLAS_PEDIDO,
      useFactory: (...reglas: ReglaNegocio<PedidoContexto>[]) =>
        new MotorReglas(reglas),
      inject: REGLAS,
    },
    ...REGLAS_ESTADO,
    {
      provide: MOTOR_REGLAS_ESTADO_PEDIDO,
      useFactory: (...reglas: ReglaNegocio<CambioEstadoContexto>[]) =>
        new MotorReglas(reglas),
      inject: REGLAS_ESTADO,
    },
    // cada puerto se resuelve con su adaptador de PostgreSQL
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
