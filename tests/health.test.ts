import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app";
import { createInMemoryDb } from "./helpers/inMemoryDb";

const testEnv = {
  nodeEnv: "test",
  corsOrigin: "*",
  requestLimit: "2mb"
};

test("GET /api/health returns API and database status", async () => {
  const app = createApp({
    db: createInMemoryDb(),
    env: testEnv
  });

  const response = await request(app).get("/api/health").expect(200);

  assert.equal(response.body.status, "ok");
  assert.equal(response.body.database, "connected");
});
