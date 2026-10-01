// US-01m3rvr64zrzczabckjf6crb2z (pace), US-01m3rwa0cvrtcapqk0k3h6mqvc (what to eat), US-01m3rw2bqxkqp6v1hg9g02t1zr (chat onboarding and settings).
import { describe, expect, it } from "vitest";
import type { AiModel, ConverseResponse } from "../../src/ai/model.js";
import { addDays, dayBounds, localClock, nextDate, sumHydration, sumNutrition } from "../../src/app-api/today.js";
import { makeTestApp, READ_SCOPES, type TestApp } from "../helpers.js";

const NOW = Date.parse("2026-09-30T12:20:00Z"); // 14:20 in Budapest (UTC+2)
const HEADER = { "x-health-ai": "1" } as const;

async function appSignIn(t: TestApp, code = "g-app", over: Parameters<TestApp["google"]["account"]>[1] = { sub: "sub-tester", email: "tester@example.com", refreshToken: "google-refresh-tester" }) {
  t.google.account(code, over);
  const start = await t.http.get("/api/auth/start");
  const state = new URL(String(start.headers["location"])).searchParams.get("state");
  const cb = await t.http.get("/oauth/google/callback").query({ code, state });
  return { start, cb, cookie: String(cb.headers["set-cookie"]?.[0] ?? "").split(";")[0] ?? "" };
}

const settings = {
  goals: { calories: 1900, carbs: 230, protein: 110 },
  window: { startHour: 7, endHour: 22 },
  constraints: ["nuts"],
  consent: true,
};

function healthHandler(t: TestApp) {
  t.health.handler = ({ url }) => {
    if (url.pathname.endsWith("/settings")) return { json: { timeZone: "Europe/Budapest" } };
    return { json: { dataPoints: [
      { nutritionLog: { energy: { kcal: 95 }, totalCarbohydrate: { grams: 10 }, nutrients: [{ nutrient: "PROTEIN", quantity: { grams: 3 } }] } },
      { nutritionLog: { energy: { kcal: 310 }, totalCarbohydrate: { grams: 40 }, nutrients: [{ nutrient: "PROTEIN", quantity: { grams: 12 } }, { nutrient: "DIETARY_FIBER", quantity: { grams: 5 } }] } },
    ] } };
  };
}

const option = { name: "Chicken with rice", category: "grain", kcal: 560, carbs: 62, protein: 38, ingredients: ["chicken", "rice"], reason: "Closes most of the carb gap." };
function fakeModel(answer: unknown = { options: [option] }): AiModel & { calls: number } {
  const m = {
    calls: 0,
    callTool: () => { m.calls++; return Promise.resolve({ toolInput: answer, usage: { inputTokens: 1000, outputTokens: 500 } }); },
    converse: () => Promise.reject(new Error("not used in this test")),
  };
  return m;
}

describe("the app's sign-in", () => {
  it("goes to Google and comes back with an HttpOnly __session cookie, then to the app", async () => {
    const t = makeTestApp({ now: () => NOW });
    const { start, cb } = await appSignIn(t);
    expect(start.status).toBe(302);
    expect(String(start.headers["location"])).toContain("accounts.google.test");
    expect(cb.status).toBe(302);
    expect(cb.headers["location"]).toBe("/");
    const cookie = String(cb.headers["set-cookie"]?.[0]);
    expect(cookie).toMatch(/^__session=.+; Path=\/; HttpOnly; SameSite=Strict/);
  });

  it("gives no session to an account that is not invited", async () => {
    const t = makeTestApp({ now: () => NOW });
    const { cb } = await appSignIn(t, "g-other", { sub: "sub-other", email: "stranger@example.com", refreshToken: "rt" });
    expect(cb.status).toBe(403);
    expect(cb.headers["set-cookie"]).toBeUndefined();
  });

  it("refuses the API without a valid session cookie", async () => {
    const t = makeTestApp({ now: () => NOW });
    expect((await t.http.get("/api/app/me")).status).toBe(401);
    expect((await t.http.get("/api/app/me").set("cookie", "__session=not-a-token")).status).toBe(401);
  });
});

