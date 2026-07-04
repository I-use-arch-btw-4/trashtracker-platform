import { z } from "zod";
import { validate } from "../validation";

const userRoles = ["ciudadano", "lider", "municipalidad", "comercio", "admin"] as const;
const accountStates = ["activo", "suspendido", "eliminado"] as const;

const profileSchema = z.object({
  fotoUrl: z.string().url().optional(),
  biografia: z.string().max(500).optional(),
  intereses: z.array(z.string().min(1)).default([])
}).default({});

const preferencesSchema = z.object({
  idioma: z.string().min(2).default("es"),
  notificaciones: z.boolean().default(true)
}).default({});

const createUserSchema = z.object({
  nombre: z.string().min(2).max(120),
  correo: z.string().email(),
  distrito: z.string().min(2).max(120),
  rol: z.enum(userRoles).default("ciudadano"),
  perfil: profileSchema,
  preferencias: preferencesSchema
});

const updateUserSchema = createUserSchema.partial().extend({
  puntosTotales: z.number().int().optional(),
  nivel: z.number().int().positive().optional(),
  estadoCuenta: z.enum(accountStates).optional()
});

function buildUser(input, now = new Date()) {
  const data = validate(createUserSchema, input);

  return {
    ...data,
    correo: data.correo.toLowerCase(),
    puntosTotales: 0,
    nivel: 1,
    fechaRegistro: now,
    estadoCuenta: "activo"
  };
}

function buildUserPatch(input) {
  const data = validate(updateUserSchema, input);

  if (data.correo) {
    data.correo = data.correo.toLowerCase();
  }

  return data;
}

export { buildUser, buildUserPatch, userRoles, accountStates };

