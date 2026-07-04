# TrashTracker Platform

Backend TypeScript de la capa de aplicacion para TrashTracker. Implementa una
API REST con Node.js, Express y MongoDB, siguiendo una separacion MVC + DDD
practica:

- `interfaces/http`: rutas y controladores HTTP (MVC).
- `application/use-cases`: casos de uso de la aplicacion.
- `domain`: modelos, politicas y reglas de negocio.
- `infrastructure`: repositorios MongoDB.
- `shared`: errores, paginacion, utilidades HTTP y ObjectId.

El modelo de datos usa las colecciones definidas en la PC3:

- `usuarios`
- `reportes`
- `comunidades`
- `mensajes_comunidad`
- `eventos_limpieza`
- `comercios`
- `recompensas`
- `canjes`
- `movimientos_puntos`
- `notificaciones`

## Requisitos

- Node.js 20 o superior
- TypeScript 5
- MongoDB 6 o superior
- Docker y Docker Compose para la evidencia de contenedores de PC4

## Configuracion

```bash
cp .env.example .env
npm install
npm run dev
```

Variables principales:

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/trashtracker
```

Para conectarse a la VM de PC3 cuando este encendida:

```bash
MONGO_URI=mongodb://34.31.160.50:27017/trashtracker
```

## Docker

Levantar API + MongoDB local:

```bash
docker compose up --build
```

La API queda disponible en:

```text
http://localhost:3000/api/health
```

## Endpoints principales

```text
GET    /api/health
GET    /api/v1/dashboard/resumen
GET    /api/v1/usuarios
POST   /api/v1/usuarios
GET    /api/v1/reportes
POST   /api/v1/reportes
PATCH  /api/v1/reportes/:id
POST   /api/v1/reportes/:id/comentarios
POST   /api/v1/reportes/:id/validaciones
GET    /api/v1/comunidades
POST   /api/v1/comunidades
POST   /api/v1/comunidades/:id/miembros
GET    /api/v1/eventos-limpieza
POST   /api/v1/eventos-limpieza
POST   /api/v1/eventos-limpieza/:id/asistentes
GET    /api/v1/recompensas
POST   /api/v1/recompensas
POST   /api/v1/canjes
PATCH  /api/v1/notificaciones/:id/leida
```

## Evidencia para PC4

La carpeta `docs/pc4` incluye una coleccion de Postman con operaciones CRUD
organizadas por recurso. Las operaciones `POST`, `PATCH` y `DELETE` modifican
MongoDB y sirven como evidencia de interaccion entre la capa de aplicacion y la
capa de datos.

Para regenerar la coleccion desde la definicion versionada:

```bash
npm run postman:generate
```

## Validacion

```bash
npm run build
npm run check
npm test
```

Los tests usan `node:test`, `supertest` y una base MongoDB en memoria fake para
validar endpoints y reglas de negocio sin levantar Docker.

## Arquitectura

La estructura toma como referencia entregas de Aplicaciones Web y Desarrollo de
Aplicaciones Open Source: separa responsabilidades por contexto, deja evidencia
ejecutable y mantiene la capa de dominio independiente de Express.

```text
src/
  application/
    services/        # Servicios de aplicacion, como ledger de puntos
    use-cases/       # Orquestan reglas, repositorios y transacciones simples
  domain/
    models/          # Constructores y validaciones Zod por agregado/documento
    services/        # Politicas de negocio reutilizables
  infrastructure/
    repositories/    # Adaptador MongoDB
  interfaces/
    http/            # Controladores y rutas Express
  shared/            # Utilidades transversales
```
