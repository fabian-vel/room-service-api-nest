import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtService } from './jwt.service.js';

@Global()
@Module({
  // el guard aplica a toda la app: todo exige token salvo lo marcado con @Public()
  providers: [JwtService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
  exports: [JwtService],
})
export class SecurityModule {}