describe("settings and state", () => {
  it("needs the custom header to change anything, and checks the values", async () => {
    const t = makeTestApp({ now: () => NOW });
    const { cookie } = await appSignIn(t);
    expect((await t.http.put("/api/app/settings").set("cookie", cookie).send(settings)).status).toBe(403);
    const bad = await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send({ ...settings, window: { startHour: 22, endHour: 7 } });
    expect(bad.status).toBe(400);
  });

  it("onboards on the first save with consent, keeps the consent time on later saves", async () => {
    const t = makeTestApp({ now: () => NOW });
    const { cookie } = await appSignIn(t);
    expect((await t.http.get("/api/app/me").set("cookie", cookie)).body).toEqual({ email: "tester@example.com", onboarded: false, language: null, healthConnected: true });
    const saved = await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    expect(saved.status).toBe(200);
    expect(saved.body.settings.onboardedAt).toBe(NOW);
    expect((await t.http.get("/api/app/me").set("cookie", cookie)).body.onboarded).toBe(true);
    const again = await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send({ ...settings, constraints: ["nuts", "fish"] });
    expect(again.body.settings).toMatchObject({ onboardedAt: NOW, consentAt: NOW, constraints: ["nuts", "fish"] });
  });

  it("reports today's totals from the log, in the user's time zone, after onboarding", async () => {
    const t = makeTestApp({ now: () => NOW });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    expect((await t.http.get("/api/app/state").set("cookie", cookie)).status).toBe(409);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    const r = await t.http.get("/api/app/state").set("cookie", cookie);
    expect(r.body).toMatchObject({ eaten: { calories: 405, carbs: 50, protein: 15 }, date: "2026-09-30", minutes: 14 * 60 + 20, timeZone: "Europe/Budapest" });
    const list = t.health.requests.find((q) => q.url.pathname.endsWith("/nutrition-log/dataPoints"));
    const filter = list?.url.searchParams.get("filter") ?? "";
    expect(filter).toContain("2026-09-30");
    expect(filter).toContain("2026-10-01");
  });
});

describe("what-now", () => {
  async function ready(ai?: Parameters<typeof makeTestApp>[0] extends infer O ? (O extends { ai?: infer A } ? A : never) : never) {
    const t = makeTestApp({ now: () => NOW, ...(ai ? { ai } : {}) });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    return { t, cookie };
  }
  const ask = (t: TestApp, cookie: string, body: unknown) => t.http.post("/api/app/what-now").set("cookie", cookie).set(HEADER).send(body as object);

  it("asks for onboarding first", async () => {
    const { t, cookie } = await ready({ model: fakeModel(), modelName: "m", dailyTokenLimit: 100000 });
    expect((await ask(t, cookie, { optionsText: "fridge" })).status).toBe(409);
  });

  it("says suggestions are unavailable when no model is configured", async () => {
    const { t, cookie } = await ready();
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    expect((await ask(t, cookie, { optionsText: "fridge" })).status).toBe(503);
  });

  it("answers with ranked options and counts the tokens from the response", async () => {
    const model = fakeModel();
    const { t, cookie } = await ready({ model, modelName: "m", dailyTokenLimit: 100000 });
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    const r = await ask(t, cookie, { optionsText: "chicken, rice" });
    expect(r.status).toBe(200);
    expect(r.body.kind).toBe("options");
    expect(r.body.options[0]).toMatchObject({ rank: 1, name: "Chicken with rice" });
    expect(await t.store.getTokenUsage("sub-tester", "2026-09-30")).toBe(1500);
  });

  it("stops at the daily token limit with a clear answer and no model call", async () => {
    const model = fakeModel();
    const { t, cookie } = await ready({ model, modelName: "m", dailyTokenLimit: 1500 });
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    expect((await ask(t, cookie, { optionsText: "a" })).status).toBe(200);
    const blocked = await ask(t, cookie, { optionsText: "b" });
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: "daily_limit", used: 1500, limit: 1500 });
    expect(model.calls).toBe(1);
  });

  it("rejects an empty request and an unsupported image type", async () => {
    const { t, cookie } = await ready({ model: fakeModel(), modelName: "m", dailyTokenLimit: 100000 });
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    expect((await ask(t, cookie, {})).status).toBe(400);
    expect((await ask(t, cookie, { image: { mediaType: "image/gif", dataBase64: "AAAA" } })).status).toBe(400);
  });
});

