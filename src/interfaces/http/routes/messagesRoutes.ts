import { Router } from "express";
import { createMessagesController } from "../controllers/messagesController";

function messagesRoutes(useCases) {
  const router = Router();
  const controller = createMessagesController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  router.post("/:id/reacciones", controller.addReaction);

  return router;
}

export { messagesRoutes };

