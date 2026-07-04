import { MongoClient } from "mongodb";

async function connectToMongo({ mongoUri, mongoDbName }) {
  const client = new MongoClient(mongoUri);
  await client.connect();

  return {
    client,
    db: client.db(mongoDbName)
  };
}

export { connectToMongo };

