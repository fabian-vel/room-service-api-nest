import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/** Marca un controller o endpoint como público (sin token), como /api/v1/auth/** en el API Java */
export const Public = () => SetMetadata(IS_PUBLIC, true);
