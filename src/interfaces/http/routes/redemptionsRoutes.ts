import { Router } from "express";
import { createRedemptionsController } from "../controllers/redemptionsController";

function redemptionsRoutes(useCases) {
  const router = Router();
  const controller = createRedemptionsController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

export { redemptionsRoutes };

