// The app's browser API under /api/app/*: US-01m3rvr64zrzczabckjf6crb2z (pace), US-01m3rwa0cvrtcapqk0k3h6mqvc (what to eat),
// US-01m3rw2bqxkqp6v1hg9g02t1zr (chat onboarding and settings), US-01m3rvr6g951cs1s9p1czxvmhp (log a meal), water and the history.
// Every request carries the session cookie; requests that change anything also need the custom header, as CSRF protection.
import { randomUUID } from "node:crypto";
import { Router, type Request, type RequestHandler } from "express";
import express from "express";
import { z } from "zod";
import { runAgent, type StreamEvent } from "../ai/agent.js";
import { dayKey, TokenBudget, type UsageStore } from "../ai/budget.js";
import type { AiModel } from "../ai/model.js";
import { whatNow } from "../ai/whatNow.js";
import type { HealthApi } from "../health/api.js";
import { DEFAULT_WATER_GOAL_ML, type AppSettings, type Store } from "../store/types.js";
import { fatGoal, makeAgentEnv } from "./agentEnv.js";
import { INSIGHT_RETENTION_MS } from "../mcp/retention.js";
import { Entries } from "./entries.js";
import type { Sessions } from "./session.js";

export const CSRF_HEADER = "x-health-ai";
export const TIME_ZONE_HEADER = "x-timezone";
const TOKEN_USAGE_TTL_MS = 3 * 24 * 60 * 60 * 1000;

export interface AppApiDeps {
  store: Store;
  sessions: Sessions;
  /** The person's Google Health, or undefined when they have not connected it. */
  healthFor: (userId: string) => Promise<HealthApi | undefined>;
  ai?: { model: AiModel; modelName: string; dailyTokenLimit: number };
  now: () => number;
}

const image = z.object({ mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]), dataBase64: z.string().max(7_000_000) });

const settingsBody = z.object({
  goals: z.object({
    calories: z.number().int().min(500).max(10000), carbs: z.number().int().min(0).max(1500), protein: z.number().int().min(0).max(600),
    fat: z.number().int().min(0).max(600).optional(),
    waterMl: z.number().int().min(500).max(8000).optional(),
  }),
  window: z.object({ startHour: z.number().int().min(0).max(23), endHour: z.number().int().min(1).max(24) }).refine((w) => w.endHour > w.startHour, "The window must end after it starts."),
  constraints: z.array(z.string().trim().min(1).max(60)).max(50),
  consent: z.boolean().optional(),
});

const logBody = z.object({
  name: z.string().trim().min(1).max(120),
  kcal: z.number().min(0).max(5000),
  carbs: z.number().min(0).max(1000),
  protein: z.number().min(0).max(500),
  fat: z.number().min(0).max(500).optional(),
  ingredients: z.array(z.string().max(80)).max(40).optional(),
  source: z.enum(["photo", "typed", "button", "chat"]).optional(),
});
const updateBody = z.object({
  id: z.string().min(1).max(300),
  name: z.string().trim().min(1).max(120).optional(),
  kcal: z.number().min(0).max(5000).optional(), carbs: z.number().min(0).max(1000).optional(), protein: z.number().min(0).max(500).optional(), fat: z.number().min(0).max(500).optional(),
  ingredients: z.array(z.string().max(80)).max(40).optional(),
  time: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "SNACK", "DINNER"]).optional(),
});
const waterBody = z.object({ ml: z.number().int().min(10).max(5000) });
const idsBody = z.object({ ids: z.array(z.string().min(1).max(300)).min(1).max(100) });

const chatBody = z.object({
  message: z.string().trim().min(1).max(2000),
  // BR-01m6ph6dq7aszxhxgzz4kgr8d4: a long day's conversation is not refused; the agent reads only the latest turns, so the history
  // keeps its last 40 and each earlier text its first 4,000 characters.
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(100_000).transform((x) => x.slice(0, 4000)), images: z.array(image).max(4).optional() }))
    .max(1000).default([]).transform((h) => h.slice(-40)),
  image: image.optional(),
  images: z.array(image).max(4).optional(),
  intent: z.enum(["ate", "would"]).optional(),
});

