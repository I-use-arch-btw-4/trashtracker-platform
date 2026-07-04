import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createEventsController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.events.listEvents)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.events.getEvent(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.events.createEvent(req.body))),
    update: asyncHandler(async (req, res) => sendOk(res, await useCases.events.updateEvent(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.events.deleteEvent(req.params.id))),
    addAttendee: asyncHandler(async (req, res) => sendCreated(res, await useCases.events.addAttendee(req.params.id, req.body))),
    addEvidence: asyncHandler(async (req, res) => sendCreated(res, await useCases.events.addEvidence(req.params.id, req.body)))
  };
}

export { createEventsController };

