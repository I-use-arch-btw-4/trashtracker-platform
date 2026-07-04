import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { ObjectId } from "mongodb";
import { createApp } from "../src/app";
import { collections } from "../src/domain/collections";
import { createInMemoryDb } from "./helpers/inMemoryDb";

const testEnv = {
  nodeEnv: "test",
  corsOrigin: "*",
  requestLimit: "2mb"
};

test("GET /api/v1/dashboard/resumen returns collection counts, report aggregates, and ranking", async () => {
  const firstUserId = new ObjectId();
  const secondUserId = new ObjectId();
  const db = createInMemoryDb({
    [collections.users]: [
      {
        _id: firstUserId,
        nombre: "Top Citizen",
        distrito: "Miraflores",
        rol: "ciudadano",
        puntosTotales: 90,
        nivel: 2
      },
      {
        _id: secondUserId,
        nombre: "New Citizen",
        distrito: "Surco",
        rol: "ciudadano",
        puntosTotales: 15,
        nivel: 1
      }
    ],
    [collections.reports]: [
      {
        _id: new ObjectId(),
        usuarioId: firstUserId,
        distrito: "Miraflores",
        estado: "activo",
        prioridad: 5
      },
      {
        _id: new ObjectId(),
        usuarioId: secondUserId,
        distrito: "Miraflores",
        estado: "resuelto",
        prioridad: 3
      },
      {
        _id: new ObjectId(),
        usuarioId: secondUserId,
        distrito: "Surco",
        estado: "activo",
        prioridad: 2
      }
    ]
  });
  const app = createApp({ db, env: testEnv });

  const response = await request(app)
    .get("/api/v1/dashboard/resumen")
    .expect(200);

  assert.equal(response.body.data.colecciones[collections.users], 2);
  assert.equal(response.body.data.colecciones[collections.reports], 3);
  assert.equal(response.body.data.reportesPorDistrito[0].distrito, "Miraflores");
  assert.equal(response.body.data.reportesPorDistrito[0].total, 2);
  assert.equal(response.body.data.reportesPorDistrito[0].prioridadPromedio, 4);
  assert.equal(response.body.data.reportesPorEstado[0].estado, "activo");
  assert.equal(response.body.data.reportesPorEstado[0].total, 2);
  assert.equal(response.body.data.rankingPuntos[0].nombre, "Top Citizen");
});
