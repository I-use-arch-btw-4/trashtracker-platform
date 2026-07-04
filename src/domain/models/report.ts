import { z } from "zod";
import { toObjectId } from "../../shared/mongodb/objectId";
import { validate } from "../validation";
import { calculateInitialPriority } from "../services/reportPriorityService";

const reportStates = ["activo", "en_proceso", "resuelto", "rechazado"] as const;

const geoPointSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
  direccion: z.string().min(2).max(250).optional()
});

const multimediaSchema = z.object({
  tipo: z.enum(["foto", "video", "archivo"]),
  url: z.string().url(),
  descripcion: z.string().max(250).optional()
});

const createReportSchema = z.object({
  usuarioId: z.string().min(1),
  titulo: z.string().min(4).max(160),
  descripcion: z.string().min(8).max(1200),
  distrito: z.string().min(2).max(120),
  tipoResiduo: z.string().min(2).max(80),
  prioridad: z.number().int().min(1).max(5).optional(),
  ubicacion: geoPointSchema,
  multimedia: z.array(multimediaSchema).default([])
});

const updateReportSchema = createReportSchema.partial().extend({
  estado: z.enum(reportStates).optional()
});

const commentSchema = z.object({
  usuarioId: z.string().min(1),
  contenido: z.string().min(2).max(700)
});

const validationSchema = z.object({
  usuarioId: z.string().min(1),
  tipo: z.enum(["confirma", "descarta", "duplicado"]).default("confirma")
});

const reactionSchema = z.object({
  usuarioId: z.string().min(1),
  tipo: z.string().min(2).max(40)
});

function buildReport(input, now = new Date()) {
  const data = validate(createReportSchema, input);
  const usuarioId = toObjectId(data.usuarioId, "usuarioId");
  const multimedia = data.multimedia.map((item) => ({
    ...item,
    usuarioId,
    fechaSubida: now
  }));

  return {
    usuarioId,
    titulo: data.titulo,
    descripcion: data.descripcion,
    distrito: data.distrito,
    tipoResiduo: data.tipoResiduo,
    estado: "activo",
    prioridad: calculateInitialPriority({
      tipoResiduo: data.tipoResiduo,
      multimedia,
      priority: data.prioridad
    }),
    ubicacion: {
      type: "Point",
      coordinates: data.ubicacion.coordinates,
      direccion: data.ubicacion.direccion
    },
    multimedia,
    comentarios: [],
    validaciones: [],
    reacciones: [],
    fechaReporte: now,
    fechaActualizacion: now
  };
}

function buildReportPatch(input) {
  const data = validate(updateReportSchema, input);

  if (data.usuarioId) {
    data.usuarioId = toObjectId(data.usuarioId, "usuarioId");
  }

  if (data.ubicacion) {
    data.ubicacion = {
      type: "Point",
      coordinates: data.ubicacion.coordinates,
      direccion: data.ubicacion.direccion
    };
  }

  return data;
}

function buildComment(input, now = new Date()) {
  const data = validate(commentSchema, input);
  return {
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    contenido: data.contenido,
    fecha: now,
    estado: "visible"
  };
}

function buildValidation(input, now = new Date()) {
  const data = validate(validationSchema, input);
  return {
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    tipo: data.tipo,
    fecha: now
  };
}

function buildReaction(input, now = new Date()) {
  const data = validate(reactionSchema, input);
  return {
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    tipo: data.tipo,
    fecha: now
  };
}

export { buildReport, buildReportPatch, buildComment, buildValidation, buildReaction, reportStates };

