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

test("POST /api/v1/canjes creates a redemption, decrements stock, and deducts points", async () => {
  const userId = new ObjectId();
  const rewardId = new ObjectId();
  const storeId = new ObjectId();
  const { app, db } = createTestApp({
    [collections.users]: [{
      _id: userId,
      nombre: "Camila Ruiz",
      correo: "camila@trashtracker.test",
      distrito: "Barranco",
      rol: "ciudadano",
      puntosTotales: 120,
      nivel: 3,
      estadoCuenta: "activo",
      fechaRegistro: new Date("2026-03-01T00:00:00.000Z")
    }],
    [collections.rewards]: [{
      _id: rewardId,
      comercioId: storeId,
      nombre: "Descuento eco",
      descripcion: "Descuento para productos reutilizables.",
      puntosRequeridos: 80,
      stock: 1,
      estado: "disponible"
    }]
  });

  const response = await request(app)
    .post("/api/v1/canjes")
    .send({
      usuarioId: userId.toHexString(),
      recompensaId: rewardId.toHexString()
    })
    .expect(201);

  assert.equal(response.body.data.usuarioId, userId.toHexString());
  assert.equal(response.body.data.recompensaId, rewardId.toHexString());
  assert.equal(response.body.data.puntosUsados, 80);
  assert.equal(response.body.data.estado, "pendiente");
  assert.match(response.body.data.codigoCanje, /^TT-ECO-/);

  const user = await db.collection(collections.users).findOne({ _id: userId });
  assert.equal(user.puntosTotales, 40);

  const reward = await db.collection(collections.rewards).findOne({ _id: rewardId });
  assert.equal(reward.stock, 0);
  assert.equal(reward.estado, "agotado");

  const movements = await db.collection(collections.pointMovements).find({ usuarioId: userId }).toArray();
  assert.equal(movements.length, 1);
  assert.equal(movements[0].puntos, -80);
  assert.equal(movements[0].tipoReferencia, "canje");
});

test("POST /api/v1/canjes rejects users without enough points", async () => {
  const userId = new ObjectId();
  const rewardId = new ObjectId();
  const storeId = new ObjectId();
  const { app, db } = createTestApp({
    [collections.users]: [{
      _id: userId,
      nombre: "Pedro Silva",
      correo: "pedro@trashtracker.test",
      distrito: "Lince",
      rol: "ciudadano",
      puntosTotales: 20,
      nivel: 1,
      estadoCuenta: "activo",
      fechaRegistro: new Date("2026-03-02T00:00:00.000Z")
    }],
    [collections.rewards]: [{
      _id: rewardId,
      comercioId: storeId,
      nombre: "Kit compost",
      descripcion: "Kit basico para compostaje urbano.",
      puntosRequeridos: 100,
      stock: 3,
      estado: "disponible"
    }]
  });

  const response = await request(app)
    .post("/api/v1/canjes")
    .send({
      usuarioId: userId.toHexString(),
      recompensaId: rewardId.toHexString()
    })
    .expect(409);

  assert.equal(response.body.error.message, "El usuario no tiene puntos suficientes.");

  const reward = await db.collection(collections.rewards).findOne({ _id: rewardId });
  assert.equal(reward.stock, 3);

  const redemptions = await db.collection(collections.redemptions).find().toArray();
  assert.equal(redemptions.length, 0);
});
