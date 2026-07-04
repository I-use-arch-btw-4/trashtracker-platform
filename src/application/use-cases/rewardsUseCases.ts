import { buildReward, buildRewardPatch } from "../../domain/models/reward";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createRewardsUseCases({ repositories }) {
  async function listRewards({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.estado) filter.estado = query.estado;
    if (query.comercioId) filter.comercioId = toObjectId(query.comercioId, "comercioId");

    return repositories.rewards.list({
      filter,
      sort: { puntosRequeridos: 1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getReward(id) {
    const reward = await repositories.rewards.findById(toObjectId(id));
    if (!reward) throw new AppError(404, "Recompensa no encontrada.");
    return reward;
  }

  async function createReward(payload) {
    return repositories.rewards.create(buildReward(payload));
  }

  async function updateReward(id, payload) {
    const reward = await repositories.rewards.updateById(toObjectId(id), buildRewardPatch(payload));
    if (!reward) throw new AppError(404, "Recompensa no encontrada.");
    return reward;
  }

  async function deleteReward(id) {
    const reward = await repositories.rewards.deleteById(toObjectId(id));
    if (!reward) throw new AppError(404, "Recompensa no encontrada.");
    return reward;
  }

  return { listRewards, getReward, createReward, updateReward, deleteReward };
}

export { createRewardsUseCases };

