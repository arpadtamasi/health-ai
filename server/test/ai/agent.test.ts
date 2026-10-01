// US-01m3rw2bqxkqp6v1hg9g02t1zr (Ask and log through a small chat): the chat is an AI conversation with tools.
import { describe, expect, it } from "vitest";
import { runAgent, type AgentEnv } from "../../src/ai/agent.js";
import type { Block, ConverseRequest, ConverseResponse, ModelClient } from "../../src/ai/model.js";
import type { DayState } from "../../src/ai/types.js";

const state: DayState = {
  goals: { calories: 1900, carbs: 230, protein: 110 },
  eaten: { calories: 720, carbs: 62, protein: 41 },
  minutesNow: 14 * 60 + 20,
  window: { startHour: 7, endHour: 22 },
  constraints: ["nuts"],
};

const say = (text: string): ConverseResponse => ({ content: [{ type: "text", text }], stopReason: "end_turn", usage: { inputTokens: 100, outputTokens: 20 } });
const call = (id: string, name: string, input: unknown, text?: string): ConverseResponse => ({
  content: [...(text ? [{ type: "text", text } as Block] : []), { type: "tool_use", id, name, input }],
  stopReason: "tool_use",
  usage: { inputTokens: 100, outputTokens: 30 },
});

function scripted(...replies: ConverseResponse[]): ModelClient & { requests: ConverseRequest[] } {
  const requests: ConverseRequest[] = [];
  return {
    requests,
    converse: (req) => {
      requests.push(req);
      return Promise.resolve(replies[Math.min(requests.length - 1, replies.length - 1)]!);
    },
  };
}

function env(over: Partial<AgentEnv> = {}): AgentEnv & { saved: unknown[]; logged: unknown[]; suggestedWith: unknown[] } {
  const e = {
    saved: [] as unknown[], logged: [] as unknown[], suggestedWith: [] as unknown[],
    today: () => Promise.resolve({ onboarded: true, state }),
    saveSettings: (p: unknown) => { e.saved.push(p); return Promise.resolve({ ok: true as const }); },
    suggest: (i: unknown) => {
      e.suggestedWith.push(i);
      return Promise.resolve({ kind: "options" as const, basis: "Based on today's log; estimates are approximate.", usage: { inputTokens: 0, outputTokens: 0 },
        options: [{ rank: 1, name: "Chicken with rice", category: "grain" as const, kcal: 560, carbs: 62, protein: 38, ingredients: ["chicken", "rice"] }] });
    },
    logMeal: (m: unknown) => { e.logged.push(m); return Promise.resolve({ id: "users/1/dataTypes/nutrition-log/dataPoints/9" }); },
    ...over,
  };
  return e as never;
}

const deps = (m: ModelClient) => ({ model: m, modelName: "claude-haiku-4-5-20251001" });
const resultsOf = (req: ConverseRequest) => req.turns.flatMap((t) => t.content).filter((b): b is Extract<Block, { type: "tool_result" }> => b.type === "tool_result").map((b) => JSON.parse(b.content) as Record<string, unknown>);

