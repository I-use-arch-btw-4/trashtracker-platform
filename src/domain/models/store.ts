import { z } from "zod";
import { validate } from "../validation";

const storeStates = ["activo", "inactivo"] as const;

const createStoreSchema = z.object({
  nombre: z.string().min(3).max(160),
  rubro: z.string().min(3).max(120),
  direccion: z.string().min(3).max(200),
  distrito: z.string().min(2).max(120),
  contacto: z.string().min(5).max(160),
  estado: z.enum(storeStates).default("activo")
});

const updateStoreSchema = createStoreSchema.partial();

function buildStore(input) {
  return validate(createStoreSchema, input);
}

function buildStorePatch(input) {
  return validate(updateStoreSchema, input);
}

export { buildStore, buildStorePatch, storeStates };