const clientErrorBody = z.object({
  stage: z.enum(["ticket", "send", "reply"]), status: z.number().int().min(0).max(599), code: z.string().regex(/^[a-z0-9_]{1,40}$/), photo: z.boolean(),
});

const whatNowBody = z.object({ optionsText: z.string().max(2000).optional(), image: image.optional() })
  .refine((b) => b.optionsText || b.image, "Give a photo or a list of options.");

const choiceBody = z.object({
  options: z.array(z.object({
    rank: z.number().int().min(0).max(20), name: z.string().trim().min(1).max(200),
    kcal: z.number().min(0).max(5000), carbs: z.number().min(0).max(1000), protein: z.number().min(0).max(1000), fat: z.number().min(0).max(1000).optional(),
  })).min(1).max(10),
  chosenRank: z.number().int().min(0).max(20).nullable(),
});

/** How long the test keeps the chat: 90 days, like the testers' feedback. */
export const CHAT_RETENTION_MS = 90 * 24 * 3600 * 1000;

const validZone = (z: string) => { try { new Intl.DateTimeFormat("en", { timeZone: z }); return true; } catch { return false; } };

/** A usage store backed by the persistent Store, so the daily limit survives restarts and instances. */
function usageStoreOf(store: Store, now: () => number): UsageStore {
  return {
    get: (userId, day) => store.getTokenUsage(userId, day),
    add: (userId, day, tokens) => store.addTokenUsage(userId, day, tokens, now() + TOKEN_USAGE_TTL_MS),
  };
}

export interface ChatReplyBody { events: unknown[]; needsConsent: boolean; onboarded: boolean; language: string | null; stopped?: boolean }
type ChatOutcome = { ok: true; reply: ChatReplyBody } | { ok: false; status: number; body: Record<string, unknown> };

/** One turn of the app's chat, whole or streamed: checks, the agent, the stored conversation and the day's budget. */
async function runChat(deps: AppApiDeps, userId: string, raw: unknown, opts: { emit?: (e: StreamEvent) => void; signal?: AbortSignal } = {}): Promise<ChatOutcome> {
  const body = chatBody.safeParse(raw);
  if (!body.success) return { ok: false, status: 400, body: { error: "invalid_request", detail: body.error.issues.map((i) => i.message) } };
  if (!deps.ai) return { ok: false, status: 503, body: { error: "ai_unavailable" } };
  const entries = new Entries({ store: deps.store, userId, now: deps.now, health: await deps.healthFor(userId) });
  const dk = dayKey(new Date(deps.now()), await entries.timeZone());
  const budget = new TokenBudget(usageStoreOf(deps.store, deps.now), deps.ai.dailyTokenLimit);
  const left = await budget.check(userId, dk);
  if (!left.allowed) return { ok: false, status: 429, body: { error: "daily_limit", used: left.used, limit: left.limit } };
  const env = makeAgentEnv({ store: deps.store, entries, model: deps.ai.model, modelName: deps.ai.modelName, userId, now: deps.now });
  const result = await runAgent({ model: deps.ai.model, modelName: deps.ai.modelName }, env, {
    history: body.data.history, message: body.data.message, images: [...(body.data.images ?? []), ...(body.data.image ? [body.data.image] : [])],
    ...(body.data.intent ? { intent: body.data.intent } : {}),
    ...(opts.emit ? { emit: opts.emit } : {}), ...(opts.signal ? { signal: opts.signal } : {}),
  });
  // BR "The chat is kept during the test": the person's message and the assistant's answer are stored (text and events, never the
  // photos), expire after the retention period, and go with the person's data when they delete it. A failed save never fails the chat.
  try {
    const at = deps.now();
    const nImages = (body.data.images?.length ?? 0) + (body.data.image ? 1 : 0);
    const expireAt = at + CHAT_RETENTION_MS;
    await deps.store.putChat({ id: `${at}-1u`, userId, at, role: "user", text: body.data.message, ...(nImages ? { images: nImages } : {}), expireAt });
    await deps.store.putChat({ id: `${at}-2a`, userId, at: at + 1, role: "assistant", events: result.events, usage: result.usage, expireAt });
  } catch { /* the chat itself went through */ }
  await budget.record(userId, dk, {
    inputTokens: result.usage.inputTokens + env.extraUsage.inputTokens,
    outputTokens: result.usage.outputTokens + env.extraUsage.outputTokens,
  });
  const settings = await deps.store.getAppSettings(userId);
  const prefs = await deps.store.getAppPrefs(userId);
  return { ok: true, reply: { events: result.events, needsConsent: settings !== undefined && settings.consentAt === undefined, onboarded: settings?.onboardedAt !== undefined, language: prefs?.language ?? null, ...(result.stopped ? { stopped: true } : {}) } };
}

