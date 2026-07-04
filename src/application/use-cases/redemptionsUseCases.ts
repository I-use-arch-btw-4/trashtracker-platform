import { collections } from "../../domain/collections";
import { buildRedemption, buildRedemptionPatch } from "../../domain/models/redemption";
import { applyPointMovement } from "../services/pointsLedger";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createRedemptionsUseCases({ db, repositories }) {
  async function listRedemptions({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.usuarioId) filter.usuarioId = toObjectId(query.usuarioId, "usuarioId");
    if (query.estado) filter.estado = query.estado;

    return repositories.redemptions.list({
      filter,
      sort: { fechaCanje: -1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getRedemption(id) {
    const redemption = await repositories.redemptions.findById(toObjectId(id));
    if (!redemption) throw new AppError(404, "Canje no encontrado.");
    return redemption;
  }

  async function createRedemption(payload) {
    const usuarioId = toObjectId(payload.usuarioId, "usuarioId");
    const recompensaId = toObjectId(payload.recompensaId, "recompensaId");
    const [user, reward] = await Promise.all([
      repositories.users.findById(usuarioId),
      repositories.rewards.findById(recompensaId)
    ]);

    if (!user) throw new AppError(404, "Usuario no encontrado.");
    if (!reward) throw new AppError(404, "Recompensa no encontrada.");
    if (reward.estado !== "disponible" || reward.stock <= 0) {
      throw new AppError(409, "La recompensa no esta disponible.");
    }
    if ((user.puntosTotales || 0) < reward.puntosRequeridos) {
      throw new AppError(409, "El usuario no tiene puntos suficientes.");
    }

    const redemption = buildRedemption(payload, reward);
    const created = await repositories.redemptions.create(redemption);

    const rewardAfterStock = reward.stock - 1;
    await db.collection(collections.rewards).updateOne(
      { _id: reward._id },
      {
        $set: {
          stock: rewardAfterStock,
          estado: rewardAfterStock === 0 ? "agotado" : reward.estado
        }
      }
    );

    await applyPointMovement(db, {
      usuarioId: redemption.usuarioId,
      referenciaId: created._id,
      tipoReferencia: "canje",
      puntos: -redemption.puntosUsados,
      motivo: "Canje de recompensa"
    });

    return created;
  }

  async function updateRedemption(id, payload) {
    const patch = buildRedemptionPatch(payload);
    const redemption = await repositories.redemptions.updateById(toObjectId(id), patch);
    if (!redemption) throw new AppError(404, "Canje no encontrado.");
    return redemption;
  }

  async function deleteRedemption(id) {
    const redemption = await repositories.redemptions.deleteById(toObjectId(id));
    if (!redemption) throw new AppError(404, "Canje no encontrado.");
    return redemption;
  }

  return {
    listRedemptions,
    getRedemption,
    createRedemption,
    updateRedemption,
    deleteRedemption
  };
}

export { createRedemptionsUseCases };