function agentModel(...replies: ConverseResponse[]): AiModel & { converseCalls: number } {
  const m = {
    converseCalls: 0,
    callTool: () => Promise.resolve({ toolInput: { options: [option] }, usage: { inputTokens: 1000, outputTokens: 500 } }),
    converse: () => Promise.resolve(replies[Math.min(m.converseCalls++, replies.length - 1)]!),
  };
  return m;
}
const reply = (text: string): ConverseResponse => ({ content: [{ type: "text", text }], stopReason: "end_turn", usage: { inputTokens: 200, outputTokens: 40 } });
const toolCall = (name: string, input: unknown): ConverseResponse => ({ content: [{ type: "tool_use", id: `t-${name}`, name, input }], stopReason: "tool_use", usage: { inputTokens: 200, outputTokens: 40 } });

describe("the chat", () => {
  const talk = (t: TestApp, cookie: string, body: unknown) => t.http.post("/api/app/chat").set("cookie", cookie).set(HEADER).send(body as object);

  it("needs a session and a model, and refuses an empty message", async () => {
    const t = makeTestApp({ now: () => NOW });
    healthHandler(t);
    expect((await t.http.post("/api/app/chat").set(HEADER).send({ message: "hi" })).status).toBe(401);
    const { cookie } = await appSignIn(t);
    expect((await talk(t, cookie, { message: "hi" })).status).toBe(503);
    const t2 = makeTestApp({ now: () => NOW, ai: { model: agentModel(reply("x")), modelName: "m", dailyTokenLimit: 100000 } });
    healthHandler(t2);
    const s2 = await appSignIn(t2);
    expect((await talk(t2, s2.cookie, { message: "  " })).status).toBe(400);
  });

  it("sets the person up in conversation, then waits for their own consent tap", async () => {
    const model = agentModel(toolCall("save_settings", { calories: 2140, window: { startHour: 7, endHour: 22 }, constraints: ["nuts"] }), reply("Elmentettem. Koppints az Elfogadomra."));
    const t = makeTestApp({ now: () => NOW, ai: { model, modelName: "m", dailyTokenLimit: 100000 } });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    const r = await talk(t, cookie, { message: "igen, 2140, 7-22, nincs mogyoró", history: [{ role: "assistant", text: "Jó így?" }] });
    expect(r.status).toBe(200);
    expect(r.body.events.map((e: { type: string }) => e.type)).toEqual(["settings_saved", "text"]);
    expect(r.body).toMatchObject({ needsConsent: true, onboarded: false });
    const saved = await t.store.getAppSettings("sub-tester");
    expect(saved).toMatchObject({ goals: { calories: 2140, carbs: 268, protein: 134 }, window: { startHour: 7, endHour: 22 }, constraints: ["nuts"] });
    expect(saved?.consentAt).toBeUndefined();

    const done = await t.http.post("/api/app/consent").set("cookie", cookie).set(HEADER).send({});
    expect(done.status).toBe(200);
    expect((await t.http.get("/api/app/me").set("cookie", cookie)).body.onboarded).toBe(true);
    // 200+40 per model turn, two turns
    expect(await t.store.getTokenUsage("sub-tester", "2026-09-30")).toBe(480);
  });

  it("saves the language the person starts in, before any setup, and tells the app", async () => {
    const model = agentModel(toolCall("set_language", { language: "hu" }), reply("Szia! Van valami, amit nem ehetsz?"));
    const t = makeTestApp({ now: () => NOW, ai: { model, modelName: "m", dailyTokenLimit: 100000 } });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    expect((await t.http.get("/api/app/me").set("cookie", cookie)).body.language).toBeNull();
    const r = await talk(t, cookie, { message: "Szia, éhes vagyok" });
    expect(r.body.language).toBe("hu");
    expect(r.body.events[0]).toEqual({ type: "language", language: "hu" });
    expect((await t.http.get("/api/app/me").set("cookie", cookie)).body).toMatchObject({ language: "hu", onboarded: false });
  });

  it("counts the tokens of the suggestion call inside the chat turn too", async () => {
    const model = agentModel(toolCall("suggest_options", { optionsText: "rice" }), reply("Szénhidrátból vagy le."));
    const t = makeTestApp({ now: () => NOW, ai: { model, modelName: "m", dailyTokenLimit: 100000 } });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    const r = await talk(t, cookie, { message: "mit egyek? rizs" });
    expect(r.body.events.map((e: { type: string }) => e.type)).toEqual(["options", "text"]);
    expect(await t.store.getTokenUsage("sub-tester", "2026-09-30")).toBe(480 + 1500);
  });

  it("stops at the daily limit, and consent needs settings first", async () => {
    const model = agentModel(reply("x"));
    const t = makeTestApp({ now: () => NOW, ai: { model, modelName: "m", dailyTokenLimit: 240 } });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    expect((await t.http.post("/api/app/consent").set("cookie", cookie).set(HEADER).send({})).status).toBe(409);
    expect((await talk(t, cookie, { message: "a" })).status).toBe(200);
    expect((await talk(t, cookie, { message: "b" })).status).toBe(429);
  });
});

