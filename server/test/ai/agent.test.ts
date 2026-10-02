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

function env(over: Partial<AgentEnv> = {}): AgentEnv & { saved: unknown[]; logged: unknown[]; suggestedWith: unknown[]; languages: unknown[]; updates: { id: string | undefined; patch: unknown }[] } {
  const e = {
    updates: [] as { id: string | undefined; patch: unknown }[], saved: [] as unknown[], logged: [] as unknown[], suggestedWith: [] as unknown[], languages: [] as unknown[], water: [] as number[],
    clock: () => Promise.resolve({ date: "2026-10-01", time: "16:24", weekday: "Thursday", timeZone: "Europe/Budapest" }),
    language: () => Promise.resolve(undefined),
    setLanguage: (l: unknown) => { e.languages.push(l); return Promise.resolve(); },
    today: () => Promise.resolve({ onboarded: true, state }),
    saveSettings: (p: unknown) => { e.saved.push(p); return Promise.resolve({ ok: true as const }); },
    suggest: (i: unknown) => {
      e.suggestedWith.push(i);
      return Promise.resolve({ kind: "options" as const, basis: "Based on today's log; estimates are approximate.", usage: { inputTokens: 0, outputTokens: 0 },
        options: [{ rank: 1, name: "Chicken with rice", category: "grain" as const, kcal: 560, carbs: 62, protein: 38, ingredients: ["chicken", "rice"] }] });
    },
    logMeal: (m: unknown) => { e.logged.push(m); return Promise.resolve({ id: "users/1/dataTypes/nutrition-log/dataPoints/9" }); },
    updateEntry: (id: string | undefined, patch: unknown) => { e.updates.push({ id, patch }); return Promise.resolve({ ok: true as const, id: id ?? "e-last", name: "Bran", kcal: 415, left: { calories: 1000, carbs: 100, protein: 80, fat: 30 } }); },
    logWater: (ml: number) => { e.water.push(ml); return Promise.resolve({ id: "w1", left: { waterMl: 1500 } }); },
    recentEntries: () => Promise.resolve([{ id: "e1", kind: "meal" as const, name: "Apple", detail: "95 kcal", when: "Wed 12:00" }, { id: "e2", kind: "water" as const, name: "Water", detail: "250 ml", when: "Wed 13:00" }]),
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
    const r = await runAgent(deps(m), e, { history: [], message: "mit egyek?", images: [image] });
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

  it("logs water, refuses an absurd amount, and tells the model what is left", async () => {
    const e = env();
    const m = scripted(call("t1", "log_water", { ml: 330 }), say("Rendben."));
    const r = await runAgent(deps(m), e, { history: [], message: "ittam egy kis kólát, 330 ml" });
    expect((e as unknown as { water: number[] }).water).toEqual([330]);
    expect(r.events[0]).toEqual({ type: "logged_water", ml: 330, id: "w1" });
    expect(resultsOf(m.requests[1]!)[0]).toEqual({ logged: true, leftTodayMl: 1500 });
    const bad = scripted(call("t1", "log_water", { ml: 90000 }), say("Hm."));
    await runAgent(deps(bad), env(), { history: [], message: "x" });
    expect(resultsOf(bad.requests[1]!)[0]).toHaveProperty("error");
  });

  it("only proposes a deletion: a confirmation card for entries it was shown, never a delete", async () => {
    const m = scripted(call("t1", "request_delete", { ids: ["e1", "nope"] }), say("Kérlek, erősítsd meg."));
    const r = await runAgent(deps(m), env(), { history: [], message: "töröld az almát" });
    expect(r.events[0]).toEqual({ type: "confirm_delete", ids: ["e1"], all: false, labels: ["Apple 95 kcal (Wed 12:00)"] });
    const unknown = scripted(call("t1", "request_delete", { ids: ["zzz"] }), say("Nem találom."));
    const r2 = await runAgent(deps(unknown), env(), { history: [], message: "töröld" });
    expect(r2.events.map((x) => x.type)).toEqual(["text"]);
    const all = scripted(call("t1", "request_delete", { all: true }), say("Megerősíted?"));
    expect((await runAgent(deps(all), env(), { history: [], message: "töröld az egész előzményt" })).events[0]).toMatchObject({ type: "confirm_delete", all: true });
  });

  it("lists recent entries for the model", async () => {
    const m = scripted(call("t1", "list_entries", {}), say("Ezeket látom."));
    await runAgent(deps(m), env(), { history: [], message: "mit naplóztam?" });
    expect((resultsOf(m.requests[1]!)[0]!["entries"] as unknown[]).length).toBe(2);
  });

  it("logs a photo of food at once, as a photo entry, with the fat, and never asks first", async () => {
    const e = env();
    const image = { mediaType: "image/jpeg" as const, dataBase64: "AAAA" };
    const m = scripted(call("t1", "log_meal", { name: "Sült oldalas, rizs", kcal: 640, carbs: 62, protein: 38, fat: 26, ingredients: ["oldalas", "rizs"] }), say("Felírtam, becslés."));
    const r = await runAgent(deps(m), e, { history: [], message: "mit ettem", images: [image] });
    expect(e.logged).toEqual([{ name: "Sült oldalas, rizs", kcal: 640, carbs: 62, protein: 38, fat: 26, ingredients: ["oldalas", "rizs"], source: "photo" }]);
    expect(r.events[0]).toMatchObject({ type: "logged", kcal: 640 });
    expect(m.requests[0]!.turns.at(-1)!.content.filter((b) => b.type === "image")).toHaveLength(1);
  });

  it("takes the numbers of a label exactly: fromLabel makes it not an estimate", async () => {
    const e = env();
    const m = scripted(call("t1", "log_meal", { name: "Alpro Peach", kcal: 86, carbs: 11, protein: 4.5, fat: 2.5, fromLabel: true }), say("Felírtam a címke alapján."));
    await runAgent(deps(m), e, { history: [], message: "", images: [{ mediaType: "image/jpeg", dataBase64: "AAAA" }] });
    expect(e.logged[0]).toMatchObject({ estimate: false, source: "photo" });
  });

  it("sends several photos of one message to the model together", async () => {
    const e = env();
    const m = scripted(say("Két képet látok."));
    const img = { mediaType: "image/jpeg" as const, dataBase64: "AAAA" };
    await runAgent(deps(m), e, { history: [], message: "mérleg és csomag", images: [img, img] });
    expect(m.requests[0]!.turns.at(-1)!.content.filter((b) => b.type === "image")).toHaveLength(2);
  });

  it("corrects the latest meal in place with update_entry and shows a changed card, never a second log", async () => {
    const e = env();
    const m = scripted(call("t1", "update_entry", { kcal: 415, protein: 17, ingredients: ["korpa", "tej 250 g"] }), say("Átírtam: 250 g tej."));
    const r = await runAgent(deps(m), e, { history: [], message: "több tejjel" });
    expect(e.logged).toEqual([]);
    expect(e.updates).toEqual([{ id: undefined, patch: { kcal: 415, protein: 17, ingredients: ["korpa", "tej 250 g"] } }]);
    expect(r.events[0]).toEqual({ type: "updated", id: "e-last", name: "Bran", kcal: 415 });
    expect(resultsOf(m.requests[1]!)[0]).toMatchObject({ updated: true, leftToday: { fat: 30 } });
  });

  it("passes a time and a meal type to update_entry and refuses an empty correction", async () => {
    const e = env();
    const m = scripted(call("t1", "update_entry", { id: "e1", time: "13:00", mealType: "LUNCH" }), say("Átraktam ebédnek."));
    await runAgent(deps(m), e, { history: [], message: "ebéd volt" });
    expect(e.updates).toEqual([{ id: "e1", patch: { time: "13:00", mealType: "LUNCH" } }]);
    const empty = scripted(call("t1", "update_entry", {}), say("?"));
    await runAgent(deps(empty), env(), { history: [], message: "x" });
    expect(resultsOf(empty.requests[1]!)[0]).toHaveProperty("error");
  });

  it("saves a fat goal through save_settings", async () => {
    const e = env();
    const m = scripted(call("t1", "save_settings", { fat: 80 }), say("Mentettem."));
    await runAgent(deps(m), e, { history: [], message: "zsír 80 g" });
    expect(e.saved).toEqual([{ fat: 80 }]);
  });

  it("hands the model what is left after a logged meal, so it does not calculate", async () => {
    const e = env({ logMeal: () => Promise.resolve({ id: null, left: { calories: 1700, carbs: 150, protein: 70 } }) });
    const m = scripted(call("t1", "log_meal", { name: "Alma", kcal: 95, carbs: 25, protein: 0 }), say("Naplóztam."));
    await runAgent(deps(m), e, { history: [], message: "ettem egy almát" });
    expect(resultsOf(m.requests[1]!)[0]).toEqual({ logged: true, leftToday: { calories: 1700, carbs: 150, protein: 70 } });
  });

  it("tells the model the person's own date and time on every request, so it never guesses", async () => {
    const m = scripted(say("Szia"));
    await runAgent(deps(m), env(), { history: [], message: "szia" });
    expect(m.requests[0]!.system).toContain("Thursday 2026-10-01 16:24 (Europe/Budapest)");
    const none = scripted(say("Hi"));
    await runAgent(deps(none), env({ clock: () => Promise.reject(new Error("no settings")) }), { history: [], message: "hi" });
    expect(none.requests[0]!.system).not.toContain("local time now");
  });

  it("remembers the language the person starts in, and keeps answering in the saved one", async () => {
    const e = env();
    const m = scripted(call("t1", "set_language", { language: "hu" }), say("Szia!"));
    const r = await runAgent(deps(m), e, { history: [], message: "Szia, éhes vagyok" });
    expect(e.languages).toEqual(["hu"]);
    expect(r.events[0]).toEqual({ type: "language", language: "hu" });
    expect(m.requests[0]!.system).toContain("No language is saved yet");

    const saved = scripted(say("Rendben."));
    await runAgent(deps(saved), env({ language: () => Promise.resolve("hu" as const) }), { history: [], message: "ok" });
    expect(saved.requests[0]!.system).toContain('Their saved language is "hu"');

    const bad = scripted(call("t1", "set_language", { language: "klingon" }), say("ok"));
    const rb = await runAgent(deps(bad), env(), { history: [], message: "x" });
    expect(rb.events.map((x) => x.type)).toEqual(["text"]);
    expect(resultsOf(bad.requests[1]!)[0]).toHaveProperty("error");
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
