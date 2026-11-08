import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Public } from '../../../../shared/security/public.decorator.js';
import { LoginEmpleadoUseCase } from '../../application/usecase/login-empleado.use-case.js';
import type { EmpleadoLoginRequest } from '../../domain/model/empleado.js';
import { EmpleadoAuthDocs } from './empleado-auth.docs.js';

@Public()
@EmpleadoAuthDocs.controller()
@Controller('auth/empleado')
export class EmpleadoAuthController {
  constructor(private readonly loginEmpleadoUseCase: LoginEmpleadoUseCase) {}

  @Post('login')
  @HttpCode(200)
  @EmpleadoAuthDocs.login()
  async login(@Body() request: EmpleadoLoginRequest) {
    const response = await this.loginEmpleadoUseCase.ejecutar(request);
    return ApiResponse.ok('Login exitoso', response);
  }
}