/**
 * BR-01m6pmf9avbbgd373z1jcvvaqw (A reply arrives as it is written, with its steps): the chat, streamed as one JSON object a line,
 * at the service's own address (Firebase Hosting holds a stream back until it ends). It takes the ticket from /chat/ticket, allows
 * only the app's own origin, and stops the reply when the app closes the connection (Stop).
 */
export function chatStreamRouter(deps: AppApiDeps & { allowedOrigin: string }): Router {
  const router = Router();
  router.use((req, res, next) => {
    if (req.headers.origin === deps.allowedOrigin) {
      res.set({ "access-control-allow-origin": deps.allowedOrigin, vary: "origin", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "POST", "access-control-max-age": "600" });
    }
    if (req.method === "OPTIONS") { res.status(204).end(); return; }
    next();
  });
  router.use(express.json({ limit: "8mb" }));
  router.post("/chat", async (req, res) => {
    const auth = req.headers.authorization ?? "";
    const userId = auth.startsWith("Bearer ") ? await deps.sessions.verifyTicket(auth.slice(7)) : undefined;
    if (!userId) { res.status(401).json({ error: "not_signed_in" }); return; }
    const ctl = new AbortController();
    res.on("close", () => { if (!res.writableEnded) ctl.abort(); });
    res.status(200).set({ "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-cache, no-transform", "x-accel-buffering": "no" });
    res.flushHeaders();
    const line = (o: unknown) => { if (!res.writableEnded) res.write(`${JSON.stringify(o)}\n`); };
    try {
      const r = await runChat(deps, userId, req.body, { emit: line, signal: ctl.signal });
      line(r.ok ? { type: "done", reply: r.reply } : { type: "error", status: r.status, ...r.body });
    } catch {
      line({ type: "error", status: 500, error: "failed" });
    }
    res.end();
  });
  return router;
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
    // The phone tells its time zone: the day, the pace and the meal type are read in it, with or without Google Health.
    const tz = req.headers[TIME_ZONE_HEADER];
    if (typeof tz === "string" && tz.length < 64 && validZone(tz)) {
      const prefs = await deps.store.getAppPrefs(userId);
      if (prefs?.timeZone !== tz) await deps.store.putAppPrefs({ ...prefs, userId, timeZone: tz, updatedAt: deps.now() });
    }
    next();
  };
  router.use(session);

  const uid = (req: Request) => String((req.res as { locals: Record<string, unknown> }).locals["userId"]);
  const entriesOf = async (userId: string) => new Entries({ store: deps.store, userId, now: deps.now, health: await deps.healthFor(userId) });
  const onboarded = async (userId: string) => {
    const s = await deps.store.getAppSettings(userId);
    return s && s.onboardedAt !== undefined ? s : undefined;
  };

  router.get("/me", async (req, res) => {
    const user = await deps.store.getUser(uid(req));
    if (!user) {
      res.status(401).json({ error: "not_signed_in" });
      return;
    }
    const settings = await deps.store.getAppSettings(user.id);
    const prefs = await deps.store.getAppPrefs(user.id);
    res.json({ email: user.email, onboarded: settings?.onboardedAt !== undefined, language: prefs?.language ?? null, healthConnected: (await deps.healthFor(user.id)) !== undefined });
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
    const { waterMl, fat, ...macros } = parsed.data.goals;
    const next: AppSettings = {
      userId,
      goals: { ...macros, ...(fat !== undefined ? { fat } : {}), ...(waterMl !== undefined ? { waterMl } : {}) },
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
    const day = await (await entriesOf(userId)).day();
    res.json({
      goals: { ...settings.goals, fat: settings.goals.fat ?? fatGoal(settings.goals.calories) }, window: settings.window, constraints: settings.constraints, eaten: day.eaten,
      water: { ml: day.waterMl, goalMl: settings.goals.waterMl ?? DEFAULT_WATER_GOAL_ML },
      date: day.clock.date, minutes: day.clock.minutes, timeZone: day.timeZone,
    });
  });

  // US-01m3rwa0cvrtcapqk0k3h6mqvc: three ranked options from a photo or a typed list.
  router.post("/what-now", async (req, res) => {
    const userId = uid(req);
    const body = whatNowBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "invalid_request", detail: body.error.issues.map((i) => i.message) });
      return;
    }
    const settings = await onboarded(userId);
    if (!settings) {
      res.status(409).json({ error: "onboarding_required" });
      return;
    }
    if (!deps.ai) {
      res.status(503).json({ error: "ai_unavailable" });
      return;
    }
    const entries = await entriesOf(userId);
    const day = await entries.day();
    const budget = new TokenBudget(usageStoreOf(deps.store, deps.now), deps.ai.dailyTokenLimit);
    const dk = dayKey(new Date(deps.now()), day.timeZone);
    const left = await budget.check(userId, dk);
    if (!left.allowed) {
      res.status(429).json({ error: "daily_limit", used: left.used, limit: left.limit });
      return;
    }
    const result = await whatNow({ model: deps.ai.model, modelName: deps.ai.modelName }, {
      state: { goals: settings.goals, eaten: day.eaten, minutesNow: day.clock.minutes, window: settings.window, constraints: settings.constraints },
      ...(body.data.optionsText ? { optionsText: body.data.optionsText } : {}),
      ...(body.data.image ? { images: [body.data.image] } : {}),
    });
    await budget.record(userId, dk, result.usage);
    res.json(result.kind === "options" ? { kind: "options", options: result.options, basis: result.basis } : { kind: "no_ranking", reason: result.reason });
  });

  // US-01m3rvr6g951cs1s9p1czxvmhp: one entry for the chosen option, written now, ours first and mirrored to Google Health when connected.
  router.post("/log", async (req, res) => {
    const userId = uid(req);
    const body = logBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "invalid_request", detail: body.error.issues.map((i) => i.message) });
      return;
    }
    if (!(await onboarded(userId))) {
      res.status(409).json({ error: "onboarding_required" });
      return;
    }
    const { ingredients, ...rest } = body.data;
    const done = await (await entriesOf(userId)).logMeal({ ...rest, ...(ingredients ? { ingredients } : {}), source: body.data.source ?? "button" });
    res.json({ id: done.id, mealType: done.mealType });
  });

  // US-01m3rvr6p4vj42j4atck7vyw08: a drink, from a button.
  router.post("/water", async (req, res) => {
    const userId = uid(req);
    const body = waterBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "invalid_request", detail: body.error.issues.map((i) => i.message) });
      return;
    }
    if (!(await onboarded(userId))) {
      res.status(409).json({ error: "onboarding_required" });
      return;
    }
    res.json(await (await entriesOf(userId)).logWater(body.data.ml));
  });

  // Everything logged today, oldest first, for the thread of the home.
  router.get("/entries/today", async (req, res) => {
    res.json({ entries: await (await entriesOf(uid(req))).today() });
  });

  // Corrects a logged meal in place (the card's Edit; the chat does the same with its update_entry tool).
  router.post("/entries/update", async (req, res) => {
    const parsed = updateBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request", detail: parsed.error.issues.map((i) => i.message) });
      return;
    }
    const { id, ...patch } = parsed.data;
    const done = await (await entriesOf(uid(req))).update(id, patch);
    if (!done) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ entry: done });
  });

  // The foods and drinks logged most often, as one-tap buttons.
  router.get("/usuals", async (req, res) => {
    res.json({ usuals: await (await entriesOf(uid(req))).usuals() });
  });

  // Undo of the last log: removes our entry and its Google Health copy.
  router.post("/unlog", async (req, res) => {
    const parsed = z.object({ id: z.string().min(1).max(300) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    await (await entriesOf(uid(req))).remove([parsed.data.id]);
    res.json({ ok: true });
  });

  // BR "Meals and water kept by the service belong to the person": the person deletes their history, after their own tap on a
  // confirmation card in the app; the chat only proposes it.
  router.post("/entries/delete", async (req, res) => {
    const parsed = idsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    res.json({ deleted: await (await entriesOf(uid(req))).remove(parsed.data.ids) });
  });
  router.post("/entries/delete-all", async (req, res) => {
    const userId = uid(req);
    const deleted = await (await entriesOf(userId)).removeAll();
    await deps.store.deleteAllChat(userId);
    await deps.store.deleteAllChoices(userId);
    res.json({ deleted });
  });

  // US-01m3s789qmvs4jx8e93nb2j61n (Record what was suggested and what was chosen): the app sends what the sheet showed and which
  // option was logged (null when it was closed without one). Kept as long as the chat, deleted with the whole history.
  router.post("/choice", async (req, res) => {
    const userId = uid(req);
    const body = choiceBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "invalid_request", detail: body.error.issues.map((i) => i.message) });
      return;
    }
    const at = deps.now();
    const options = [...body.data.options].sort((a, b) => a.rank - b.rank).map(({ fat, ...o }) => (fat === undefined ? o : { ...o, fat }));
    const { chosenRank } = body.data;
    await deps.store.putChoice({
      id: randomUUID(), userId, at, options, chosenRank,
      followed: chosenRank !== null && options.some((o) => o.rank === chosenRank), expireAt: at + CHAT_RETENTION_MS,
    });
    res.json({ ok: true });
  });

  // US-01m3rw2bqxkqp6v1hg9g02t1zr: the app's chat. The client keeps the conversation and sends it back each time.
  router.post("/chat", async (req, res) => {
    const r = await runChat(deps, uid(req), req.body);
    if (r.ok) res.json(r.reply); else res.status(r.status).json(r.body);
  });

  // BR-01m6pmf9avbbgd373z1jcvvaqw: the ticket for one streamed reply (the stream itself is chatStreamRouter, at the service's address).
  router.post("/chat/ticket", async (req, res) => {
    res.json({ ticket: await deps.sessions.ticket(uid(req)) });
  });

  // The conversation so far, so that reopening the app (or another device) shows it again.
  router.get("/chat/history", async (req, res) => {
    const limit = Math.min(200, Math.max(1, Number(req.query["limit"]) || 60));
    const records = await deps.store.listChat(uid(req), limit);
    res.json({ turns: records.map((r) => ({ role: r.role, at: r.at, ...(r.text !== undefined ? { text: r.text } : {}), ...(r.images ? { images: r.images } : {}), ...(r.events ? { events: r.events } : {}) })) });
  });

  // BR-01m6rhz5t5b2p9n35twmgv4bkn (A failed message says why, and the owner can read the failure): the app records a failed send
  // for the owner, with its step, status, code and whether photos were attached; never the text or the photos. It is kept as
  // feedback from the app, for 90 days, and read with list_feedback (EX-01m6rhz632532q600eazqvxsfe).
  router.post("/client-error", async (req, res) => {
    const body = clientErrorBody.safeParse(req.body);
    if (!body.success) { res.status(400).json({ error: "invalid_request" }); return; }
    const at = deps.now();
    const { stage, status, code, photo } = body.data;
    await deps.store.putFeedback({
      id: randomUUID(), userId: uid(req), source: "app", kind: "bug", tools: ["chat"],
      message: `send failed · step ${stage} · status ${status} · code ${code} · ${photo ? "with photo" : "no photo"}`,
      createdAt: at, expireAt: at + INSIGHT_RETENTION_MS,
    });
    res.json({ ok: true });
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
