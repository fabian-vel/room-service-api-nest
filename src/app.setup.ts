import { INestApplication } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/global-exception.filter.js';

// configuración común de la app, compartida por main.ts y los tests e2e
export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new GlobalExceptionFilter());
  // en desarrollo; restringir en producción (igual que el API Java)
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
  });
  app.enableShutdownHooks();
}
