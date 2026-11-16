import { SetMetadata } from '@nestjs/common';

// matriz de roles (PENDIENTES, sección 6): qué roles de empleado entran a cada módulo
export const ROLES = [
  'ADMIN',
  'AUX_ADMIN',
  'RECEPCION',
  'COCINA',
  'MESERO',
] as const;

export const MATRIZ_ROLES = {
  // solo ADMIN: si otro rol asignara roles, podría darse ADMIN a sí mismo
  EMPLEADOS: ['ADMIN'],
  CONSTANTES: ['ADMIN'],
  MAESTROS: ['ADMIN', 'AUX_ADMIN'],
  GESTION_PEDIDOS: ['ADMIN', 'AUX_ADMIN', 'COCINA', 'MESERO'],
  CONSULTA_PEDIDOS: ['ADMIN', 'AUX_ADMIN', 'RECEPCION', 'COCINA', 'MESERO'],
  REPORTES: ['ADMIN', 'AUX_ADMIN', 'COCINA'],
  FACTURA: ['ADMIN', 'AUX_ADMIN', 'RECEPCION'],
  // registro de huésped, fechas y código de acceso
  ACCESOS: ['ADMIN', 'AUX_ADMIN', 'RECEPCION'],
} as const;

export type Modulo = keyof typeof MATRIZ_ROLES;

/** El huésped (token de habitación) no es un rol: se habilita aparte en cada endpoint */
export const HABITACION = 'HABITACION';

export const ACCESO = 'acceso';

/** Quién puede llamar el endpoint; sin @Acceso() el guard lo rechaza a todos */
export const Acceso = (...quienes: (Modulo | typeof HABITACION)[]) =>
  SetMetadata(ACCESO, quienes);

export function tieneAcceso(
  quienes: readonly string[],
  claims: { rol?: string; accesoId?: number },
): boolean {
  if ('accesoId' in claims) return quienes.includes(HABITACION);
  return quienes.some((q) =>
    (MATRIZ_ROLES[q as Modulo] as readonly string[] | undefined)?.includes(
      claims.rol ?? '',
    ),
  );
}
