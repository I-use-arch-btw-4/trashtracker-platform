# PC4 - Checklist de evidencia

Este backend cubre la capa de aplicacion solicitada por PC4.

## Requisitos del enunciado

- Backend TypeScript en contenedor: `Dockerfile` y `docker-compose.yml`.
- API REST: rutas bajo `/api/v1`.
- Conexion a capa de datos: `MONGO_URI` apunta a MongoDB local, Docker o VM GCP.
- CRUD real: usuarios, reportes, comunidades, eventos, comercios, recompensas, canjes, mensajes y notificaciones.
- Evidencia Postman: `trashtracker-pc4.postman_collection.json`.
- Separacion por capas: MVC + casos de uso + dominio + repositorios MongoDB.
- Build verificable: `npm run build`, `npm run check`, `npm test`.

## Flujo recomendado para capturas

1. `docker compose up --build`.
2. `GET http://localhost:3000/api/health`.
3. `GET http://localhost:3000/api/v1/dashboard/resumen`.
4. `POST /api/v1/reportes` para crear un reporte nuevo.
5. `POST /api/v1/reportes/:id/validaciones` para modificar el reporte y puntos.
6. `PATCH /api/v1/reportes/:id` para cambiar `estado`.
7. `DELETE /api/v1/reportes/:id` para demostrar eliminacion.
8. Verificar en MongoDB Compass que las colecciones cambiaron.

## Nota operativa

La VM de PC3 puede usarse cambiando `MONGO_URI` a:

```bash
mongodb://34.31.160.50:27017/trashtracker
```

La VM debe estar encendida y el firewall debe permitir el puerto `27017` desde la IP local.
