import { Router } from "express";
import { createCommunitiesController } from "../controllers/communitiesController";

function communitiesRoutes(useCases) {
  const router = Router();
  const controller = createCommunitiesController(useCases);

  router.get("/", controller.list);
  router.post("/", controller.create);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);
  router.post("/:id/miembros", controller.addMember);

  return router;
}

export { communitiesRoutes };