describe("log and undo", () => {
  async function onboarded() {
    const t = makeTestApp({ now: () => NOW });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    return { t, cookie };
  }

  it("keeps the entry in our own storage first and mirrors it to Google Health, in the person's offset", async () => {
    const { t, cookie } = await onboarded();
    t.health.handler = ({ url, body }) => url.pathname.endsWith("/settings")
      ? { json: { timeZone: "Europe/Budapest" } }
      : { json: { name: "operations/1", done: true, response: { ...(body as object), name: "users/9/dataTypes/nutrition-log/dataPoints/777" } } };
    const r = await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).send({ name: "Chicken with rice", kcal: 560, carbs: 62, protein: 38, ingredients: ["chicken", "rice"], source: "photo" });
    expect(r.body.mealType).toBe("LUNCH");
    const own = await t.store.getEntry("sub-tester", r.body.id);
    expect(own).toMatchObject({ kind: "meal", name: "Chicken with rice", kcal: 560, ingredients: ["chicken", "rice"], source: "photo", estimate: true, googleName: "users/9/dataTypes/nutrition-log/dataPoints/777", at: NOW });
    const write = t.health.requests.find((q) => q.method === "POST" && q.url.pathname.endsWith("/nutrition-log/dataPoints"));
    expect((write?.body as { nutritionLog: unknown }).nutritionLog).toMatchObject({
      foodDisplayName: "Chicken with rice", mealType: "LUNCH", energy: { kcal: 560 }, totalCarbohydrate: { grams: 62 },
      nutrients: [{ nutrient: "PROTEIN", quantity: { grams: 38 } }],
      interval: { startUtcOffset: "7200s", endUtcOffset: "7200s" },
    });
  });

  it("undo removes our entry and its Google Health copy, and an old Google name still works, always under users/me", async () => {
    const { t, cookie } = await onboarded();
    t.health.handler = ({ url, body }) => url.pathname.endsWith("/settings")
      ? { json: { timeZone: "Europe/Budapest" } }
      : { json: { name: "operations/1", done: true, response: { ...(body as object), name: "users/9/dataTypes/nutrition-log/dataPoints/777" } } };
    const r = await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).send({ name: "Apple", kcal: 95, carbs: 25, protein: 0 });
    await t.http.post("/api/app/unlog").set("cookie", cookie).set(HEADER).send({ id: r.body.id });
    expect(await t.store.getEntry("sub-tester", r.body.id)).toBeUndefined();
    expect(t.health.last().url.pathname).toBe("/v4/users/me/dataTypes/nutrition-log/dataPoints:batchDelete");
    expect(t.health.last().body).toEqual({ names: ["users/me/dataTypes/nutrition-log/dataPoints/777"] });
    await t.http.post("/api/app/unlog").set("cookie", cookie).set(HEADER).send({ id: "users/123/dataTypes/nutrition-log/dataPoints/888" });
    expect(t.health.last().body).toEqual({ names: ["users/me/dataTypes/nutrition-log/dataPoints/888"] });
  });

  it("needs onboarding and valid numbers", async () => {
    const t = makeTestApp({ now: () => NOW });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    expect((await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).send({ name: "x", kcal: 1, carbs: 1, protein: 1 })).status).toBe(409);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    expect((await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).send({ name: "x", kcal: -5, carbs: 1, protein: 1 })).status).toBe(400);
  });
});

