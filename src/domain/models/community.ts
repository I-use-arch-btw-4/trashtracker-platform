import { z } from "zod";
import { toObjectId } from "../../shared/mongodb/objectId";
import { validate } from "../validation";

const createCommunitySchema = z.object({
  nombre: z.string().min(3).max(140),
  distrito: z.string().min(2).max(120),
  descripcion: z.string().min(8).max(800),
  liderId: z.string().min(1)
});

const updateCommunitySchema = createCommunitySchema.partial().extend({
  estado: z.enum(["activa", "inactiva"]).optional()
});

const memberSchema = z.object({
  usuarioId: z.string().min(1),
  rolComunidad: z.enum(["lider", "miembro", "observador_institucional"]).default("miembro")
});

function buildCommunity(input, now = new Date()) {
  const data = validate(createCommunitySchema, input);
  const liderId = toObjectId(data.liderId, "liderId");

  return {
    nombre: data.nombre,
    distrito: data.distrito,
    descripcion: data.descripcion,
    liderId,
    estado: "activa",
    miembros: [
      {
        usuarioId: liderId,
        rolComunidad: "lider",
        fechaUnion: now,
        estado: "activo"
      }
    ],
    fechaCreacion: now
  };
}

function buildCommunityPatch(input) {
  const data = validate(updateCommunitySchema, input);

  if (data.liderId) {
    data.liderId = toObjectId(data.liderId, "liderId");
  }

  return data;
}

function buildCommunityMember(input, now = new Date()) {
  const data = validate(memberSchema, input);
  return {
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    rolComunidad: data.rolComunidad,
    fechaUnion: now,
    estado: "activo"
  };
}

export { buildCommunity, buildCommunityPatch, buildCommunityMember };

