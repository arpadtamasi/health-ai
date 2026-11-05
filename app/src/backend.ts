// One seam between the screens and the data: the real API (the same origin on the web) or sample data for design work.
// EXPO_PUBLIC_MOCK=1 selects the sample data.
import { api, chatStream, type ChatInput, type ChatReply, type HistoryTurn, type DayEntry, type DayState, type EntryPatch, type Me, type Usual } from "./api/client";
import type { StreamLine } from "./stream";
import type { Option } from "./components/food";

export interface Backend {
  me(): Promise<Me>;
  state(): Promise<DayState>;
  chat(input: ChatInput): Promise<ChatReply>;
  /** BR-01m6pmf9avbbgd373z1jcvvaqw: the chat, its steps and text as they come. */
  chatStream(input: ChatInput, onLine: (l: StreamLine) => void, signal?: AbortSignal): Promise<ChatReply>;
  consent(): Promise<void>;
  chatHistory(): Promise<HistoryTurn[]>;
  usuals(): Promise<Usual[]>;
  log(o: Option): Promise<{ id: string | null }>;
  unlog(id: string): Promise<void>;
  water(ml: number): Promise<{ id: string | null }>;
  entriesToday(): Promise<DayEntry[]>;
  updateEntry(patch: EntryPatch): Promise<DayEntry>;
  deleteEntries(ids: string[]): Promise<void>;
  deleteAll(): Promise<void>;
  /** US-01m3s789qmvs4jx8e93nb2j61n: records what the sheet showed and which option was logged (null when none was). */
  choice(options: Option[], chosenRank: number | null): Promise<void>;
}

export const realBackend: Backend = {
  me: () => api.me(),
  state: () => api.state(),
  chat: (input) => api.chat(input),
  chatStream: (input, onLine, signal) => chatStream(input, onLine, signal),
  consent: async () => { await api.consent(); },
  chatHistory: async () => (await api.chatHistory()).turns,
  usuals: async () => (await api.usuals()).usuals,
  log: (o) => api.log({ name: o.name, kcal: o.kcal, carbs: o.carbs, protein: o.protein, ...(o.fat !== undefined ? { fat: o.fat } : {}), ...(o.ingredients?.length ? { ingredients: o.ingredients } : {}), ...(o.rank > 0 ? { source: "photo" as const } : { source: "button" as const }) }),
  unlog: async (id) => { await api.unlog(id); },
  water: (ml) => api.water(ml),
  entriesToday: async () => (await api.entriesToday()).entries,
  updateEntry: async (patch) => (await api.updateEntry(patch)).entry,
  deleteEntries: async (ids) => { await api.deleteEntries(ids); },
  deleteAll: async () => { await api.deleteAll(); },
  choice: async (options, chosenRank) => {
    await api.choice({ options: options.map((o) => ({ rank: o.rank, name: o.name, kcal: o.kcal, carbs: o.carbs, protein: o.protein, ...(o.fat !== undefined ? { fat: o.fat } : {}) })), chosenRank });
  },
};

/**
 * EXPO_PUBLIC_MOCK=1 selects sample data for design work. The require sits in a branch that is false in a normal build, so the
 * bundler drops it and the sample data never reaches the deployed app (the deploy script checks for it).
 */
export const backend: Backend = process.env.EXPO_PUBLIC_MOCK === "1"
  ? (require("./mock/backend") as typeof import("./mock/backend")).mockBackend()
  : realBackend;
