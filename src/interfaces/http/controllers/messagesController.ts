import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createMessagesController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.messages.listMessages)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.messages.getMessage(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.messages.createMessage(req.body))),
    update: asyncHandler(async (req, res) => sendOk(res, await useCases.messages.updateMessage(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.messages.deleteMessage(req.params.id))),
    addReaction: asyncHandler(async (req, res) => sendCreated(res, await useCases.messages.addReaction(req.params.id, req.body)))
  };
}

export { createMessagesController };

