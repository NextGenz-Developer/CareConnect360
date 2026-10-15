import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { authenticate } from "../middleware/authenticate.js";
import { User } from "../models/User.js";
import { clearSessionCookie, issuePasswordReset, login, resetPassword, setSessionCookie, toPublicUser, register } from "../services/authService.js";

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: "draft-7", legacyHeaders: false });
const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(8).max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/[0-9]/, "Password must contain a number.");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().max(30).optional(),
  termsAccepted: z.literal(true),
}).strict();

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional().default(false),
}).strict();

const forgotSchema = z.object({ email: emailSchema }).strict();
const resetSchema = z.object({ token: z.string().min(32).max(128), password: passwordSchema }).strict();

function validationError() {
  return { message: "Check the submitted fields and try again." };
}

authRouter.post("/register", authLimiter, async (request, response, next) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ ...validationError(), errors: parsed.error.flatten().fieldErrors });

  try {
    const user = await register(parsed.data);
    const record = await User.findOne({ email: user.email }).select("sessionVersion role");
    if (!record) throw new Error("Newly created account could not be read.");
    setSessionCookie(response, { id: record.id, role: record.role, sessionVersion: record.sessionVersion }, false);
    return response.status(201).json({ user });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return response.status(409).json({ message: "An account with that email already exists." });
    }
    return next(error);
  }
});

authRouter.post("/login", authLimiter, async (request, response, next) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ ...validationError(), errors: parsed.error.flatten().fieldErrors });

  try {
    const user = await login(parsed.data.email, parsed.data.password);
    if (!user) return response.status(401).json({ message: "Email or password is incorrect." });
    setSessionCookie(response, { id: user.id, role: user.role, sessionVersion: user.sessionVersion }, parsed.data.rememberMe);
    return response.json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/logout", (_request, response) => {
  clearSessionCookie(response);
  return response.json({ message: "Signed out." });
});

authRouter.get("/me", authenticate, async (request, response, next) => {
  try {
    const user = await User.findById(request.user?.id).select("name email role phone");
    if (!user) return response.status(401).json({ message: "Your session has expired. Sign in again." });
    return response.json({ user: toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/forgot-password", authLimiter, async (request, response, next) => {
  const parsed = forgotSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ ...validationError(), errors: parsed.error.flatten().fieldErrors });

  try {
    const developmentPreviewUrl = await issuePasswordReset(parsed.data.email);
    const body: { message: string; developmentPreviewUrl?: string } = {
      message: "If an account matches that email, reset instructions will be sent.",
    };
    if (developmentPreviewUrl) body.developmentPreviewUrl = developmentPreviewUrl;
    return response.json(body);
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/reset-password", authLimiter, async (request, response, next) => {
  const parsed = resetSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ ...validationError(), errors: parsed.error.flatten().fieldErrors });

  try {
    const reset = await resetPassword(parsed.data.token, parsed.data.password);
    if (!reset) return response.status(400).json({ message: "This reset link is invalid or expired." });
    clearSessionCookie(response);
    return response.json({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    return next(error);
  }
});
