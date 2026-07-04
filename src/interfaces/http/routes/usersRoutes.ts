import { Router } from "express";
import { createUsersController } from "../controllers/usersController";

function usersRoutes(useCases) {
  const router = Router();
  const controller = createUsersController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

export { usersRoutes };

