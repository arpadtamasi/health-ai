// US-01m3rw2bqxkqp6v1hg9g02t1zr: the chat estimates a calorie goal in code.
import { describe, expect, it } from "vitest";
import { estimateCalories } from "../../src/ai/estimate.js";

describe("estimateCalories", () => {
  it("uses Mifflin-St Jeor: a 56-year-old man, 180 cm, 110 kg, losing weight, lightly active", () => {
    const e = estimateCalories({ sex: "male", age: 56, heightCm: 180, weightKg: 110, activity: "light", aim: "lose" });
    expect(e.bmr).toBe(1950);
    expect(e.maintenance).toBe(2681);
    expect(e.target).toBe(2140); // 80% of 2681, rounded to 10
    expect(e.carbs).toBe(268);
    expect(e.protein).toBe(134);
    expect(e.flooredAtMinimum).toBe(false);
  });

  it("never goes below the calorie floor", () => {
    const e = estimateCalories({ sex: "female", age: 70, heightCm: 150, weightKg: 45, activity: "sedentary", aim: "lose" });
    expect(e.target).toBe(1200);
    expect(e.flooredAtMinimum).toBe(true);
  });

  it("maintain keeps the maintenance level, gain adds a modest surplus", () => {
    const base = { sex: "male", age: 30, heightCm: 180, weightKg: 80, activity: "moderate" } as const;
    const m = estimateCalories({ ...base, aim: "maintain" });
    const g = estimateCalories({ ...base, aim: "gain" });
    expect(m.target).toBe(Math.round(m.maintenance / 10) * 10);
    expect(g.target).toBeGreaterThan(m.target);
  });
});
