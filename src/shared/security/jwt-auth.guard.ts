import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC } from './public.decorator.js';
import { ACCESO, tieneAcceso } from './acceso.js';
import { JwtService, type Claims } from './jwt.service.js';

/** Exige "Bearer <token>" válido en todos los endpoints salvo los @Public(), y que quien llama tenga @Acceso() */
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

    let claims: Claims;
    try {
      claims = this.jwtService.validarToken(authHeader.substring(7));
    } catch (error) {
      this.logger.warn(
        `Token inválido - path: ${request.originalUrl} - ${(error as Error).message}`,
      );
      throw new UnauthorizedException('Token inválido');
    }

    const quienes =
      this.reflector.getAllAndOverride<string[]>(ACCESO, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    if (!tieneAcceso(quienes, claims)) {
      this.logger.warn(
        `Sin permiso - path: ${request.originalUrl} - usuario: ${claims.sub}`,
      );
      throw new ForbiddenException('No tiene permiso para esta operación');
    }

    // los claims quedan disponibles para los controllers (@Claims())
    request.user = claims;
    return true;
  }
}
