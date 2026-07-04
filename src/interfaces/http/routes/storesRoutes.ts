import { Router } from "express";
import { createStoresController } from "../controllers/storesController";

function storesRoutes(useCases) {
  const router = Router();
  const controller = createStoresController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

export { storesRoutes };

