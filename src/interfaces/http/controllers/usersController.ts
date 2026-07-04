import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createUsersController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.users.listUsers)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.users.getUser(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.users.createUser(req.body))),
    update: asyncHandler(async (req, res) => sendOk(res, await useCases.users.updateUser(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.users.deleteUser(req.params.id)))
  };
}

export { createUsersController };