describe("water", () => {
  async function ready() {
    const t = makeTestApp({ now: () => NOW });
    t.health.handler = ({ url, body }) => url.pathname.endsWith("/settings")
      ? { json: { timeZone: "Europe/Budapest" } }
      : url.pathname.endsWith("/hydration-log/dataPoints") && url.search === ""
        ? { json: { name: "operations/2", done: true, response: { ...(body as object), name: "users/9/dataTypes/hydration-log/dataPoints/55" } } }
        : { json: { dataPoints: [] } };
    const { cookie } = await appSignIn(t);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send({ ...settings, goals: { ...settings.goals, waterMl: 2000 } });
    return { t, cookie };
  }

  it("logs water as our own entry, mirrors it to the hydration log, and moves the water on the state", async () => {
    const { t, cookie } = await ready();
    const r = await t.http.post("/api/app/water").set("cookie", cookie).set(HEADER).send({ ml: 250 });
    expect(r.status).toBe(200);
    expect(await t.store.getEntry("sub-tester", r.body.id)).toMatchObject({ kind: "water", ml: 250, googleName: "users/9/dataTypes/hydration-log/dataPoints/55" });
    const write = t.health.requests.find((q) => q.method === "POST" && q.url.pathname.endsWith("/hydration-log/dataPoints"));
    expect((write?.body as { hydrationLog: unknown }).hydrationLog).toMatchObject({ amountConsumed: { milliliters: 250 }, interval: { startUtcOffset: "7200s" } });
    await t.http.post("/api/app/water").set("cookie", cookie).set(HEADER).send({ ml: 400 });
    const state = await t.http.get("/api/app/state").set("cookie", cookie);
    expect(state.body.water).toEqual({ ml: 650, goalMl: 2000 });
  });

  it("uses the default goal until one is set, and refuses silly amounts", async () => {
    const t = makeTestApp({ now: () => NOW });
    healthHandler(t);
    const { cookie } = await appSignIn(t);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    expect((await t.http.get("/api/app/state").set("cookie", cookie)).body.water.goalMl).toBe(2000);
    expect((await t.http.post("/api/app/water").set("cookie", cookie).set(HEADER).send({ ml: 0 })).status).toBe(400);
    expect((await t.http.post("/api/app/water").set("cookie", cookie).set(HEADER).send({ ml: 99999 })).status).toBe(400);
  });

  it("the water buttons come from the history: none at the start, a drink after the first one", async () => {
    const { t, cookie } = await ready();
    expect((await t.http.get("/api/app/usuals").set("cookie", cookie)).body.usuals).toEqual([]);
    await t.http.post("/api/app/water").set("cookie", cookie).set(HEADER).send({ ml: 250 });
    expect((await t.http.get("/api/app/usuals").set("cookie", cookie)).body.usuals).toEqual([{ kind: "water", name: "250 ml", ml: 250, kcal: 0, carbs: 0, protein: 0, count: 1 }]);
  });
});

