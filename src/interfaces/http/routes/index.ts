import { Router } from "express";
import { usersRoutes } from "./usersRoutes";
import { reportsRoutes } from "./reportsRoutes";
import { communitiesRoutes } from "./communitiesRoutes";
import { eventsRoutes } from "./eventsRoutes";
import { storesRoutes } from "./storesRoutes";
import { rewardsRoutes } from "./rewardsRoutes";
import { redemptionsRoutes } from "./redemptionsRoutes";
import { messagesRoutes } from "./messagesRoutes";
import { notificationsRoutes } from "./notificationsRoutes";
import { dashboardRoutes } from "./dashboardRoutes";

function apiRoutes(useCases) {
  const router = Router();

  router.use("/usuarios", usersRoutes(useCases));
  router.use("/reportes", reportsRoutes(useCases));
  router.use("/comunidades", communitiesRoutes(useCases));
  router.use("/eventos-limpieza", eventsRoutes(useCases));
  router.use("/comercios", storesRoutes(useCases));
  router.use("/recompensas", rewardsRoutes(useCases));
  router.use("/canjes", redemptionsRoutes(useCases));
  router.use("/mensajes-comunidad", messagesRoutes(useCases));
  router.use("/notificaciones", notificationsRoutes(useCases));
  router.use("/dashboard", dashboardRoutes(useCases));

  return router;
}

export { apiRoutes };

