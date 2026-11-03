import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtService } from './jwt.service.js';
import { BcryptPasswordEncoder, PasswordEncoder } from './password-encoder.js';

@Global()
@Module({
  // el guard aplica a toda la app: todo exige token salvo lo marcado con @Public()
  providers: [
    JwtService,
    { provide: PasswordEncoder, useClass: BcryptPasswordEncoder },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [JwtService, PasswordEncoder],
})
export class SecurityModule {}
