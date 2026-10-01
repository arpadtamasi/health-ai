// US-01m3rvr64zrzczabckjf6crb2z (pace), US-01m3rwa0cvrtcapqk0k3h6mqvc (what to eat), US-01m3rw2bqxkqp6v1hg9g02t1zr (chat onboarding and settings).
import { describe, expect, it } from "vitest";
import type { AiModel, ConverseResponse } from "../../src/ai/model.js";
import { localClock, nextDate, sumNutrition } from "../../src/app-api/today.js";
import { makeTestApp, type TestApp } from "../helpers.js";

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
  it("goes to Google and comes back with an HttpOnly __session cookie, then to /app/", async () => {
    const t = makeTestApp({ now: () => NOW });
    const { start, cb } = await appSignIn(t);
    expect(start.status).toBe(302);
    expect(String(start.headers["location"])).toContain("accounts.google.test");
    expect(cb.status).toBe(302);
    expect(cb.headers["location"]).toBe("/app/");
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
    expect((await t.http.get("/api/app/me").set("cookie", cookie)).body).toEqual({ email: "tester@example.com", onboarded: false });
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

  it("writes one nutrition-log entry for the chosen option, in the user's offset, with the meal type from the time", async () => {
    const { t, cookie } = await onboarded();
    t.health.handler = ({ url, body }) => url.pathname.endsWith("/settings")
      ? { json: { timeZone: "Europe/Budapest" } }
      : { json: { name: "operations/1", done: true, response: { ...(body as object), name: "users/9/dataTypes/nutrition-log/dataPoints/777" } } };
    const r = await t.http.post("/api/app/log").set("cookie", cookie).set(HEADER).send({ name: "Chicken with rice", kcal: 560, carbs: 62, protein: 38 });
    expect(r.body).toEqual({ id: "users/9/dataTypes/nutrition-log/dataPoints/777", mealType: "LUNCH" });
    const write = t.health.requests.find((q) => q.method === "POST" && q.url.pathname.endsWith("/nutrition-log/dataPoints"));
    expect((write?.body as { nutritionLog: unknown }).nutritionLog).toMatchObject({
      foodDisplayName: "Chicken with rice", mealType: "LUNCH", energy: { kcal: 560 }, totalCarbohydrate: { grams: 62 },
      nutrients: [{ nutrient: "PROTEIN", quantity: { grams: 38 } }],
      interval: { startUtcOffset: "7200s", endUtcOffset: "7200s" },
    });
  });

  it("deletes by id or by name, always under users/me, and refuses anything else", async () => {
    const { t, cookie } = await onboarded();
    await t.http.post("/api/app/unlog").set("cookie", cookie).set(HEADER).send({ id: "users/123/dataTypes/nutrition-log/dataPoints/777" });
    expect(t.health.last().url.pathname).toBe("/v4/users/me/dataTypes/nutrition-log/dataPoints:batchDelete");
    expect(t.health.last().body).toEqual({ names: ["users/me/dataTypes/nutrition-log/dataPoints/777"] });
    const bad = await t.http.post("/api/app/unlog").set("cookie", cookie).set(HEADER).send({ id: "users/1/dataTypes/sleep/dataPoints/9" });
    expect(bad.status).toBe(400);
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

describe("today's totals", () => {
  it("sums calories, carbs and protein over the log entries", () => {
    expect(sumNutrition([{ nutritionLog: { energy: { kcal: 95.4 }, totalCarbohydrate: { grams: 10 }, nutrients: [{ nutrient: "PROTEIN", quantity: { grams: 3 } }] } }, {}, null])).toEqual({ calories: 95, carbs: 10, protein: 3 });
  });
  it("reads the clock and the date in the time zone, and steps a date", () => {
    expect(localClock(Date.parse("2026-09-30T23:30:00Z"), "Europe/Budapest")).toEqual({ date: "2026-10-01", minutes: 90 });
    expect(nextDate("2026-09-30")).toBe("2026-10-01");
    expect(nextDate("2026-12-31")).toBe("2027-01-01");
  });
});