describe("the usuals", () => {
  const meal = (name: string, kcal: number) => ({ name: `users/9/dataTypes/nutrition-log/dataPoints/${name}-${kcal}`, nutritionLog: { foodDisplayName: name, energy: { kcal }, totalCarbohydrate: { grams: 10 }, nutrients: [{ nutrient: "PROTEIN", quantity: { grams: 2 } }] } });

  it("ranks meals by how often they were logged: at least twice, merged by name, from our entries and Google's older ones", async () => {
    const t = makeTestApp({ now: () => NOW });
    t.health.handler = ({ url }) => url.pathname.endsWith("/settings") ? { json: { timeZone: "Europe/Budapest" } }
      : { json: { dataPoints: [meal("Cappuccino", 90), meal("cappuccino", 100), meal("Oat bran", 300), meal("Once", 50)] } };
    const { cookie } = await appSignIn(t);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).send({ name: "Oat bran", kcal: 320, carbs: 40, protein: 12 });
    const u = (await t.http.get("/api/app/usuals").set("cookie", cookie)).body.usuals as { name: string; count: number; kcal: number }[];
    expect(u.map((x) => [x.name, x.count])).toEqual([["Cappuccino", 2], ["Oat bran", 2]]);
    expect(u[0]!.kcal).toBe(95);
    const filter = t.health.requests.find((q) => q.url.pathname.endsWith("/nutrition-log/dataPoints") && q.method === "GET")?.url.searchParams.get("filter") ?? "";
    expect(filter).toContain("2026-08-31");
  });

  it("answers 401 without a session", async () => {
    const t = makeTestApp({ now: () => NOW });
    expect((await t.http.get("/api/app/usuals")).status).toBe(401);
  });
});

describe("today's totals", () => {
  it("sums calories, carbs and protein over the log entries", () => {
    expect(sumNutrition([{ nutritionLog: { energy: { kcal: 95.4 }, totalCarbohydrate: { grams: 10 }, nutrients: [{ nutrient: "PROTEIN", quantity: { grams: 3 } }] } }, {}, null])).toEqual({ calories: 95, carbs: 10, protein: 3 });
  });
  it("reads the clock and the date in the time zone, and steps a date", () => {
    expect(localClock(Date.parse("2026-09-30T23:30:00Z"), "Europe/Budapest")).toEqual({ date: "2026-10-01", minutes: 90 });
    expect(nextDate("2026-09-30")).toBe("2026-10-01");
    expect(nextDate("2026-12-31")).toBe("2027-01-01");
    expect(addDays("2026-09-30", -30)).toBe("2026-08-31");
  });
});


