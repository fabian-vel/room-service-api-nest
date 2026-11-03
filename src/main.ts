import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';

// .env es opcional: en producción las variables llegan del entorno
try {
  process.loadEnvFile();
} catch {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  // Swagger UI en /swagger-ui (reemplaza a SpringDoc); el botón "Authorize" recibe el JWT
  const documento = new DocumentBuilder()
    .setTitle('Room Service API')
    .setDescription(
      'API de HotelGuest: pedidos a la habitación, menú y maestros',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  SwaggerModule.setup(
    'swagger-ui',
    app,
    SwaggerModule.createDocument(app, documento),
  );

  await app.listen(process.env.PORT ?? 8084);
}
await bootstrap();
