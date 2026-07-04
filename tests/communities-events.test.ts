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

function buildUser(_id: ObjectId, nombre: string, puntosTotales = 0) {
  return {
    _id,
    nombre,
    correo: `${nombre.toLowerCase().replaceAll(" ", ".")}@trashtracker.test`,
    distrito: "San Borja",
    rol: "ciudadano",
    puntosTotales,
    nivel: 1,
    estadoCuenta: "activo",
    fechaRegistro: new Date("2026-04-01T00:00:00.000Z")
  };
}

test("community endpoints create the leader membership and reject duplicate members", async () => {
  const leaderId = new ObjectId();
  const memberId = new ObjectId();
  const { app } = createTestApp({
    [collections.users]: [
      buildUser(leaderId, "Rosa Diaz"),
      buildUser(memberId, "Jorge Ramos")
    ]
  });

  const created = await request(app)
    .post("/api/v1/comunidades")
    .send({
      nombre: "Guardianes del parque",
      distrito: "San Borja",
      descripcion: "Vecinos organizados para reportar y limpiar zonas verdes.",
      liderId: leaderId.toHexString()
    })
    .expect(201);

  const communityId = created.body.data._id;
  assert.equal(created.body.data.estado, "activa");
  assert.equal(created.body.data.miembros.length, 1);
  assert.equal(created.body.data.miembros[0].rolComunidad, "lider");

  const memberResponse = await request(app)
    .post(`/api/v1/comunidades/${communityId}/miembros`)
    .send({
      usuarioId: memberId.toHexString(),
      rolComunidad: "miembro"
    })
    .expect(201);

  assert.equal(memberResponse.body.data.miembros.length, 2);

  await request(app)
    .post(`/api/v1/comunidades/${communityId}/miembros`)
    .send({
      usuarioId: memberId.toHexString(),
      rolComunidad: "miembro"
    })
    .expect(409);
});

test("event endpoints reward organizers and attendees while preventing duplicate attendance", async () => {
  const organizerId = new ObjectId();
  const attendeeId = new ObjectId();
  const communityId = new ObjectId();
  const { app, db } = createTestApp({
    [collections.users]: [
      buildUser(organizerId, "Lucia Costa", 30),
      buildUser(attendeeId, "Mario Vega", 10)
    ],
    [collections.communities]: [{
      _id: communityId,
      nombre: "Limpieza Sur",
      distrito: "San Borja",
      descripcion: "Comunidad enfocada en jornadas de limpieza.",
      liderId: organizerId,
      estado: "activa",
      miembros: [],
      fechaCreacion: new Date("2026-04-02T00:00:00.000Z")
    }]
  });

  const created = await request(app)
    .post("/api/v1/eventos-limpieza")
    .send({
      titulo: "Jornada de limpieza vecinal",
      comunidadId: communityId.toHexString(),
      organizadorId: organizerId.toHexString(),
      descripcion: "Limpieza de residuos reciclables en la zona central.",
      fechaEvento: "2026-08-15T15:00:00.000Z",
      ubicacion: {
        coordinates: [-76.9965, -12.0972],
        direccion: "Parque central"
      }
    })
    .expect(201);

  const organizer = await db.collection(collections.users).findOne({ _id: organizerId });
  assert.equal(organizer.puntosTotales, 50);
  assert.equal(organizer.nivel, 2);

  const eventId = created.body.data._id;
  const attendeeResponse = await request(app)
    .post(`/api/v1/eventos-limpieza/${eventId}/asistentes`)
    .send({
      usuarioId: attendeeId.toHexString(),
      estadoAsistencia: "confirmado"
    })
    .expect(201);

  assert.equal(attendeeResponse.body.data.asistentes.length, 1);

  const attendee = await db.collection(collections.users).findOne({ _id: attendeeId });
  assert.equal(attendee.puntosTotales, 25);

  await request(app)
    .post(`/api/v1/eventos-limpieza/${eventId}/asistentes`)
    .send({
      usuarioId: attendeeId.toHexString(),
      estadoAsistencia: "confirmado"
    })
    .expect(409);
});
