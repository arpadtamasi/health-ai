// US-01m3rwa0cvrtcapqk0k3h6mqvc (Ask what to eat to catch up): three ranked options from what is in front of the person
// (a photo or a typed list) and today's state. The model proposes; a rule check verifies what can be verified
// (the calorie ceiling and floor, constraints, plausible arithmetic) before anything is shown.
import { z } from "zod";
import type { ToolCaller, ToolSpec } from "./model.js";
import { gaps, worstMacro } from "./pace.js";
import { FOOD_CATEGORIES, type DayState, type ImageInput, type Option, type Usage } from "./types.js";

/** Below this daily goal the app refuses to plan (the design's default floor). */
export const CALORIE_FLOOR = 1200;

const proposed = z.object({
  options: z.array(z.object({
    name: z.string().min(1),
    category: z.enum(FOOD_CATEGORIES),
    kcal: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    ingredients: z.array(z.string()),
    reason: z.string().optional(),
  })),
});

const TOOL: ToolSpec = {
  name: "suggest_options",
  description: "Return the foods the person can choose from, as seen in the photo or listed in the text, with estimated values for one normal portion.",
  inputSchema: {
    type: "object",
    properties: {
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string", enum: [...FOOD_CATEGORIES] },
            kcal: { type: "number" }, carbs: { type: "number", description: "grams" }, protein: { type: "number", description: "grams" },
            ingredients: { type: "array", items: { type: "string" }, description: "every ingredient you can tell or infer" },
            reason: { type: "string", description: "one short sentence on why it fits today's gap" },
          },
          required: ["name", "category", "kcal", "carbs", "protein", "ingredients"],
        },
      },
    },
    required: ["options"],
  },
};

const SYSTEM = [
  "You help one person choose what to eat right now, from the options in front of them (a fridge, a menu, a counter, a plate, or a typed list).",
  "Answer only by calling the tool. List only foods that are actually visible or listed; if nothing is visible, return an empty list.",
  "When the options are separate items (for example what is in a fridge), you may combine them into a few simple meals a person would really eat, such as chicken with rice; name the meal and list all its ingredients.",
  "Give honest estimates for one normal portion, and list every ingredient you can tell or infer, because allergies are checked against it.",
  "Never include a food that contains anything on the person's avoid list. When unsure about an ingredient, leave the food out.",
].join("\n");

export type WhatNowResult =
  | { kind: "options"; options: Option[]; basis: string; usage: Usage }
  | { kind: "no_ranking"; reason: "below_floor" | "nothing_fits" | "nothing_visible"; usage: Usage };

export interface WhatNowDeps { model: ToolCaller; modelName: string }
export interface WhatNowInput { state: DayState; optionsText?: string; images?: ImageInput[] }

type Candidate = Omit<Option, "rank">;

/** What can be checked without the model: ceiling, constraints (with unknown ingredients treated as a violation), arithmetic. */
export function checkCandidates(candidates: Candidate[], state: DayState): Candidate[] {
  const left = state.goals.calories - state.eaten.calories;
  const banned = state.constraints.map((c) => c.trim().toLowerCase()).filter(Boolean);
  return candidates.filter((c) => {
    if (c.kcal > left) return false;
    // Carbs and protein alone give 4 kcal per gram, so a total below that (minus rounding slack) cannot be right.
    if (c.kcal < (c.carbs + c.protein) * 4 * 0.9) return false;
    if (c.ingredients.length === 0) return false;
    const text = [c.name, ...c.ingredients].join(" ").toLowerCase();
    return !banned.some((b) => text.includes(b));
  });
}

/** Rank by how much of the largest macro gap an option closes (capped at the gap), then by fewer calories. */
export function rankCandidates(candidates: Candidate[], state: DayState): Option[] {
  const worst = worstMacro(state);
  const gap = worst ? Math.abs(gaps(state)[worst]) : 0;
  const closes = (c: Candidate) => {
    if (!worst) return 0;
    const amount = worst === "calories" ? c.kcal : worst === "carbs" ? c.carbs : c.protein;
    return Math.min(amount, gap);
  };
  return [...candidates]
    .sort((a, b) => closes(b) - closes(a) || a.kcal - b.kcal)
    .slice(0, 3)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

function describe(state: DayState): string {
  const g = gaps(state);
  const worst = worstMacro(state);
  return [
    `Today so far: ${state.eaten.calories} kcal, ${state.eaten.carbs} g carbs, ${state.eaten.protein} g protein (goal ${state.goals.calories} kcal, ${state.goals.carbs} g, ${state.goals.protein} g).`,
    `Against the pace of the day: ${g.calories} kcal, ${g.carbs} g carbs, ${g.protein} g protein (negative means behind). ${worst ? `Furthest behind: ${worst}.` : "Not behind on anything."}`,
    `Avoid: ${state.constraints.length ? state.constraints.join(", ") : "nothing"}.`,
  ].join("\n");
}

export async function whatNow(deps: WhatNowDeps, input: WhatNowInput): Promise<WhatNowResult> {
  const usage: Usage = { inputTokens: 0, outputTokens: 0 };
  if (input.state.goals.calories < CALORIE_FLOOR) return { kind: "no_ranking", reason: "below_floor", usage };

  const text = `${describe(input.state)}\n${input.optionsText ? `Options written by the person: ${input.optionsText}` : "The options are in the photo."}`;
  let sawAny = false;
  // One retry: a second look is cheap, and a fully filtered first answer is often a wrong estimate rather than a bad menu.
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await deps.model.callTool({ model: deps.modelName, system: SYSTEM, text, ...(input.images ? { images: input.images } : {}), tool: TOOL, maxTokens: 1200 });
    usage.inputTokens += res.usage.inputTokens;
    usage.outputTokens += res.usage.outputTokens;
    const parsed = proposed.safeParse(res.toolInput);
    if (!parsed.success) continue;
    if (parsed.data.options.length === 0) return { kind: "no_ranking", reason: "nothing_visible", usage };
    sawAny = true;
    const kept = checkCandidates(parsed.data.options.map(({ reason, ...rest }) => ({ ...rest, ...(reason ? { reason } : {}) })), input.state);
    if (kept.length > 0) {
      const ranked = rankCandidates(kept, input.state);
      const logged = input.state.eaten.calories > 0 ? "today's log" : "an empty log";
      return { kind: "options", options: ranked, basis: `Based on ${logged}; estimates are approximate.`, usage };
    }
  }
  return { kind: "no_ranking", reason: sawAny ? "nothing_fits" : "nothing_visible", usage };
}
