import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC } from './public.decorator.js';
import { JwtService } from './jwt.service.js';

/** Exige "Bearer <token>" válido en todos los endpoints salvo los @Public() */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      this.logger.warn(
        `Sin token o formato inválido - path: ${request.originalUrl}`,
      );
      throw new UnauthorizedException('Token requerido');
    }

    try {
      // los claims quedan disponibles para los controllers (@Claims())
      request.user = this.jwtService.validarToken(authHeader.substring(7));
      return true;
    } catch (error) {
      this.logger.warn(
        `Token inválido - path: ${request.originalUrl} - ${(error as Error).message}`,
      );
      throw new UnauthorizedException('Token inválido');
    }
  }
}
