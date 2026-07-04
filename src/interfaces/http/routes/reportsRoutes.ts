import { Router } from "express";
import { createReportsController } from "../controllers/reportsController";

function reportsRoutes(useCases) {
  const router = Router();
  const controller = createReportsController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  router.post("/:id/comentarios", controller.addComment);
  router.post("/:id/validaciones", controller.addValidation);
  router.post("/:id/reacciones", controller.addReaction);

  return router;
}

export { reportsRoutes };

