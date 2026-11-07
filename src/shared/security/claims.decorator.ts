import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Claims as ClaimsToken } from './jwt.service.js';

/** Claims del token validado por JwtAuthGuard */
export const Claims = createParamDecorator(
  (_: unknown, context: ExecutionContext): ClaimsToken =>
    context.switchToHttp().getRequest<{ user: ClaimsToken }>().user,
);
