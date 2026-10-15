import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFound, requireSameOrigin } from "./middleware/security.js";
import { authRouter } from "./routes/authRoutes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(requireSameOrigin);
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/v1/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api/v1/auth", authRouter);
app.use(notFound);
app.use(errorHandler);