import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createStoresController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.stores.listStores)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.stores.getStore(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.stores.createStore(req.body))),
    update: asyncHandler(async (req, res) => sendOk(res, await useCases.stores.updateStore(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.stores.deleteStore(req.params.id)))
  };
}

export { createStoresController };

