import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createRepositories } from "./infrastructure/repositories/repositoryFactory";
import { createUseCases } from "./application/use-cases";
import { apiRoutes } from "./interfaces/http/routes";
import { errorHandler } from "./shared/http/errorHandler";
import { notFoundHandler } from "./shared/http/notFoundHandler";

function createApp({ db, env }) {
  const app = express();
  const repositories = createRepositories(db);
  const useCases = createUseCases({ db, repositories });

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin === "*" ? true : env.corsOrigin }));
  app.use(express.json({ limit: env.requestLimit }));
  app.use(morgan(env.nodeEnv === "test" ? "tiny" : "dev"));

  app.get("/", (req, res) => {
    res.json({
      name: "TrashTracker Platform API",
      version: "1.0.0",
      docs: "/api/v1"
    });
  });

  app.get("/api/health", async (req, res, next) => {
    try {
      await db.command({ ping: 1 });
      res.json({
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/v1", apiRoutes(useCases));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { createApp };

