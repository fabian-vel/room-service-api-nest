import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/** Marca un controller o endpoint como público (sin token), como los de /api/v1/auth */
export const Public = () => SetMetadata(IS_PUBLIC, true);
