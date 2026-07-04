import { z } from "zod";
import { toObjectId, toOptionalObjectId } from "../../shared/mongodb/objectId";
import { validate } from "../validation";

const eventStates = ["programado", "realizado", "cancelado"] as const;

const createEventSchema = z.object({
  titulo: z.string().min(4).max(160),
  comunidadId: z.string().min(1),
  organizadorId: z.string().min(1),
  reporteId: z.string().min(1).optional(),
  descripcion: z.string().min(8).max(1000),
  fechaEvento: z.coerce.date(),
  ubicacion: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    direccion: z.string().min(2).max(250).optional()
  })
});

const updateEventSchema = createEventSchema.partial().extend({
  estado: z.enum(eventStates).optional()
});

const attendeeSchema = z.object({
  usuarioId: z.string().min(1),
  estadoAsistencia: z.enum(["confirmado", "asistio", "cancelado"]).default("confirmado")
});

const evidenceSchema = z.object({
  tipo: z.enum(["foto", "video", "archivo"]),
  url: z.string().url(),
  descripcion: z.string().max(250).optional(),
  usuarioId: z.string().min(1)
});

function buildCleanupEvent(input) {
  const data = validate(createEventSchema, input);

  return {
    titulo: data.titulo,
    comunidadId: toObjectId(data.comunidadId, "comunidadId"),
    organizadorId: toObjectId(data.organizadorId, "organizadorId"),
    reporteId: toOptionalObjectId(data.reporteId, "reporteId"),
    descripcion: data.descripcion,
    fechaEvento: data.fechaEvento,
    estado: "programado",
    ubicacion: {
      type: "Point",
      coordinates: data.ubicacion.coordinates,
      direccion: data.ubicacion.direccion
    },
    asistentes: [],
    evidenciasResultado: []
  };
}

function buildCleanupEventPatch(input) {
  const data = validate(updateEventSchema, input);

  if (data.comunidadId) data.comunidadId = toObjectId(data.comunidadId, "comunidadId");
  if (data.organizadorId) data.organizadorId = toObjectId(data.organizadorId, "organizadorId");
  if (data.reporteId) data.reporteId = toObjectId(data.reporteId, "reporteId");
  if (data.ubicacion) {
    data.ubicacion = {
      type: "Point",
      coordinates: data.ubicacion.coordinates,
      direccion: data.ubicacion.direccion
    };
  }

  return data;
}

function buildAttendee(input, now = new Date()) {
  const data = validate(attendeeSchema, input);
  return {
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    estadoAsistencia: data.estadoAsistencia,
    fechaConfirmacion: now
  };
}

function buildEvidence(input, now = new Date()) {
  const data = validate(evidenceSchema, input);
  return {
    tipo: data.tipo,
    url: data.url,
    descripcion: data.descripcion,
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    fechaSubida: now
  };
}

export { buildCleanupEvent, buildCleanupEventPatch, buildAttendee, buildEvidence, eventStates };