describe("the chat agent", () => {
  it("estimates a calorie goal in code when the person does not know it (the owner's own words)", async () => {
    const m = scripted(call("t1", "estimate_calories", { sex: "male", age: 56, heightCm: 180, weightKg: 110, activity: "light", aim: "lose" }), say("Kb. 2140 kcal lenne a cél. Jó így?"));
    const r = await runAgent(deps(m), env(), { history: [], message: "Nem tudom. 56 éves, 180 centis férfi vagyok, 110kg" });
    expect(resultsOf(m.requests[1]!)[0]).toMatchObject({ bmr: 1950, maintenance: 2681, target: 2140 });
    expect(r.events).toEqual([{ type: "text", text: "Kb. 2140 kcal lenne a cél. Jó így?" }]);
    expect(r.usage).toEqual({ inputTokens: 200, outputTokens: 50 });
  });

  it("refuses implausible values for the estimate and tells the model what to do", async () => {
    const m = scripted(call("t1", "estimate_calories", { sex: "male", age: 5, heightCm: 180, weightKg: 110, activity: "light", aim: "lose" }), say("Hány éves vagy?"));
    await runAgent(deps(m), env(), { history: [], message: "x" });
    expect(resultsOf(m.requests[1]!)[0]).toHaveProperty("error");
  });

  it("saves settings through the tool and tells the app, and passes a failure back to the model", async () => {
    const e = env();
    const m = scripted(call("t1", "save_settings", { calories: 2140, window: { startHour: 7, endHour: 22 }, constraints: [] }), say("Elmentettem."));
    const r = await runAgent(deps(m), e, { history: [], message: "igen" });
    expect(e.saved).toEqual([{ calories: 2140, window: { startHour: 7, endHour: 22 }, constraints: [] }]);
    expect(r.events.map((x) => x.type)).toEqual(["settings_saved", "text"]);

    const bad = env({ saveSettings: () => Promise.resolve({ ok: false as const, error: "calories must be 500 to 10000" }) });
    const m2 = scripted(call("t1", "save_settings", { calories: 50 }), say("Az nem lehet."));
    const r2 = await runAgent(deps(m2), bad, { history: [], message: "50" });
    expect(resultsOf(m2.requests[1]!)[0]).toEqual({ error: "calories must be 500 to 10000" });
    expect(r2.events.map((x) => x.type)).toEqual(["text"]);
  });

  it("suggests from the photo of this message, shows the cards, and sends the photo to the model only once", async () => {
    const e = env();
    const image = { mediaType: "image/jpeg" as const, dataBase64: "AAAA" };
    const m = scripted(call("t1", "suggest_options", {}), say("Szénhidrátból vagy le."));
    const r = await runAgent(deps(m), e, { history: [], message: "mit egyek?", image });
    expect(e.suggestedWith).toEqual([{ images: [image] }]);
    expect(r.events.map((x) => x.type)).toEqual(["options", "text"]);
    expect(m.requests[0]!.turns.at(-1)!.content.some((b) => b.type === "image")).toBe(true);
    expect(m.requests[1]!.turns.flatMap((t) => t.content).some((b) => b.type === "image")).toBe(false);
  });

  it("passes typed options on, and says setup is not done when it is not", async () => {
    const e = env({ suggest: () => Promise.resolve({ kind: "not_ready" as const }) });
    const m = scripted(call("t1", "suggest_options", { optionsText: "rice, eggs" }), say("Előbb állítsuk be."));
    await runAgent(deps(m), e, { history: [], message: "mit egyek? rizs, tojás" });
    expect(String((resultsOf(m.requests[1]!)[0] as { error: string }).error)).toMatch(/Setup is not done/);
  });

  it("offers short answers as buttons: at most four, short, no repeats", async () => {
    const m = scripted(call("t1", "quick_replies", { replies: ["Nincs", "Mogyoró", "Laktóz", "Glutén", "Mogyoró", "Valami nagyon hosszú válasz, amit senki nem koppintana"] }), say("Van, amit nem ehetsz?"));
    const r = await runAgent(deps(m), env(), { history: [], message: "szia" });
    expect(r.events).toEqual([{ type: "replies", replies: ["Nincs", "Mogyoró", "Laktóz", "Glutén"] }, { type: "text", text: "Van, amit nem ehetsz?" }]);
    const one = scripted(call("t1", "quick_replies", { replies: ["csak egy"] }), say("ok"));
    const r2 = await runAgent(deps(one), env(), { history: [], message: "x" });
    expect(r2.events.map((e) => e.type)).toEqual(["text"]);
    expect(resultsOf(one.requests[1]!)[0]).toHaveProperty("error");
  });

  it("logs a meal the person says they ate", async () => {
    const e = env();
    const m = scripted(call("t1", "log_meal", { name: "Pogácsa", kcal: 110, carbs: 12, protein: 3 }), say("Naplóztam a pogácsát."));
    const r = await runAgent(deps(m), e, { history: [], message: "ettem egy pogácsát" });
    expect(e.logged).toEqual([{ name: "Pogácsa", kcal: 110, carbs: 12, protein: 3 }]);
    expect(r.events[0]).toEqual({ type: "logged", name: "Pogácsa", kcal: 110, id: "users/1/dataTypes/nutrition-log/dataPoints/9" });
  });

  it("hands the model what is left after a logged meal, so it does not calculate", async () => {
    const e = env({ logMeal: () => Promise.resolve({ id: null, left: { calories: 1700, carbs: 150, protein: 70 } }) });
    const m = scripted(call("t1", "log_meal", { name: "Alma", kcal: 95, carbs: 25, protein: 0 }), say("Naplóztam."));
    await runAgent(deps(m), e, { history: [], message: "ettem egy almát" });
    expect(resultsOf(m.requests[1]!)[0]).toEqual({ logged: true, leftToday: { calories: 1700, carbs: 150, protein: 70 } });
  });

  it("reads today with the pace gaps", async () => {
    const m = scripted(call("t1", "get_today", {}), say("Szénhidrátban le vagy maradva."));
    await runAgent(deps(m), env(), { history: [], message: "hol tartok?" });
    expect(resultsOf(m.requests[1]!)[0]).toMatchObject({ setupDone: true, paceGap: { calories: -209, carbs: -50, protein: -13 }, avoid: ["nuts"] });
  });

  it("keeps the earlier turns, and stops a model that never stops calling tools", async () => {
    const m = scripted(call("t", "get_today", {}));
    const r = await runAgent(deps(m), env(), { history: [{ role: "user", text: "szia" }, { role: "assistant", text: "Szia!" }], message: "mi van?" });
    expect(m.requests).toHaveLength(5);
    expect(m.requests[0]!.turns.slice(0, 2).map((t) => t.role)).toEqual(["user", "assistant"]);
    expect(r.events).toEqual([]);
  });

  it("answers an unknown tool and a throwing tool without crashing", async () => {
    const m = scripted(call("t1", "do_magic", {}), say("ok"));
    await runAgent(deps(m), env(), { history: [], message: "x" });
    expect(resultsOf(m.requests[1]!)[0]).toHaveProperty("error");
    const boom = env({ today: () => Promise.reject(new Error("db down")) });
    const m2 = scripted(call("t1", "get_today", {}), say("Hiba."));
    await runAgent(deps(m2), boom, { history: [], message: "x" });
    expect(resultsOf(m2.requests[1]!)[0]).toHaveProperty("error");
  });
});
