import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export const sessionCookieName = "cc360_session";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: "CUSTOMER" | "SUPPORT_AGENT" | "ADMIN";
      };
    }
  }
}

type SessionClaims = jwt.JwtPayload & { sub: string; version: number };

export async function authenticate(request: Request, response: Response, next: NextFunction) {
  try {
    const token = request.signedCookies?.[sessionCookieName];
    if (!token || typeof token !== "string") {
      return response.status(401).json({ message: "Sign in to continue." });
    }

    const claims = jwt.verify(token, env.JWT_SECRET) as SessionClaims;
    const user = await User.findById(claims.sub).select("name email role isActive sessionVersion");

    if (!user || !user.isActive || user.sessionVersion !== claims.version) {
      return response.status(401).json({ message: "Your session has expired. Sign in again." });
    }

    request.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    return next();
  } catch {
    return response.status(401).json({ message: "Your session has expired. Sign in again." });
  }
}