import { INestApplication } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { GlobalExceptionFilter } from './shared/global-exception.filter.js';

// configuración común de la app, compartida por main.ts y los tests e2e
export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new GlobalExceptionFilter());
  // en desarrollo; restringir en producción
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
  });
  // WebSocket nativo (ws), el mismo protocolo que usa new WebSocket() en el front
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableShutdownHooks();
}
