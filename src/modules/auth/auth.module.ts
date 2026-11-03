import { Module } from '@nestjs/common';
import { LoginUseCase } from './application/usecase/login.use-case.js';
import { HabitacionAccesoRepository } from './domain/port/habitacion-acceso.repository.js';
import { HabitacionAccesoRepositoryAdapter } from './infrastructure/persistence/habitacion-acceso.repository-adapter.js';
import { AuthController } from './interfaces/http/auth.controller.js';

@Module({
  controllers: [AuthController],
  // el puerto HabitacionAccesoRepository se resuelve con el adaptador de PostgreSQL
  providers: [
    LoginUseCase,
    {
      provide: HabitacionAccesoRepository,
      useClass: HabitacionAccesoRepositoryAdapter,
    },
  ],
})
export class AuthModule {}
