import { Module } from '@nestjs/common';
import { LoginEmpleadoUseCase } from './application/usecase/login-empleado.use-case.js';
import { LoginUseCase } from './application/usecase/login.use-case.js';
import { EmpleadoRepository } from './domain/port/empleado.repository.js';
import { HabitacionAccesoRepository } from './domain/port/habitacion-acceso.repository.js';
import { EmpleadoRepositoryAdapter } from './infrastructure/persistence/empleado.repository-adapter.js';
import { HabitacionAccesoRepositoryAdapter } from './infrastructure/persistence/habitacion-acceso.repository-adapter.js';
import { AuthController } from './interfaces/http/auth.controller.js';
import { EmpleadoAuthController } from './interfaces/http/empleado-auth.controller.js';

@Module({
  controllers: [AuthController, EmpleadoAuthController],
  // cada puerto se resuelve con su adaptador de PostgreSQL
  providers: [
    LoginUseCase,
    LoginEmpleadoUseCase,
    {
      provide: HabitacionAccesoRepository,
      useClass: HabitacionAccesoRepositoryAdapter,
    },
    { provide: EmpleadoRepository, useClass: EmpleadoRepositoryAdapter },
  ],
})
export class AuthModule {}
