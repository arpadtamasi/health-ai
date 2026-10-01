// US-01m3rwa0cvrtcapqk0k3h6mqvc (Ask what to eat to catch up), US-01m3rvr64zrzczabckjf6crb2z (pace).
import { describe, expect, it } from "vitest";
import { MemoryUsageStore, TokenBudget, dayKey } from "../../src/ai/budget.js";
import type { ModelClient, ModelRequest } from "../../src/ai/model.js";
import { whatNow } from "../../src/ai/whatNow.js";
import type { DayState } from "../../src/ai/types.js";

// 14:20, 1,900 kcal goal, window 7-22: behind 209 kcal, 50 g carbs, 13 g protein (the Kotta example).
const state: DayState = {
  goals: { calories: 1900, carbs: 230, protein: 110 },
  eaten: { calories: 720, carbs: 62, protein: 41 },
  minutesNow: 14 * 60 + 20,
  window: { startHour: 7, endHour: 22 },
  constraints: ["nuts"],
};

const rice = { name: "Chicken with rice", category: "grain", kcal: 560, carbs: 62, protein: 38, ingredients: ["chicken", "rice"], reason: "Closes most of the carb gap." };
const sandwich = { name: "Wholegrain sandwich", category: "bread", kcal: 430, carbs: 48, protein: 24, ingredients: ["bread", "cheese"] };
const salad = { name: "Egg salad", category: "egg", kcal: 310, carbs: 12, protein: 26, ingredients: ["egg", "lettuce"] };
const satay = { name: "Peanut satay", category: "meat", kcal: 500, carbs: 20, protein: 30, ingredients: ["chicken", "peanuts"] };

function fake(...answers: unknown[]): ModelClient & { calls: ModelRequest[] } {
  const calls: ModelRequest[] = [];
  return {
    calls,
    callTool: (req) => {
      calls.push(req);
      const next = answers[Math.min(calls.length - 1, answers.length - 1)];
      return Promise.resolve({ toolInput: next, usage: { inputTokens: 100, outputTokens: 50 } });
    },
  };
}
const deps = (m: ModelClient) => ({ model: m, modelName: "claude-haiku-4-5-20251001" });

describe("whatNow", () => {
  it("ranks by how much of the largest gap an option closes (carbs here), at most three", async () => {
    const m = fake({ options: [salad, sandwich, rice] });
    const r = await whatNow(deps(m), { state, optionsText: "fridge" });
    expect(r.kind).toBe("options");
    if (r.kind !== "options") return;
    expect(r.options.map((o) => [o.rank, o.name])).toEqual([[1, "Chicken with rice"], [2, "Wholegrain sandwich"], [3, "Egg salad"]]);
  });

  it("drops an option containing an avoided ingredient, and one whose ingredients are unknown", async () => {
    const m = fake({ options: [satay, { ...sandwich, ingredients: [] }, rice] });
    const r = await whatNow(deps(m), { state, optionsText: "menu" });
    expect(r.kind === "options" && r.options.map((o) => o.name)).toEqual(["Chicken with rice"]);
  });

  it("drops options above the calories left for the day", async () => {
    const tight: DayState = { ...state, eaten: { calories: 1500, carbs: 62, protein: 41 } };
    const m = fake({ options: [rice, salad] });
    const r = await whatNow(deps(m), { state: tight, optionsText: "fridge" });
    expect(r.kind === "options" && r.options.map((o) => o.name)).toEqual(["Egg salad"]);
  });

  it("drops an option whose calories are below what its carbs and protein alone give", async () => {
    const m = fake({ options: [{ ...rice, kcal: 100 }, salad] });
    const r = await whatNow(deps(m), { state, optionsText: "x" });
    expect(r.kind === "options" && r.options.map((o) => o.name)).toEqual(["Egg salad"]);
  });

  it("retries once when everything was filtered, then gives up without inventing", async () => {
    const m = fake({ options: [satay] });
    const r = await whatNow(deps(m), { state, optionsText: "menu" });
    expect(m.calls).toHaveLength(2);
    expect(r).toMatchObject({ kind: "no_ranking", reason: "nothing_fits" });
    expect(r.usage).toEqual({ inputTokens: 200, outputTokens: 100 });
  });

  it("says nothing is visible when the model returns an empty list", async () => {
    const r = await whatNow(deps(fake({ options: [] })), { state });
    expect(r).toMatchObject({ kind: "no_ranking", reason: "nothing_visible" });
  });

  it("refuses to plan below the calorie floor without calling the model", async () => {
    const m = fake({ options: [rice] });
    const r = await whatNow(deps(m), { state: { ...state, goals: { ...state.goals, calories: 1000 } }, optionsText: "x" });
    expect(r).toMatchObject({ kind: "no_ranking", reason: "below_floor" });
    expect(m.calls).toHaveLength(0);
  });

  it("puts the gaps and the avoid list into the prompt", async () => {
    const m = fake({ options: [rice] });
    await whatNow(deps(m), { state, optionsText: "fridge" });
    const text = m.calls[0]!.text;
    expect(text).toContain("-209 kcal");
    expect(text).toContain("Furthest behind: carbs");
    expect(text).toContain("Avoid: nuts");
  });
});

describe("TokenBudget", () => {
  it("counts input and output tokens per user and day, and blocks at the limit", async () => {
    const budget = new TokenBudget(new MemoryUsageStore(), 300);
    const day = dayKey(new Date("2026-09-30T12:00:00Z"), "Europe/Budapest");
    expect(day).toBe("2026-09-30");
    expect((await budget.check("u1", day)).allowed).toBe(true);
    await budget.record("u1", day, { inputTokens: 100, outputTokens: 50 });
    await budget.record("u1", day, { inputTokens: 100, outputTokens: 50 });
    expect(await budget.check("u1", day)).toEqual({ allowed: false, used: 300, limit: 300 });
    expect((await budget.check("u2", day)).allowed).toBe(true);
    expect((await budget.check("u1", "2026-10-01")).allowed).toBe(true);
  });

  it("resets at the user's midnight, not the server's", () => {
    // 23:30 UTC on 30 Sep is already 1 Oct in Budapest.
    expect(dayKey(new Date("2026-09-30T23:30:00Z"), "Europe/Budapest")).toBe("2026-10-01");
  });
});
