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

function createTestApp(seed = {}) {
  const db = createInMemoryDb(seed);
  const app = createApp({ db, env: testEnv });
  return { app, db };
}

test("POST /api/v1/reportes creates a report and rewards the author", async () => {
  const userId = new ObjectId();
  const { app, db } = createTestApp({
    [collections.users]: [{
      _id: userId,
      nombre: "Ana Torres",
      correo: "ana@trashtracker.test",
      distrito: "Miraflores",
      rol: "ciudadano",
      puntosTotales: 0,
      nivel: 1,
      estadoCuenta: "activo",
      fechaRegistro: new Date("2026-01-01T00:00:00.000Z")
    }]
  });

  const response = await request(app)
    .post("/api/v1/reportes")
    .send({
      usuarioId: userId.toHexString(),
      titulo: "Basura acumulada en parque",
      descripcion: "Hay bolsas de basura acumuladas cerca al ingreso principal.",
      distrito: "Miraflores",
      tipoResiduo: "plastico",
      ubicacion: {
        coordinates: [-77.0428, -12.1211],
        direccion: "Parque Kennedy"
      },
      multimedia: [{
        tipo: "foto",
        url: "https://example.com/reporte.jpg",
        descripcion: "Acumulacion visible"
      }]
    })
    .expect(201);

  assert.equal(response.body.data.titulo, "Basura acumulada en parque");
  assert.equal(response.body.data.estado, "activo");
  assert.equal(response.body.data.prioridad, 4);

  const user = await db.collection(collections.users).findOne({ _id: userId });
  assert.equal(user.puntosTotales, 10);
  assert.equal(user.nivel, 1);

  const movements = await db.collection(collections.pointMovements).find({ usuarioId: userId }).toArray();
  assert.equal(movements.length, 1);
  assert.equal(movements[0].puntos, 10);
  assert.equal(movements[0].tipoReferencia, "reporte");

  const listResponse = await request(app)
    .get("/api/v1/reportes")
    .query({ distrito: "Miraflores", limit: 5 })
    .expect(200);

  assert.equal(listResponse.body.meta.total, 1);
  assert.equal(listResponse.body.data[0].distrito, "Miraflores");
});

test("POST /api/v1/reportes/:id/validaciones increases priority and rejects duplicates", async () => {
  const authorId = new ObjectId();
  const validatorId = new ObjectId();
  const reportId = new ObjectId();
  const now = new Date("2026-02-01T00:00:00.000Z");
  const { app, db } = createTestApp({
    [collections.users]: [
      {
        _id: authorId,
        nombre: "Luis Perez",
        correo: "luis@trashtracker.test",
        distrito: "Surco",
        rol: "ciudadano",
        puntosTotales: 0,
        nivel: 1,
        estadoCuenta: "activo",
        fechaRegistro: now
      },
      {
        _id: validatorId,
        nombre: "Maria Lopez",
        correo: "maria@trashtracker.test",
        distrito: "Surco",
        rol: "ciudadano",
        puntosTotales: 45,
        nivel: 1,
        estadoCuenta: "activo",
        fechaRegistro: now
      }
    ],
    [collections.reports]: [{
      _id: reportId,
      usuarioId: authorId,
      titulo: "Desmonte en avenida",
      descripcion: "Restos de construccion ocupan parte de la vereda.",
      distrito: "Surco",
      tipoResiduo: "desmonte",
      estado: "activo",
      prioridad: 3,
      ubicacion: {
        type: "Point",
        coordinates: [-76.9912, -12.1456],
        direccion: "Av. Primavera"
      },
      multimedia: [],
      comentarios: [],
      validaciones: [],
      reacciones: [],
      fechaReporte: now,
      fechaActualizacion: now
    }]
  });

  const response = await request(app)
    .post(`/api/v1/reportes/${reportId.toHexString()}/validaciones`)
    .send({
      usuarioId: validatorId.toHexString(),
      tipo: "confirma"
    })
    .expect(201);

  assert.equal(response.body.data.prioridad, 4);
  assert.equal(response.body.data.validaciones.length, 1);

  const validator = await db.collection(collections.users).findOne({ _id: validatorId });
  assert.equal(validator.puntosTotales, 50);
  assert.equal(validator.nivel, 2);

  await request(app)
    .post(`/api/v1/reportes/${reportId.toHexString()}/validaciones`)
    .send({
      usuarioId: validatorId.toHexString(),
      tipo: "confirma"
    })
    .expect(409);
});