describe("our own storage, with and without Google Health", () => {
  const meal = (id: string, name: string, kcal: number) => ({ name: `users/9/dataTypes/nutrition-log/dataPoints/${id}`, nutritionLog: { foodDisplayName: name, energy: { kcal }, totalCarbohydrate: { grams: 10 }, nutrients: [] } });

  /** A person who signed in with Google and did not grant Google Health: no refresh token, identity scopes only. */
  async function noHealth(t: TestApp) {
    t.google.codes.set("g-plain", { sub: "sub-plain", email: "tester@example.com", accessToken: "at", expiresIn: 3600, grantedScopes: ["openid", "email"] });
    const start = await t.http.get("/api/auth/start");
    const state = new URL(String(start.headers["location"])).searchParams.get("state");
    const cb = await t.http.get("/oauth/google/callback").query({ code: "g-plain", state });
    return { cb, cookie: String(cb.headers["set-cookie"]?.[0] ?? "").split(";")[0] ?? "" };
  }

  it("works without Google Health: signs in, logs a meal and water, counts them, and never calls Google Health", async () => {
    const t = makeTestApp({ now: () => NOW });
    const { cb, cookie } = await noHealth(t);
    expect(cb.status).toBe(302);
    expect((await t.http.get("/api/app/me").set("cookie", cookie)).body).toMatchObject({ healthConnected: false });
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).set("x-timezone", "Europe/Budapest").send({ name: "Lunch", kcal: 500, carbs: 60, protein: 30 });
    await t.http.post("/api/app/water").set("cookie", cookie).set(HEADER).send({ ml: 500 });
    const state = await t.http.get("/api/app/state").set("cookie", cookie).set("x-timezone", "Europe/Budapest");
    expect(state.body).toMatchObject({ eaten: { calories: 500, carbs: 60, protein: 30 }, water: { ml: 500 }, timeZone: "Europe/Budapest", minutes: 14 * 60 + 20 });
    expect(t.health.requests).toHaveLength(0);
  });

  it("reads the day in the phone's time zone, and ignores a time zone that does not exist", async () => {
    const t = makeTestApp({ now: () => NOW });
    const { cookie } = await noHealth(t);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    const ny = await t.http.get("/api/app/state").set("cookie", cookie).set("x-timezone", "America/New_York");
    expect(ny.body).toMatchObject({ timeZone: "America/New_York", minutes: 8 * 60 + 20 });
    const bad = await t.http.get("/api/app/state").set("cookie", cookie).set("x-timezone", "Not/AZone");
    expect(bad.body.timeZone).toBe("America/New_York");
    expect((await t.store.getAppPrefs("sub-plain"))?.timeZone).toBe("America/New_York");
  });

  it("counts an entry once when Google Health holds its copy, and adds what other writers logged there", async () => {
    const t = makeTestApp({ now: () => NOW });
    t.health.handler = ({ url, body }) => {
      if (url.pathname.endsWith("/settings")) return { json: { timeZone: "Europe/Budapest" } };
      if (url.pathname.endsWith("/nutrition-log/dataPoints") && url.search === "") return { json: { name: "operations/1", done: true, response: { ...(body as object), name: "users/9/dataTypes/nutrition-log/dataPoints/mine" } } };
      if (url.pathname.endsWith("/nutrition-log/dataPoints")) return { json: { dataPoints: [meal("mine", "Lunch", 500), meal("theirs", "Connector snack", 100)] } };
      return { json: { dataPoints: [] } };
    };
    const { cookie } = await appSignIn(t);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).send({ name: "Lunch", kcal: 500, carbs: 10, protein: 0 });
    const state = await t.http.get("/api/app/state").set("cookie", cookie);
    expect(state.body.eaten.calories).toBe(600);
  });

  it("keeps a connected person's Google Health connection when they sign in again", async () => {
    const t = makeTestApp({ now: () => NOW });
    await appSignIn(t);
    const before = await t.store.getUser("sub-tester");
    expect(before?.googleRefreshTokenSealed).toBeDefined();
    t.google.codes.set("g-again", { sub: "sub-tester", email: "tester@example.com", accessToken: "at", expiresIn: 3600, grantedScopes: ["openid", "email"] });
    const start = await t.http.get("/api/auth/start");
    const state = new URL(String(start.headers["location"])).searchParams.get("state");
    await t.http.get("/oauth/google/callback").query({ code: "g-again", state });
    expect((await t.store.getUser("sub-tester"))?.googleRefreshTokenSealed).toBe(before?.googleRefreshTokenSealed);
  });

  it("the app's sign-in asks Google for the identity only; connecting asks for the Health permissions, as the same person", async () => {
    const t = makeTestApp({ now: () => NOW });
    await t.http.get("/api/auth/start");
    expect(t.google.lastAuth?.scopes).toEqual(["openid", "email"]);

    // Not signed in: sent to sign in first.
    const anon = await t.http.get("/api/auth/connect-health");
    expect(anon.headers["location"]).toBe("/api/auth/start");

    const { cookie } = await noHealth(t);
    const go = await t.http.get("/api/auth/connect-health").set("cookie", cookie);
    expect(go.status).toBe(302);
    expect(t.google.lastAuth?.scopes).toEqual(expect.arrayContaining(["openid", "email", ...READ_SCOPES]));
    const state = new URL(String(go.headers["location"])).searchParams.get("state");

    // A different Google account cannot be connected to this person.
    t.google.account("g-other", { sub: "sub-someone-else", email: "tester@example.com", refreshToken: "rt-x" });
    const wrong = await t.http.get("/oauth/google/callback").query({ code: "g-other", state });
    expect(wrong.status).toBe(403);

    // The same person grants Google Health: connected.
    const go2 = await t.http.get("/api/auth/connect-health").set("cookie", cookie);
    const state2 = new URL(String(go2.headers["location"])).searchParams.get("state");
    t.google.account("g-same", { sub: "sub-plain", email: "tester@example.com", refreshToken: "rt-plain" });
    const ok = await t.http.get("/oauth/google/callback").query({ code: "g-same", state: state2 });
    expect(ok.status).toBe(302);
    expect((await t.http.get("/api/app/me").set("cookie", cookie)).body.healthConnected).toBe(true);
  });
});

