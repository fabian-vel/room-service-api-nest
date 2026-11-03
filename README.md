# room-service-api-nest

Migración del API `room-service-api` (Java/WebFlux) a NestJS con TypeScript y arquitectura hexagonal.
Corre en paralelo al API Java (puerto 8084) contra la misma base de datos y mantiene el mismo contrato (`/api/v1/...`, `ApiResponse`, formato de errores).

## Ejecutar

```bash
cp .env.example .env   # completar DB_PASSWORD
npm install
npm run start:dev
```

## Estructura

```
src/
  main.ts / app.setup.ts     arranque y configuración global (prefijo, filtro de errores, CORS)
  app.module.ts              registra el módulo de cada contexto migrado
  shared/                    transversal
    database/                pool de PostgreSQL (pg), token PG_POOL
    domain/exception/        AppException, BusinessException (422), NotFoundException (404), ...
    response/api-response.ts mismo formato de respuesta que el API Java
    global-exception.filter.ts
    util/sql-loader.util.ts  carga los .sql de resources/querys
    database/sql.util.ts     ejecuta los .sql con parámetros nombrados (:param -> $n)
  modules/<contexto>/        domain (model, port) · application (usecase) · infrastructure (persistence, mapper) · interfaces/http
                             auth, constantes, etiqueta, menu-categoria, menu-item, items-especiales,
                             consulta-pedido, pedido (incluye el WebSocket /ws/pedidos)
resources/querys/            archivos .sql
```

## Pruebas

```bash
npm test          # unitarias
npm run test:e2e  # requiere la BD disponible
```
