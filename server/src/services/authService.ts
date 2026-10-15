import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";
import { sessionCookieName } from "../middleware/authenticate.js";
import { User } from "../models/User.js";

const sessionDurationSeconds = 8 * 60 * 60;
const rememberDurationSeconds = 30 * 24 * 60 * 60;
const passwordResetDurationMs = 30 * 60 * 1000;

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  signed: true,
  path: "/",
};

type PublicUserSource = { _id: unknown; name: string; email: string; role: string; phone?: string };

function publicUser(user: PublicUserSource) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role, phone: user.phone };
}

export function setSessionCookie(response: Response, user: { id: string; role: string; sessionVersion: number }, rememberMe: boolean) {
  const expiresIn = rememberMe ? rememberDurationSeconds : sessionDurationSeconds;
  const token = jwt.sign({ role: user.role, version: user.sessionVersion }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn,
  });
  const options = rememberMe ? { ...sessionCookieOptions, maxAge: expiresIn * 1000 } : sessionCookieOptions;
  response.cookie(sessionCookieName, token, options);
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(sessionCookieName, sessionCookieOptions);
}

export async function register(input: { name: string; email: string; password: string; phone?: string }) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    phone: input.phone || undefined,
    role: "CUSTOMER",
  });
  return publicUser(user);
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return user;
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issuePasswordReset(email: string) {
  const user = await User.findOne({ email }).select("+resetTokenHash +resetTokenExpiresAt");
  if (!user || !user.isActive) return null;

  const token = randomBytes(32).toString("base64url");
  user.resetTokenHash = hashResetToken(token);
  user.resetTokenExpiresAt = new Date(Date.now() + passwordResetDurationMs);
  await user.save();

  if (env.NODE_ENV === "development") {
    return `${env.APP_BASE_URL}/reset-password/${token}`;
  }
  return null;
}

export async function resetPassword(token: string, password: string) {
  const user = await User.findOne({
    resetTokenHash: hashResetToken(token),
    resetTokenExpiresAt: { $gt: new Date() },
    isActive: true,
  }).select("+passwordHash +resetTokenHash +resetTokenExpiresAt");

  if (!user) return false;

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  user.sessionVersion += 1;
  await user.save();
  return true;
}

export function toPublicUser(user: PublicUserSource) {
  return publicUser(user);
}