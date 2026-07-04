import { asyncHandler } from "../../../shared/http/asyncHandler";
import { sendOk } from "./controllerUtils";

function createDashboardController(useCases) {
  return {
    summary: asyncHandler(async (req, res) => sendOk(res, await useCases.dashboard.getSummary()))
  };
}

export { createDashboardController };

