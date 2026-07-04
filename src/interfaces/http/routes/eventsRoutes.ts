import { Router } from "express";
import { createEventsController } from "../controllers/eventsController";

function eventsRoutes(useCases) {
  const router = Router();
  const controller = createEventsController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  router.post("/:id/asistentes", controller.addAttendee);
  router.post("/:id/evidencias", controller.addEvidence);

  return router;
}

export { eventsRoutes };

