import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/careconnect360_auth_test";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.APP_BASE_URL = "http://localhost:5173";
process.env.JWT_SECRET = "test-only-jwt-secret-not-for-production";
process.env.COOKIE_SECRET = "test-only-cookie-secret-not-for-production";

const [{ app }, { User }, { env }] = await Promise.all([
  import("../app.js"),
  import("../models/User.js"),
  import("../config/env.js"),
]);

env.NODE_ENV = "development";

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await mongoose.connection.dropDatabase();
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("registration creates a customer, sets an HTTP-only session, and never returns a hash", async () => {
  const browser = request.agent(app);
  const response = await browser.post("/api/v1/auth/register").send({
    name: "Alex Customer",
    email: "Alex@example.com",
    password: "StrongPass123",
    termsAccepted: true,
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.email, "alex@example.com");
  assert.equal(response.body.user.role, "CUSTOMER");
  assert.equal("passwordHash" in response.body.user, false);
  assert.match(response.headers["set-cookie"][0], /HttpOnly/i);

  const session = await browser.get("/api/v1/auth/me");
  assert.equal(session.status, 200);
  assert.equal(session.body.user.name, "Alex Customer");
});

test("public registration cannot assign a privileged role", async () => {
  const response = await request(app).post("/api/v1/auth/register").send({
    name: "Attempted Admin",
    email: "attempt@example.com",
    password: "StrongPass123",
    termsAccepted: true,
    role: "ADMIN",
  });

  assert.equal(response.status, 400);
  assert.equal(await User.countDocuments({ email: "attempt@example.com" }), 0);
});

test("login validates credentials and logout expires the session", async () => {
  const browser = request.agent(app);
  await browser.post("/api/v1/auth/register").send({
    name: "Login Customer",
    email: "login@example.com",
    password: "StrongPass123",
    termsAccepted: true,
  }).expect(201);

  await browser.post("/api/v1/auth/login").send({ email: "login@example.com", password: "wrong-password" }).expect(401);
  await browser.post("/api/v1/auth/login").send({ email: "login@example.com", password: "StrongPass123", rememberMe: true }).expect(200);
  await browser.post("/api/v1/auth/logout").expect(200);
  await browser.get("/api/v1/auth/me").expect(401);
});

test("password reset preview is one-time and changes the credential", async () => {
  await request(app).post("/api/v1/auth/register").send({
    name: "Reset Customer",
    email: "reset@example.com",
    password: "StrongPass123",
    termsAccepted: true,
  }).expect(201);

  const forgot = await request(app).post("/api/v1/auth/forgot-password").send({ email: "reset@example.com" }).expect(200);
  const previewUrl = new URL(forgot.body.developmentPreviewUrl);
  const token = previewUrl.pathname.split("/").at(-1);
  assert.ok(token);
  assert.match(previewUrl.pathname, /^\/reset-password\//);

  await request(app).post("/api/v1/auth/reset-password").send({ token, password: "NewStrongPass456" }).expect(200);
  await request(app).post("/api/v1/auth/reset-password").send({ token, password: "AnotherStrong789" }).expect(400);
  await request(app).post("/api/v1/auth/login").send({ email: "reset@example.com", password: "NewStrongPass456" }).expect(200);
});

test("mutating requests reject a different origin", async () => {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .set("Origin", "https://unexpected.example")
    .send({ name: "Cross Origin", email: "origin@example.com", password: "StrongPass123" });

  assert.equal(response.status, 403);
});