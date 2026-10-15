import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";

try {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  app.listen(env.PORT, "0.0.0.0", () => {
    console.info(`CareConnect API listening on port ${env.PORT}.`);
  });
} catch (error) {
  console.error("Could not connect to MongoDB. Check MONGODB_URI and confirm the database is running.");
  if (env.NODE_ENV !== "production") console.error(error instanceof Error ? error.message : "Unknown connection error");
  process.exitCode = 1;
}