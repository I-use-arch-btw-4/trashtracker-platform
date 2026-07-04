import dotenv from "dotenv";

dotenv.config();

function readEnv() {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 3000),
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/trashtracker",
    mongoDbName: process.env.MONGO_DB_NAME || "trashtracker",
    corsOrigin: process.env.CORS_ORIGIN || "*",
    requestLimit: process.env.REQUEST_LIMIT || "2mb"
  };
}

export { readEnv };

