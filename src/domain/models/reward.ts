import { z } from "zod";
import { toObjectId } from "../../shared/mongodb/objectId";
import { validate } from "../validation";

const rewardStates = ["disponible", "agotado", "inactivo"] as const;

const createRewardSchema = z.object({
  comercioId: z.string().min(1),
  nombre: z.string().min(4).max(180),
  descripcion: z.string().min(8).max(800),
  puntosRequeridos: z.number().int().positive(),
  stock: z.number().int().min(0),
  estado: z.enum(rewardStates).default("disponible")
});

const updateRewardSchema = createRewardSchema.partial();

function buildReward(input) {
  const data = validate(createRewardSchema, input);
  return {
    ...data,
    comercioId: toObjectId(data.comercioId, "comercioId")
  };
}

function buildRewardPatch(input) {
  const data = validate(updateRewardSchema, input);

  if (data.comercioId) {
    data.comercioId = toObjectId(data.comercioId, "comercioId");
  }

  return data;
}

export { buildReward, buildRewardPatch, rewardStates };

