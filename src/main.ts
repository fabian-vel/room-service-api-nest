import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';

// .env es opcional: en producción las variables llegan del entorno
try {
  process.loadEnvFile();
} catch {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  await app.listen(process.env.PORT ?? 8084);
}
await bootstrap();
