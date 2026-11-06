// Sample data instead of the API, for design work (EXPO_PUBLIC_MOCK=1). Never part of the deployed app.
import type { Backend } from "../backend";
import { ApiError } from "../api/client";
import type { DayEntry } from "../day";
import { entries as seed, goals, suggestions } from "./data";

function minutesNow(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function mockBackend(): Backend {
  let list: DayEntry[] = [...seed];
  let seq = 0;
  const sum = (k: "kcal" | "carbs" | "protein" | "fat") => list.reduce((a, e) => a + e[k], 0);
  const backend: Backend = {
    me: () => Promise.resolve({ email: "sample@example.com", onboarded: true, language: null, healthConnected: true }),
    state: () => Promise.resolve({
      goals: { calories: goals.calories, carbs: goals.carbs, protein: goals.protein, fat: goals.fat }, window: goals.window, constraints: [],
      eaten: { calories: sum("kcal"), carbs: sum("carbs"), protein: sum("protein"), fat: sum("fat") }, date: "", minutes: minutesNow(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      water: { ml: list.reduce((a, e) => a + (e.ml ?? 0), 0), goalMl: goals.waterMl },
    }),
    // Sample answers: "Ennék" (or a question) gets the options, "hiba" fails so that "Újra" can be seen, anything else is logged.
    chat: (input) => {
      if (/hiba/i.test(input.message)) return Promise.reject(new ApiError(0, "network", null));
      if (input.intent === "would" || /egyek|eat\b/i.test(input.message)) return Promise.resolve({ events: [{ type: "text", text: "Sample mode: the model is not connected." }, { type: "options", options: suggestions, basis: "Sample options." }], needsConsent: false, onboarded: true, language: null });
      const id = `sample-${++seq}`;
      list = [...list, { id, kind: "meal", name: "Ropa vieja, rizs, saláta", kcal: 480, carbs: 41, protein: 34, fat: 18, at: Date.now(), source: "photo", estimate: true, ingredients: [] }];
      return Promise.resolve({ events: [{ type: "logged", name: "Ropa vieja, rizs, saláta", kcal: 480, id }, { type: "text", text: "**Beírtam fél adagot.** Ezzel 1140 kcal-nál jársz, fehérjéből még 91 g hiányzik. Vacsorára:\n- túró tojással\n- csirkemell rizzsel" }], needsConsent: false, onboarded: true, language: null });
    },
    // Sample steps and text, paced as a model would send them, so that the streamed reply can be seen without one.
    chatStream: async (input, onLine, signal) => {
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const check = () => { if (signal?.aborted) throw new ApiError(0, "stopped", {}); };
      if (/hiba/i.test(input.message)) { await wait(400); throw new ApiError(0, "network", null); }
      const would = input.intent === "would" || /egyek|eat\b/i.test(input.message);
      if (input.images?.length) { onLine({ type: "step", id: "photo", tool: "photo", state: "start" }); await wait(700); check(); onLine({ type: "step", id: "photo", tool: "photo", state: "done" }); }
      onLine({ type: "step", id: "s1", tool: "get_today", state: "start" }); await wait(400); check(); onLine({ type: "step", id: "s1", tool: "get_today", state: "done" });
      const reply = await backend.chat(input);
      for (const e of reply.events) {
        if (e.type === "logged") { onLine({ type: "step", id: "s2", tool: "log_meal", detail: e.name, state: "start" }); await wait(500); check(); onLine({ type: "event", event: e }); onLine({ type: "step", id: "s2", tool: "log_meal", detail: e.name, state: "done" }); }
        else if (e.type === "options") { onLine({ type: "step", id: "s2", tool: "suggest_options", state: "start" }); await wait(600); check(); onLine({ type: "event", event: e as never }); onLine({ type: "step", id: "s2", tool: "suggest_options", state: "done" }); }
      }
      for (const e of reply.events) if (e.type === "text") for (const w of e.text.split(/(?<= )/)) { await wait(would ? 20 : 60); check(); onLine({ type: "delta", text: w }); }
      return reply;
    },
    consent: () => Promise.resolve(),
    chatHistory: () => Promise.resolve([]),
    clientError: () => Promise.resolve(),
    usuals: () => Promise.resolve([{ kind: "meal" as const, name: "Cappuccino", kcal: 90, carbs: 7, protein: 5, fat: 5, count: 9 }, { kind: "water" as const, name: "250 ml", kcal: 0, carbs: 0, protein: 0, fat: 0, ml: 250, count: 6 }, { kind: "meal" as const, name: "Túró", kcal: 160, carbs: 6, protein: 22, fat: 5, count: 4 }, { kind: "meal" as const, name: "Oat bran, milk, jam", kcal: 415, carbs: 72, protein: 17, fat: 11, count: 3 }]),
    log: (o) => { const id = `sample-${++seq}`; list = [...list, { id, kind: "meal", name: o.name, kcal: o.kcal, carbs: o.carbs, protein: o.protein, fat: o.fat ?? 0, at: Date.now(), source: "button", estimate: false, ingredients: [] }]; return Promise.resolve({ id }); },
    unlog: (id) => { list = list.filter((e) => e.id !== id); return Promise.resolve(); },
    water: (ml) => { const id = `sample-${++seq}`; list = [...list, { id, kind: "water", name: "Water", kcal: 0, carbs: 0, protein: 0, fat: 0, ml, at: Date.now(), source: "button", estimate: false, ingredients: [] }]; return Promise.resolve({ id }); },
    entriesToday: () => Promise.resolve([...list].sort((a, b) => a.at - b.at)),
    updateEntry: (patch) => {
      const { id, time, mealType: _m, ...rest } = patch;
      list = list.map((e) => (e.id === id ? { ...e, ...rest, ...(time ? { at: (() => { const d = new Date(e.at); const [h, m] = time.split(":").map(Number); d.setHours(h ?? 0, m ?? 0, 0, 0); return d.getTime(); })() } : {}) } : e));
      return Promise.resolve(list.find((e) => e.id === id)!);
    },
    deleteEntries: (ids) => { list = list.filter((e) => !ids.includes(e.id)); return Promise.resolve(); },
    deleteAll: () => { list = []; return Promise.resolve(); },
    choice: () => Promise.resolve(),
  };
  return backend;
}
