import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Public } from '../../../../shared/security/public.decorator.js';
import { LoginEmpleadoUseCase } from '../../application/usecase/login-empleado.use-case.js';
import type { EmpleadoLoginRequest } from '../../domain/model/empleado.js';

@Public()
@ApiTags('Auth')
@Controller('auth/empleado')
export class EmpleadoAuthController {
  constructor(private readonly loginEmpleadoUseCase: LoginEmpleadoUseCase) {}

  @Post('login')
  @HttpCode(200)
  @ApiBody({
    schema: { example: { usuario: 'cocina1', password: '********' } },
  })
  async login(@Body() request: EmpleadoLoginRequest) {
    const response = await this.loginEmpleadoUseCase.ejecutar(request);
    return ApiResponse.ok('Login exitoso', response);
  }
}
