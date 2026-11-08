import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SuccessMessages } from '../../../../shared/constant/success-messages.js';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { Public } from '../../../../shared/security/public.decorator.js';
import { LoginUseCase } from '../../application/usecase/login.use-case.js';
import type { LoginRequest } from '../../domain/model/login-request.js';
import { AuthDocs } from './auth.docs.js';

@Public()
@AuthDocs.controller()
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(200)
  @AuthDocs.login()
  async login(@Body() request: LoginRequest) {
    const token = await this.loginUseCase.ejecutar(request);
    return ApiResponse.ok(SuccessMessages.LOGIN_EXITOSO, token);
  }
}
