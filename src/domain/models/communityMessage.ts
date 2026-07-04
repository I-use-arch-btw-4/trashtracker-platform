import { z } from "zod";
import { toObjectId } from "../../shared/mongodb/objectId";
import { validate } from "../validation";

const messageTypes = ["texto", "imagen", "video", "archivo", "sistema"] as const;
const messageStates = ["visible", "eliminado"] as const;

const multimediaSchema = z.object({
  tipo: z.enum(["imagen", "video", "archivo"]),
  url: z.string().url(),
  descripcion: z.string().max(250).optional()
});

const createMessageSchema = z.object({
  comunidadId: z.string().min(1),
  usuarioId: z.string().min(1),
  contenido: z.string().min(1).max(1000),
  tipoMensaje: z.enum(messageTypes).default("texto"),
  multimedia: z.array(multimediaSchema).default([])
});

const updateMessageSchema = createMessageSchema.partial().extend({
  estado: z.enum(messageStates).optional()
});

const reactionSchema = z.object({
  usuarioId: z.string().min(1),
  tipo: z.string().min(2).max(40)
});

function buildCommunityMessage(input, now = new Date()) {
  const data = validate(createMessageSchema, input);
  return {
    comunidadId: toObjectId(data.comunidadId, "comunidadId"),
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    contenido: data.contenido,
    tipoMensaje: data.tipoMensaje,
    multimedia: data.multimedia,
    reacciones: [],
    estado: "visible",
    fechaEnvio: now
  };
}

function buildCommunityMessagePatch(input) {
  const data = validate(updateMessageSchema, input);

  if (data.comunidadId) data.comunidadId = toObjectId(data.comunidadId, "comunidadId");
  if (data.usuarioId) data.usuarioId = toObjectId(data.usuarioId, "usuarioId");

  return data;
}

function buildMessageReaction(input, now = new Date()) {
  const data = validate(reactionSchema, input);
  return {
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    tipo: data.tipo,
    fecha: now
  };
}

export { buildCommunityMessage, buildCommunityMessagePatch, buildMessageReaction, messageTypes, messageStates };

