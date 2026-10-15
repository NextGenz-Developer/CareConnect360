import dotenv from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

dotenv.config({ path: process.env.ENV_FILE || resolve(process.cwd(), "../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  APP_BASE_URL: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/careconnect360"),
  JWT_SECRET: z.string().default("careconnect360-local-jwt-secret-change-before-production"),
  COOKIE_SECRET: z.string().default("careconnect360-local-cookie-secret-change-before-production"),
});

export const env = envSchema.parse(process.env);

if (env.NODE_ENV === "production") {
  for (const [name, value] of [["JWT_SECRET", env.JWT_SECRET], ["COOKIE_SECRET", env.COOKIE_SECRET]] as const) {
    if (value.length < 32 || /replace-with|change-before-production|local-secret/i.test(value)) {
      throw new Error(`${name} must be a unique secret of at least 32 characters in production.`);
    }
  }
}

if (env.NODE_ENV === "development" && (!process.env.JWT_SECRET || !process.env.COOKIE_SECRET)) {
  console.warn("Using local-only development secrets. Set unique secrets before deployment.");
}