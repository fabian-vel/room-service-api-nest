# HotelGuest — Backend · `room-service-api-nest`

API REST y WebSocket de **HotelGuest**: los huéspedes piden del restaurante a su habitación desde la app móvil y la cocina gestiona los pedidos desde el front web.

---

## Stack

| Tecnología | Uso |
|---|---|
| Node.js 22 + TypeScript | Lenguaje y runtime |
| NestJS 12 | Framework, inyección de dependencias |
| `pg` (node-postgres) | Acceso a PostgreSQL con SQL propio |
| PostgreSQL 18 | Base de datos |
| `jsonwebtoken` (HS384) | Tokens JWT |
| `bcryptjs` | Contraseñas de empleados |
| `@nestjs/websockets` + `ws` | WebSocket de cocina |
| `@nestjs/swagger` | Documentación (Swagger UI) |
| Vitest + Supertest | Pruebas unitarias y e2e |

---

## Arquitectura

Hexagonal (puertos y adaptadores), un módulo de Nest por contexto:

```
interfaces (http / ws)    controllers y gateway: reciben la petición y arman la respuesta
        │
application (usecase)     casos de uso y reglas de negocio; dependen solo de puertos
        │
domain (model, port)      modelos y puertos (clases abstractas: la inyección de Nest las usa como token)
        ▲
infrastructure            adaptadores de los puertos: PostgreSQL (persistence) y mapeo de filas (mapper)
```

Cada módulo registra `{ provide: Puerto, useClass: Adaptador }`, así los casos de uso no conocen la base de datos.

### Casos de uso

Cada caso de uso es lineal: llama a los puertos en orden y las validaciones de negocio son funciones puras, probadas sin BD (`armarPedido`, `validarTransicion`). Cuando hay varias escrituras van dentro de `TransactionManager.ejecutar`: la primera que falla revierte todo. Por ejemplo, crear pedido consulta precios, arma el pedido, inserta pedido y detalle, y notifica por WebSocket después del COMMIT.

---

## Estructura

```
src/
  main.ts / app.setup.ts       arranque y configuración global (prefijo, errores, CORS, WebSocket, Swagger)
  app.module.ts                registra los módulos
  shared/                      transversal
    database/                  pool de PostgreSQL, ejecutarSql (:param -> $n) y transacciones
    domain/                    excepciones, Pagina, puerto TransactionManager
    security/                  JwtService, JwtAuthGuard (global), @Public(), @Claims(), PasswordEncoder
    response/api-response.ts   formato de respuesta { timestamp, status, message, data, size }
    global-exception.filter.ts formato de error { timestamp, status, code, message, path, correlationId }
  modules/
    auth/                      login de habitación y de empleado, fechas de acceso
    constantes/  etiqueta/  menu-categoria/     maestros
    menu-item/  items-especiales/                menú de la app
    consulta-pedido/           consultas de pedidos (app, tablero y lista paginada)
    pedido/                    crear pedido, cambiar estado y WebSocket de cocina
resources/querys/              archivos .sql
test/                          pruebas e2e contra la BD
```

---

## Endpoints

Todos bajo `/api/v1` y con `Authorization: Bearer <token>`, salvo los de `auth`. El detalle y ejemplos están en Swagger UI.

| Método | Ruta | Uso |
|---|---|---|
| POST | `/auth/login` | Login del huésped (habitación + código) |
| POST | `/auth/empleado/login` | Login de empleado |
| POST | `/fechas-acceso` | Fechas de inicio y fin del acceso |
| GET · POST · PUT · DELETE | `/constantes`, `/etiquetas`, `/categorias` | Maestros (PUT y DELETE con `/{id}`) |
| POST | `/etiquetas/consulta` | Etiquetas de una categoría o de un item |
| GET | `/categorias/todas` | Categorías planas (maestro); `GET /categorias` las devuelve en árbol |
| POST | `/menu` | Items de una categoría con sus etiquetas |
| GET | `/items-especiales` | Más pedidos, más recientes y recomendados del chef |
| POST | `/pedido` | Crear pedido (token de habitación) |
| GET | `/consulta-pedidos` | Pedidos de la habitación del token |
| GET | `/consulta-pedidos-fecha-actual` | Tablero de cocina |
| GET | `/pedidos` | Lista paginada con filtros opcionales |

**WebSocket:** `ws://<host>:<puerto>/ws/pedidos?token=<jwt>` envía a cocina cada evento de pedido (`{"type":"CREATED","pedidoId":...}`). Sin token o con token inválido cierra con el código 1003.

**Swagger UI:** `http://localhost:8084/swagger-ui` (JSON en `/swagger-ui-json`). Usar "Authorize" con el token.

---

## Configuración

Variables de entorno (en desarrollo, archivo `.env` en la raíz; ver `.env.example`):

| Variable | Descripción | Por defecto |
|---|---|---|
| `PORT` | Puerto HTTP y WebSocket | `8084` |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL | —, `5432`, — |
| `DB_USER`, `DB_PASSWORD` | Credenciales de la BD | — |
| `JWT_SECRET` | Secreto de los tokens (mínimo 48 caracteres) | — |

> `JWT_SECRET` va entre comillas en `.env`: contiene `#`, que sin comillas se toma como comentario.

---

## Ejecutar

```bash
npm install
cp .env.example .env   # completar DB_PASSWORD y JWT_SECRET
npm run start:dev      # desarrollo, recarga al guardar
npm run build && npm run start:prod
```

Al arrancar verifica la conexión a la BD (`Conectado a hotelguestdb@localhost` en el log); si no responde, no arranca.

## Pruebas

```bash
npm test          # unitarias
npm run test:e2e  # contra la BD real; crear pedido borra al final lo que creó
npm run lint
```

---

## Errores

| Excepción | HTTP | `code` |
|---|---|---|
| `BusinessException` | 422 | `BUSINESS_ERROR` |
| `NotFoundException` (la de `shared/domain/exception`, no la de Nest) | 404 | `NOT_FOUND` |
| `InternalServerErrorException` (errores de BD) | 500 | `INTERNAL_ERROR` |
| `SqlLoadException` (`.sql` no encontrado) | 500 | `CONFIG_ERROR` |
| Errores de Nest (token, ruta inexistente, id no numérico) | su status | `HTTP_ERROR` |

