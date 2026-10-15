import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireSameOrigin(request: Request, response: Response, next: NextFunction) {
  if (safeMethods.has(request.method)) return next();

  const origin = request.get("origin");
  if (origin === env.CLIENT_ORIGIN) return next();
  if (!origin && env.NODE_ENV !== "production") return next();

  return response.status(403).json({ message: "Request origin could not be verified." });
}

export function notFound(_request: Request, response: Response) {
  response.status(404).json({ message: "Route not found." });
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error && typeof error === "object" && "status" in error && typeof error.status === "number") {
    const message = "message" in error && typeof error.message === "string" ? error.message : "Request failed.";
    return response.status(error.status).json({ message });
  }

  console.error("Unhandled API error", error instanceof Error ? error.message : "Unknown error");
  return response.status(500).json({ message: "An unexpected error occurred." });
}