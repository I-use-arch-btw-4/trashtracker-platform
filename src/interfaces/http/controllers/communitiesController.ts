import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createCommunitiesController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.communities.listCommunities)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.communities.getCommunity(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.communities.createCommunity(req.body))),
    update: asyncHandler(async (req, res) => sendOk(res, await useCases.communities.updateCommunity(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.communities.deleteCommunity(req.params.id))),
    addMember: asyncHandler(async (req, res) => sendCreated(res, await useCases.communities.addMember(req.params.id, req.body)))
  };
}

export { createCommunitiesController };

