import { Module } from '@nestjs/common';
import { ConsultaPedidoUseCase } from './application/usecase/consulta-pedido.use-case.js';
import { ConsultaPedidoRepository } from './domain/port/consulta-pedido.repository.js';
import { ConsultaPedidoAdapter } from './infrastructure/persistence/consulta-pedido.adapter.js';
import { ConsultaPedidoController } from './interfaces/http/consulta-pedido.controller.js';

@Module({
  controllers: [ConsultaPedidoController],
  providers: [
    ConsultaPedidoUseCase,
    { provide: ConsultaPedidoRepository, useClass: ConsultaPedidoAdapter },
  ],
})
export class ConsultaPedidoModule {}
