import { Router } from "express";
import { createDashboardController } from "../controllers/dashboardController";

function dashboardRoutes(useCases) {
  const router = Router();
  const controller = createDashboardController(useCases);

  router.get("/resumen", controller.summary);

  return router;
}

export { dashboardRoutes };