describe("deleting the history", () => {
  async function withEntries() {
    const t = makeTestApp({ now: () => NOW });
    t.health.handler = ({ url, body }) => url.pathname.endsWith("/settings") ? { json: { timeZone: "Europe/Budapest" } }
      : url.search === "" && url.pathname.endsWith("/dataPoints") ? { json: { name: "operations/1", done: true, response: { ...(body as object), name: `users/9/dataTypes/${url.pathname.includes("hydration") ? "hydration" : "nutrition"}-log/dataPoints/${Math.random().toString(16).slice(2, 8)}` } } }
      : { json: { dataPoints: [] } };
    const { cookie } = await appSignIn(t);
    await t.http.put("/api/app/settings").set("cookie", cookie).set(HEADER).send(settings);
    const a = await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).send({ name: "Apple", kcal: 95, carbs: 25, protein: 0 });
    const w = await t.http.post("/api/app/water").set("cookie", cookie).set(HEADER).send({ ml: 250 });
    return { t, cookie, apple: a.body.id as string, water: w.body.id as string };
  }

  it("deletes chosen entries and their Google Health copies", async () => {
    const { t, cookie, apple, water } = await withEntries();
    const r = await t.http.post("/api/app/entries/delete").set("cookie", cookie).set(HEADER).send({ ids: [apple] });
    expect(r.body).toEqual({ deleted: 1 });
    expect(await t.store.getEntry("sub-tester", apple)).toBeUndefined();
    expect(await t.store.getEntry("sub-tester", water)).toBeDefined();
    expect(t.health.last().url.pathname).toContain(":batchDelete");
  });

  it("deletes the whole history but leaves the Google Health copies alone, and needs the header", async () => {
    const { t, cookie } = await withEntries();
    const before = t.health.requests.length;
    expect((await t.http.post("/api/app/entries/delete-all").set("cookie", cookie).send({})).status).toBe(403);
    const r = await t.http.post("/api/app/entries/delete-all").set("cookie", cookie).set(HEADER).send({});
    expect(r.body).toEqual({ deleted: 2 });
    expect(await t.store.listEntries("sub-tester", { from: 0, to: Number.MAX_SAFE_INTEGER })).toEqual([]);
    expect(t.health.requests.length).toBe(before);
  });

  it("is part of delete-my-data: the store forgets every entry of the person and nobody else's", async () => {
    const { t } = await withEntries();
    await t.store.putEntry({ id: "x", userId: "someone-else", kind: "water", name: "Water", kcal: 0, carbs: 0, protein: 0, ml: 100, ingredients: [], source: "button", estimate: false, at: NOW });
    await t.store.deleteUserData("sub-tester");
    expect(await t.store.listEntries("sub-tester", { from: 0, to: Number.MAX_SAFE_INTEGER })).toEqual([]);
    expect(await t.store.getEntry("someone-else", "x")).toBeDefined();
  });
});

describe("the local day", () => {
  it("is 25 hours on the day the clocks go back and 23 when they go forward, in Budapest", () => {
    const hours = (ms: number) => (ms / 3_600_000);
    const back = dayBounds(Date.parse("2026-10-25T12:00:00Z"), "Europe/Budapest");
    expect(hours(back.to - back.from)).toBe(25);
    const fwd = dayBounds(Date.parse("2026-03-29T12:00:00Z"), "Europe/Budapest");
    expect(hours(fwd.to - fwd.from)).toBe(23);
    const normal = dayBounds(Date.parse("2026-09-30T12:00:00Z"), "Europe/Budapest");
    expect(hours(normal.to - normal.from)).toBe(24);
    expect(new Date(normal.from).toISOString()).toBe("2026-09-29T22:00:00.000Z");
  });

  it("sums millilitres from the hydration log", () => {
    expect(sumHydration([{ hydrationLog: { amountConsumed: { milliliters: 250 } } }, { hydrationLog: { amountConsumed: { milliliters: 400.4 } } }, {}, null])).toBe(650);
  });
});
