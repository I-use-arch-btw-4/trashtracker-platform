import { Router } from "express";
import { createNotificationsController } from "../controllers/notificationsController";

function notificationsRoutes(useCases) {
  const router = Router();
  const controller = createNotificationsController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id/leida", controller.markAsRead);
  router.delete("/:id", controller.remove);

  return router;
}

export { notificationsRoutes };

