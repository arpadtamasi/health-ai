// US-01m3rw2bqxkqp6v1hg9g02t1zr (chat onboarding): when the person does not know their calorie goal, the chat estimates one from
// age, height, weight and aim. The arithmetic is done here, in code, not by the model, so it is the same every time.
import { CALORIE_FLOOR } from "./whatNow.js";

export type Sex = "male" | "female";
export type Aim = "lose" | "maintain" | "gain";
export type Activity = "sedentary" | "light" | "moderate" | "active";

const ACTIVITY_FACTOR: Record<Activity, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
/** Share of the maintenance calories to aim for: a moderate deficit or surplus, never an extreme one. */
const AIM_FACTOR: Record<Aim, number> = { lose: 0.8, maintain: 1, gain: 1.1 };

export interface Estimate {
  /** Basal metabolic rate (Mifflin-St Jeor), kcal per day. */
  bmr: number;
  /** Maintenance: the basal rate times an activity factor. */
  maintenance: number;
  /** The suggested daily goal for the aim, never below the calorie floor. */
  target: number;
  carbs: number;
  protein: number;
  /** Grams of fat: the rest of the default split, a quarter of the calories at 9 kcal per gram. */
  fat: number;
  /** A daily water goal: about 30 ml per kilogram of body weight, between 1.5 and 4.5 litres, in steps of 100 ml. */
  waterMl: number;
  /** True when the floor raised the target above what the aim alone would give. */
  flooredAtMinimum: boolean;
}

export function estimateCalories(input: { sex: Sex; age: number; heightCm: number; weightKg: number; activity: Activity; aim: Aim }): Estimate {
  const { sex, age, heightCm, weightKg } = input;
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161));
  const maintenance = Math.round(bmr * ACTIVITY_FACTOR[input.activity]);
  const wanted = Math.round((maintenance * AIM_FACTOR[input.aim]) / 10) * 10;
  const target = Math.max(CALORIE_FLOOR, wanted);
  return {
    bmr, maintenance, target,
    // The default split of the goal: about half the calories from carbs and a quarter from protein, 4 kcal per gram.
    carbs: Math.round((target * 0.5) / 4),
    protein: Math.round((target * 0.25) / 4),
    fat: Math.round((target * 0.25) / 9),
    waterMl: Math.min(4500, Math.max(1500, Math.round((weightKg * 30) / 100) * 100)),
    flooredAtMinimum: target > wanted,
  };
}
