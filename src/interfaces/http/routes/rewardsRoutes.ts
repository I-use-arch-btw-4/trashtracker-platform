import { Router } from "express";
import { createRewardsController } from "../controllers/rewardsController";

function rewardsRoutes(useCases) {
  const router = Router();
  const controller = createRewardsController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

export { rewardsRoutes };

