// The app's browser API under /api/app/*: US-01m3rvr64zrzczabckjf6crb2z (pace), US-01m3rwa0cvrtcapqk0k3h6mqvc (what to eat),
// US-01m3rw2bqxkqp6v1hg9g02t1zr (chat onboarding and settings). Every request carries the session cookie; requests that
// change anything also need the custom header, as CSRF protection.
import { Router, type Request, type RequestHandler } from "express";
import express from "express";
import { z } from "zod";
import { dayKey, TokenBudget, type UsageStore } from "../ai/budget.js";
import type { AiModel } from "../ai/model.js";
import { whatNow } from "../ai/whatNow.js";
import type { HealthApi } from "../health/api.js";
import type { AppSettings, Store } from "../store/types.js";
import type { Sessions } from "./session.js";
import { runAgent } from "../ai/agent.js";
import { makeAgentEnv } from "./agentEnv.js";
import { logNutrition, timeZoneOf } from "./meal.js";
import { loadToday, loadUsuals } from "./today.js";

export const CSRF_HEADER = "x-health-ai";
const TOKEN_USAGE_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export interface AppApiDeps {
  store: Store;
  sessions: Sessions;
  apiFor: (userId: string) => HealthApi;
  ai?: { model: AiModel; modelName: string; dailyTokenLimit: number };
  now: () => number;
}

const settingsBody = z.object({
  goals: z.object({ calories: z.number().int().min(500).max(10000), carbs: z.number().int().min(0).max(1500), protein: z.number().int().min(0).max(600) }),
  window: z.object({ startHour: z.number().int().min(0).max(23), endHour: z.number().int().min(1).max(24) }).refine((w) => w.endHour > w.startHour, "The window must end after it starts."),
  constraints: z.array(z.string().trim().min(1).max(60)).max(50),
  consent: z.boolean().optional(),
});

const logBody = z.object({
  name: z.string().trim().min(1).max(120),
  kcal: z.number().min(0).max(5000),
  carbs: z.number().min(0).max(1000),
  protein: z.number().min(0).max(500),
});
const POINT_ID = /^(?:users\/[^/]+\/dataTypes\/nutrition-log\/dataPoints\/)?([A-Za-z0-9._~-]{1,200})$/;

const chatBody = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) })).max(40).default([]),
  image: z.object({ mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]), dataBase64: z.string().max(7_000_000) }).optional(),
});

const whatNowBody = z.object({
  optionsText: z.string().max(2000).optional(),
  image: z.object({ mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]), dataBase64: z.string().max(7_000_000) }).optional(),
}).refine((b) => b.optionsText || b.image, "Give a photo or a list of options.");

/** A usage store backed by the persistent Store, so the daily limit survives restarts and instances. */
function usageStoreOf(store: Store, now: () => number): UsageStore {
  return {
    get: (userId, day) => store.getTokenUsage(userId, day),
    add: (userId, day, tokens) => store.addTokenUsage(userId, day, tokens, now() + TOKEN_USAGE_TTL_MS),
  };
}

