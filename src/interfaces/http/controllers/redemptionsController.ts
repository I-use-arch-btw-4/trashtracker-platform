import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createRedemptionsController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.redemptions.listRedemptions)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.redemptions.getRedemption(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.redemptions.createRedemption(req.body))),
    update: asyncHandler(async (req, res) => sendOk(res, await useCases.redemptions.updateRedemption(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.redemptions.deleteRedemption(req.params.id)))
  };
}

export { createRedemptionsController };

