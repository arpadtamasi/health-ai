// US-01m3rw2bqxkqp6v1hg9g02t1zr (Ask and log through a small chat): the chat is an AI conversation, not a form. One model
// (the cheapest) talks with the person and calls tools: read today, estimate a calorie goal, save settings, suggest what to
// eat from a photo or a typed list, log a meal. The tools do the arithmetic and the writes; the model only decides which to call.
import { estimateCalories } from "./estimate.js";
import type { Block, ModelClient, ToolSpec, Turn } from "./model.js";
import type { WhatNowResult } from "./whatNow.js";
import type { DayState, ImageInput, Option, Usage } from "./types.js";
import { gaps } from "./pace.js";

export interface SettingsPatch {
  calories?: number;
  window?: { startHour: number; endHour: number };
  constraints?: string[];
}

export interface AgentToday {
  onboarded: boolean;
  /** Null until the first settings are saved. */
  state: DayState | null;
}

/** What the tools reach: the app's own storage and the Google Health log. The agent never touches them directly. */
export interface AgentEnv {
  today(): Promise<AgentToday>;
  saveSettings(patch: SettingsPatch): Promise<{ ok: true } | { ok: false; error: string }>;
  suggest(input: { optionsText?: string; images?: ImageInput[] }): Promise<WhatNowResult | { kind: "not_ready" }>;
  logMeal(meal: { name: string; kcal: number; carbs: number; protein: number }): Promise<{ id: string | null }>;
}

export type ChatEvent =
  | { type: "text"; text: string }
  | { type: "options"; options: Option[]; basis: string }
  | { type: "logged"; name: string; kcal: number; id: string | null }
  | { type: "settings_saved" };

export interface ChatTurn { role: "user" | "assistant"; text: string }

const SYSTEM = [
  "You are the chat of Health AI, a small app that helps one person decide what to eat right now, from what they already ate today and what is in front of them.",
  "Reply in the language the person writes in. Be short: one to three sentences. No lists unless asked, no headings, no emoji.",
  "You are a tracker and suggestion aid for adults, not a doctor: never give medical advice, never suggest a daily goal below 1,200 kcal.",
  "Use the tools; do not do arithmetic yourself. Call get_today when you need the person's goals, what they ate or whether they are set up.",
  "SETUP: until the person has settings (get_today says onboarded is false or there is no state), have a short conversation, one question at a time: foods to avoid (allergies, dislikes; \"none\" is a valid answer), the daily calorie goal, and the hours they usually eat.",
  "If they do not know their calorie goal, ask what you still need (sex, age, height, weight, how active they are, whether they want to lose, keep or gain weight), call estimate_calories, say the result is an estimate, and ask them to confirm before you save it.",
  "Call save_settings only after the person agreed to the values. The person must still tap the Agree button the app shows for the notice and consent; you cannot give consent for them, so say so when you have saved everything.",
  "SUGGESTIONS: when they ask what to eat, or show a photo of a fridge, a menu, a counter or a plate, call suggest_options (the photo of this message is attached automatically; pass optionsText only when they typed options). Then add one short sentence about the biggest gap; the app shows the cards itself, do not repeat them.",
  "If they have not told you what they can choose from and there is no photo, ask them to type it or take a photo.",
  "LOGGING: when they say what they ate, call log_meal with honest estimates for calories, carbs and protein, and say what you logged.",
].join("\n");

const tool = (name: string, description: string, properties: Record<string, unknown>, required: string[] = []): ToolSpec => ({
  name, description, inputSchema: { type: "object", properties, required },
});

const TOOLS: ToolSpec[] = [
  tool("get_today", "Today so far, the goals, the pace gaps (negative means behind), the eating window, the foods to avoid, and whether setup is done.", {}),
  tool("estimate_calories", "Estimate a daily calorie goal in code (Mifflin-St Jeor). Ask for any missing value first.", {
    sex: { type: "string", enum: ["male", "female"] }, age: { type: "number" }, heightCm: { type: "number" }, weightKg: { type: "number" },
    activity: { type: "string", enum: ["sedentary", "light", "moderate", "active"] }, aim: { type: "string", enum: ["lose", "maintain", "gain"] },
  }, ["sex", "age", "heightCm", "weightKg", "activity", "aim"]),
  tool("save_settings", "Save settings the person agreed to. Only the fields you pass change. constraints replaces the whole list (an empty list means nothing to avoid).", {
    calories: { type: "number" },
    window: { type: "object", properties: { startHour: { type: "number" }, endHour: { type: "number" } }, required: ["startHour", "endHour"] },
    constraints: { type: "array", items: { type: "string" } },
  }),
  tool("suggest_options", "Three ranked options to eat now, from the photo attached to this message or from options the person typed.", {
    optionsText: { type: "string", description: "Only when the person typed the options; leave out when there is a photo." },
  }),
  tool("log_meal", "Log a meal the person says they ate, with estimated values for the portion.", {
    name: { type: "string" }, kcal: { type: "number" }, carbs: { type: "number", description: "grams" }, protein: { type: "number", description: "grams" },
  }, ["name", "kcal", "carbs", "protein"]),
];

const MAX_STEPS = 5;
const HISTORY_TURNS = 20;

export interface AgentDeps { model: ModelClient; modelName: string }
export interface AgentInput { history: ChatTurn[]; message: string; image?: ImageInput }
export interface AgentResult { events: ChatEvent[]; usage: Usage }

const asNumber = (x: unknown): number | undefined => (typeof x === "number" && Number.isFinite(x) ? x : undefined);

