import { z } from "zod";
import { toObjectId } from "../../shared/mongodb/objectId";
import { validate } from "../validation";

const redemptionStates = ["pendiente", "usado", "cancelado"] as const;

const createRedemptionSchema = z.object({
  usuarioId: z.string().min(1),
  recompensaId: z.string().min(1)
});

const updateRedemptionSchema = z.object({
  estado: z.enum(redemptionStates)
});

function buildRedemption(input, reward, now = new Date()) {
  const data = validate(createRedemptionSchema, input);
  const suffix = now.getTime().toString(36).toUpperCase();

  return {
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    recompensaId: toObjectId(data.recompensaId, "recompensaId"),
    puntosUsados: reward.puntosRequeridos,
    codigoCanje: `TT-ECO-${suffix}`,
    estado: "pendiente",
    fechaCanje: now
  };
}

function buildRedemptionPatch(input) {
  return validate(updateRedemptionSchema, input);
}

export { buildRedemption, buildRedemptionPatch, redemptionStates };