export function appApiRouter(deps: AppApiDeps): Router {
  const router = Router();
  router.use(express.json({ limit: "8mb" }));

  const session: RequestHandler = async (req, res, next) => {
    const userId = await deps.sessions.userOf(req.headers.cookie);
    if (!userId) {
      res.status(401).json({ error: "not_signed_in" });
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD" && req.headers[CSRF_HEADER] !== "1") {
      res.status(403).json({ error: "missing_header" });
      return;
    }
    res.locals["userId"] = userId;
    next();
  };
  router.use(session);

  const uid = (req: Request) => String((req.res as { locals: Record<string, unknown> }).locals["userId"]);

  router.get("/me", async (req, res) => {
    const user = await deps.store.getUser(uid(req));
    if (!user) {
      res.status(401).json({ error: "not_signed_in" });
      return;
    }
    const settings = await deps.store.getAppSettings(user.id);
    res.json({ email: user.email, onboarded: settings?.onboardedAt !== undefined });
  });

  router.get("/settings", async (req, res) => {
    const s = await deps.store.getAppSettings(uid(req));
    res.json({ settings: s ?? null });
  });

  router.put("/settings", async (req, res) => {
    const parsed = settingsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_settings", detail: parsed.error.issues.map((i) => i.message) });
      return;
    }
    const userId = uid(req);
    const before = await deps.store.getAppSettings(userId);
    const at = deps.now();
    const next: AppSettings = {
      userId,
      goals: parsed.data.goals,
      window: parsed.data.window,
      constraints: parsed.data.constraints,
      updatedAt: at,
      ...(before?.consentAt !== undefined || parsed.data.consent ? { consentAt: before?.consentAt ?? at } : {}),
      ...(before?.onboardedAt !== undefined || parsed.data.consent ? { onboardedAt: before?.onboardedAt ?? at } : {}),
    };
    await deps.store.putAppSettings(next);
    res.json({ settings: next });
  });

  router.get("/state", async (req, res) => {
    const userId = uid(req);
    const settings = await deps.store.getAppSettings(userId);
    if (!settings) {
      res.status(409).json({ error: "onboarding_required" });
      return;
    }
    const today = await loadToday(deps.apiFor(userId), deps.now());
    res.json({ goals: settings.goals, window: settings.window, constraints: settings.constraints, eaten: today.eaten, date: today.clock.date, minutes: today.clock.minutes, timeZone: today.timeZone });
  });

  // US-01m3rvr6p4vj42j4atck7vyw08 (Log water and repeat items in one tap): the foods logged most often in the last 30 days.
  router.get("/usuals", async (req, res) => {
    res.json({ usuals: await loadUsuals(deps.apiFor(uid(req)), deps.now()) });
  });

  router.post("/what-now", async (req, res) => {
    const userId = uid(req);
    const body = whatNowBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "invalid_request", detail: body.error.issues.map((i) => i.message) });
      return;
    }
    const settings = await deps.store.getAppSettings(userId);
    if (!settings || settings.onboardedAt === undefined) {
      res.status(409).json({ error: "onboarding_required" });
      return;
    }
    if (!deps.ai) {
      res.status(503).json({ error: "ai_unavailable" });
      return;
    }
    const today = await loadToday(deps.apiFor(userId), deps.now());
    const day = dayKey(new Date(deps.now()), today.timeZone);
    const budget = new TokenBudget(usageStoreOf(deps.store, deps.now), deps.ai.dailyTokenLimit);
    const left = await budget.check(userId, day);
    if (!left.allowed) {
      res.status(429).json({ error: "daily_limit", used: left.used, limit: left.limit });
      return;
    }
    const result = await whatNow({ model: deps.ai.model, modelName: deps.ai.modelName }, {
      state: { goals: settings.goals, eaten: today.eaten, minutesNow: today.clock.minutes, window: settings.window, constraints: settings.constraints },
      ...(body.data.optionsText ? { optionsText: body.data.optionsText } : {}),
      ...(body.data.image ? { images: [body.data.image] } : {}),
    });
    await budget.record(userId, day, result.usage);
    res.json(result.kind === "options" ? { kind: "options", options: result.options, basis: result.basis } : { kind: "no_ranking", reason: result.reason });
  });

  // US-01m3rvr6g951cs1s9p1czxvmhp (Log a meal in one step): one nutrition-log entry for the chosen option, written now.
  router.post("/log", async (req, res) => {
    const userId = uid(req);
    const body = logBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "invalid_request", detail: body.error.issues.map((i) => i.message) });
      return;
    }
    const settings = await deps.store.getAppSettings(userId);
    if (!settings || settings.onboardedAt === undefined) {
      res.status(409).json({ error: "onboarding_required" });
      return;
    }
    const done = await logNutrition(deps.apiFor(userId), deps.now(), body.data);
    res.json({ id: done.id, mealType: done.mealType });
  });

  // Undo: removes an entry this service wrote. Names always resolve to users/me, so nobody else's data can be reached.
  router.post("/unlog", async (req, res) => {
    const parsed = z.object({ id: z.string().min(1).max(300) }).safeParse(req.body);
    const pointId = parsed.success ? POINT_ID.exec(parsed.data.id)?.[1] : undefined;
    if (!pointId) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    await deps.apiFor(uid(req)).batchDelete("nutrition-log", [`users/me/dataTypes/nutrition-log/dataPoints/${pointId}`]);
    res.json({ ok: true });
  });

  // US-01m3rw2bqxkqp6v1hg9g02t1zr: the app's chat. The client keeps the conversation and sends it back each time.
  router.post("/chat", async (req, res) => {
    const userId = uid(req);
    const body = chatBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "invalid_request", detail: body.error.issues.map((i) => i.message) });
      return;
    }
    if (!deps.ai) {
      res.status(503).json({ error: "ai_unavailable" });
      return;
    }
    const api = deps.apiFor(userId);
    const day = dayKey(new Date(deps.now()), await timeZoneOf(api));
    const budget = new TokenBudget(usageStoreOf(deps.store, deps.now), deps.ai.dailyTokenLimit);
    const left = await budget.check(userId, day);
    if (!left.allowed) {
      res.status(429).json({ error: "daily_limit", used: left.used, limit: left.limit });
      return;
    }
    const env = makeAgentEnv({ store: deps.store, api, model: deps.ai.model, modelName: deps.ai.modelName, userId, now: deps.now });
    const result = await runAgent({ model: deps.ai.model, modelName: deps.ai.modelName }, env, {
      history: body.data.history, message: body.data.message, ...(body.data.image ? { image: body.data.image } : {}),
    });
    await budget.record(userId, day, {
      inputTokens: result.usage.inputTokens + env.extraUsage.inputTokens,
      outputTokens: result.usage.outputTokens + env.extraUsage.outputTokens,
    });
    const settings = await deps.store.getAppSettings(userId);
    res.json({ events: result.events, needsConsent: settings !== undefined && settings.consentAt === undefined, onboarded: settings?.onboardedAt !== undefined });
  });

  // The notice and the consent are the person's own tap, never the model's: this ends the setup.
  router.post("/consent", async (req, res) => {
    const userId = uid(req);
    const s = await deps.store.getAppSettings(userId);
    if (!s) {
      res.status(409).json({ error: "setup_required" });
      return;
    }
    const at = deps.now();
    await deps.store.putAppSettings({ ...s, consentAt: s.consentAt ?? at, onboardedAt: s.onboardedAt ?? at, updatedAt: at });
    res.json({ ok: true });
  });

  router.post("/logout", (_req, res) => {
    res.setHeader("set-cookie", deps.sessions.clearCookie());
    res.json({ ok: true });
  });

  return router;
}
