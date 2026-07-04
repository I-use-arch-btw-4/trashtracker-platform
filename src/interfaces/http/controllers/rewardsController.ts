import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createRewardsController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.rewards.listRewards)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.rewards.getReward(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.rewards.createReward(req.body))),
    update: asyncHandler(async (req, res) => sendOk(res, await useCases.rewards.updateReward(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.rewards.deleteReward(req.params.id)))
  };
}

export { createRewardsController };

