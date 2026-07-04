import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendCreated, sendList, sendOk } from "./controllerUtils";

function createReportsController(useCases) {
  return {
    list: asyncHandler(async (req, res) => sendList(req, res, useCases.reports.listReports)),
    getById: asyncHandler(async (req, res) => sendOk(res, await useCases.reports.getReport(req.params.id))),
    create: asyncHandler(async (req, res) => sendCreated(res, await useCases.reports.createReport(req.body))),
    update: asyncHandler(async (req, res) => sendOk(res, await useCases.reports.updateReport(req.params.id, req.body))),
    remove: asyncHandler(async (req, res) => sendOk(res, await useCases.reports.deleteReport(req.params.id))),
    addComment: asyncHandler(async (req, res) => sendCreated(res, await useCases.reports.addComment(req.params.id, req.body))),
    addValidation: asyncHandler(async (req, res) => sendCreated(res, await useCases.reports.addValidation(req.params.id, req.body))),
    addReaction: asyncHandler(async (req, res) => sendCreated(res, await useCases.reports.addReaction(req.params.id, req.body)))
  };
}

export { createReportsController };

