// The app talks to the same origin on the web (Firebase Hosting rewrites /api/* to Cloud Run), with the __session cookie.
// Every request that changes anything also sends the custom header, as CSRF protection.
import type { DayEntry } from "../day";
import type { Option } from "../components/food";

export type { DayEntry };
export interface EntryPatch { id: string; name?: string; kcal?: number; carbs?: number; protein?: number; fat?: number; time?: string; mealType?: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER"; ingredients?: string[] }

export interface Macros { calories: number; carbs: number; protein: number; fat: number }
export interface Settings {
  goals: Macros;
  window: { startHour: number; endHour: number };
  constraints: string[];
  onboardedAt?: number;
}
export interface DayState {
  goals: Macros;
  window: { startHour: number; endHour: number };
  constraints: string[];
  eaten: Macros;
  date: string;
  minutes: number;
  timeZone: string;
  water: { ml: number; goalMl: number };
}
export type WhatNow =
  | { kind: "options"; options: Option[]; basis: string }
  | { kind: "no_ranking"; reason: "below_floor" | "nothing_fits" | "nothing_visible" };

export type ChatEvent =
  | { type: "text"; text: string }
  | { type: "options"; options: Option[]; basis: string }
  | { type: "logged"; name: string; kcal: number; id: string | null }
  | { type: "logged_water"; ml: number; id: string | null }
  | { type: "updated"; id: string; name: string; kcal: number }
  | { type: "confirm_delete"; ids: string[]; all: boolean; labels: string[] }
  | { type: "settings_saved" }
  | { type: "replies"; replies: string[] }
  | { type: "language"; language: "en" | "hu" };
export interface ChatReply { events: ChatEvent[]; needsConsent: boolean; onboarded: boolean; language: "en" | "hu" | null }
/** A stored message of the conversation (the server keeps the chat during the test). */
export interface HistoryTurn { role: "user" | "assistant"; at: number; text?: string; images?: number; events?: ChatEvent[] }
export interface ChatTurn { role: "user" | "assistant"; text: string }

export interface Usual { kind: "meal" | "water"; name: string; kcal: number; carbs: number; protein: number; fat: number; ml?: number; count: number }
export interface Me { email: string; onboarded: boolean; language: "en" | "hu" | null; healthConnected: boolean }

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, readonly body: unknown) {
    super(`API ${status} ${code}`);
  }
}

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

/** The phone's own time zone, so that "today" and "now" are the person's, wherever they are. */
function timeZone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; }
}

async function call<T>(method: "GET" | "POST" | "PUT", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api/app${path}`, {
    method,
    credentials: "include",
    headers: { "x-timezone": timeZone(), ...(body ? { "content-type": "application/json" } : {}), ...(method !== "GET" ? { "x-health-ai": "1" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, json.error ?? "error", json);
  return json as T;
}

/** The Google sign-in starts on the server; the browser comes back to the app with the session cookie. */
export const signInUrl = `${API_BASE}/api/auth/start`;
/** Connecting Google Health afterwards: the same sign-in, asking for the Health permissions. */
export const connectHealthUrl = `${API_BASE}/api/auth/connect-health`;

export const api = {
  me: () => call<Me>("GET", "/me"),
  settings: () => call<{ settings: Settings | null }>("GET", "/settings"),
  saveSettings: (s: Omit<Settings, "onboardedAt"> & { consent?: boolean }) => call<{ settings: Settings }>("PUT", "/settings", s),
  state: () => call<DayState>("GET", "/state"),
  whatNow: (input: { optionsText?: string; image?: { mediaType: "image/jpeg" | "image/png" | "image/webp"; dataBase64: string } }) => call<WhatNow>("POST", "/what-now", input),
  log: (o: { name: string; kcal: number; carbs: number; protein: number; fat?: number; ingredients?: string[]; source?: "photo" | "typed" | "button" | "chat" }) => call<{ id: string | null }>("POST", "/log", o),
  water: (ml: number) => call<{ id: string | null }>("POST", "/water", { ml }),
  deleteEntries: (ids: string[]) => call<{ deleted: number }>("POST", "/entries/delete", { ids }),
  deleteAll: () => call<{ deleted: number }>("POST", "/entries/delete-all", {}),
  unlog: (id: string) => call<{ ok: true }>("POST", "/unlog", { id }),
  entriesToday: () => call<{ entries: DayEntry[] }>("GET", "/entries/today"),
  updateEntry: (patch: EntryPatch) => call<{ entry: DayEntry }>("POST", "/entries/update", patch),
  chat: (input: { message: string; history: ChatTurn[]; images?: { mediaType: "image/jpeg" | "image/png" | "image/webp"; dataBase64: string }[] }) => call<ChatReply>("POST", "/chat", input),
  chatHistory: () => call<{ turns: HistoryTurn[] }>("GET", "/chat/history?limit=60"),
  consent: () => call<{ ok: true }>("POST", "/consent", {}),
  usuals: () => call<{ usuals: Usual[] }>("GET", "/usuals"),
  logout: () => call<{ ok: true }>("POST", "/logout"),
};