export async function runAgent(deps: AgentDeps, env: AgentEnv, input: AgentInput): Promise<AgentResult> {
  const events: ChatEvent[] = [];
  const usage: Usage = { inputTokens: 0, outputTokens: 0 };

  const past: Turn[] = input.history.slice(-HISTORY_TURNS).map((t) => ({ role: t.role, content: [{ type: "text", text: t.text }] }));
  const userText: Block = { type: "text", text: input.message };
  // The photo goes to the model once; later steps see a placeholder, because the suggestion tool already has the image.
  const turns: Turn[] = [...past, { role: "user", content: input.image ? [{ type: "image", image: input.image }, userText] : [userText] }];

  const run = async (name: string, raw: unknown): Promise<string> => {
    const args = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    try {
      switch (name) {
        case "get_today": {
          const t = await env.today();
          if (!t.state) return JSON.stringify({ onboarded: t.onboarded, setupDone: false });
          const g = gaps(t.state);
          return JSON.stringify({ onboarded: t.onboarded, setupDone: true, goals: t.state.goals, eaten: t.state.eaten, paceGap: g, window: t.state.window, avoid: t.state.constraints, localTimeMinutes: t.state.minutesNow });
        }
        case "estimate_calories": {
          const sex = args["sex"], activity = args["activity"], aim = args["aim"];
          const age = asNumber(args["age"]), heightCm = asNumber(args["heightCm"]), weightKg = asNumber(args["weightKg"]);
          if ((sex !== "male" && sex !== "female") || !age || !heightCm || !weightKg || age < 14 || age > 100 || heightCm < 100 || heightCm > 230 || weightKg < 30 || weightKg > 300
            || !["sedentary", "light", "moderate", "active"].includes(String(activity)) || !["lose", "maintain", "gain"].includes(String(aim))) {
            return JSON.stringify({ error: "Some values are missing or not plausible. Ask the person again for what is missing." });
          }
          return JSON.stringify(estimateCalories({ sex, age, heightCm, weightKg, activity: activity as "light", aim: aim as "lose" }));
        }
        case "save_settings": {
          const patch: SettingsPatch = {};
          const calories = asNumber(args["calories"]);
          if (calories !== undefined) patch.calories = calories;
          const w = args["window"] as { startHour?: unknown; endHour?: unknown } | undefined;
          if (w && asNumber(w.startHour) !== undefined && asNumber(w.endHour) !== undefined) patch.window = { startHour: Number(w.startHour), endHour: Number(w.endHour) };
          if (Array.isArray(args["constraints"])) patch.constraints = args["constraints"].filter((c): c is string => typeof c === "string");
          const r = await env.saveSettings(patch);
          if (!r.ok) return JSON.stringify({ error: r.error });
          events.push({ type: "settings_saved" });
          return JSON.stringify({ saved: true });
        }
        case "suggest_options": {
          const optionsText = typeof args["optionsText"] === "string" && args["optionsText"] ? args["optionsText"] : undefined;
          const r = await env.suggest({ ...(optionsText ? { optionsText } : {}), ...(input.image ? { images: [input.image] } : {}) });
          if (r.kind === "not_ready") return JSON.stringify({ error: "Setup is not done yet. Finish the setup conversation first." });
          if (r.kind === "options") {
            events.push({ type: "options", options: r.options, basis: r.basis });
            return JSON.stringify({ shown: r.options.map((o) => `${o.rank}. ${o.name} (${o.kcal} kcal, ${o.carbs} g carbs, ${o.protein} g protein)`) });
          }
          return JSON.stringify({ shown: [], reason: r.reason });
        }
        case "log_meal": {
          const nm = typeof args["name"] === "string" ? args["name"].trim() : "";
          const kcal = asNumber(args["kcal"]), carbs = asNumber(args["carbs"]), protein = asNumber(args["protein"]);
          if (!nm || kcal === undefined || carbs === undefined || protein === undefined || kcal < 0 || kcal > 5000) return JSON.stringify({ error: "Name, calories, carbs and protein are needed." });
          const r = await env.logMeal({ name: nm, kcal, carbs, protein });
          events.push({ type: "logged", name: nm, kcal: Math.round(kcal), id: r.id });
          return JSON.stringify({ logged: true });
        }
        default:
          return JSON.stringify({ error: `Unknown tool ${name}` });
      }
    } catch {
      return JSON.stringify({ error: "That did not work. Say so briefly and ask the person to try again." });
    }
  };

  for (let step = 0; step < MAX_STEPS; step++) {
    const sent = step === 0 ? [...turns] : turns.map((t) => ({ ...t, content: t.content.map((b): Block => (b.type === "image" ? { type: "text", text: "(photo attached)" } : b)) }));
    const res = await deps.model.converse({ model: deps.modelName, system: SYSTEM, turns: sent, tools: TOOLS, maxTokens: 800 });
    usage.inputTokens += res.usage.inputTokens;
    usage.outputTokens += res.usage.outputTokens;
    for (const b of res.content) if (b.type === "text" && b.text.trim()) events.push({ type: "text", text: b.text.trim() });
    const calls = res.content.filter((b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use");
    if (res.stopReason !== "tool_use" || calls.length === 0) break;
    turns.push({ role: "assistant", content: res.content });
    turns.push({ role: "user", content: await Promise.all(calls.map(async (c): Promise<Block> => ({ type: "tool_result", toolUseId: c.id, content: await run(c.name, c.input) }))) });
  }
  return { events, usage };
}
