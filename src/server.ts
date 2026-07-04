import { readEnv } from "./config/env";
import { connectToMongo } from "./config/database";
import { createApp } from "./app";

async function main() {
  const env = readEnv();
  const { client, db } = await connectToMongo(env);
  const app = createApp({ db, env });

  const server = app.listen(env.port, () => {
    console.log(`TrashTracker API listening on http://localhost:${env.port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received. Closing server...`);
    server.close(async () => {
      await client.close();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("Failed to start TrashTracker API", error);
  process.exit(1);
});

