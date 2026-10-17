// Every model call counts against one daily token limit per user, measured from the response's usage figure
// (the owner: "token, jön a response-ból"). Camera, chat and "what now" share it.
import type { Usage } from "./types.js";

export interface UsageStore {
  get(userId: string, day: string): Promise<number>;
  add(userId: string, day: string, tokens: number): Promise<number>;
}

export class MemoryUsageStore implements UsageStore {
  private readonly used = new Map<string, number>();
  get(userId: string, day: string): Promise<number> {
    return Promise.resolve(this.used.get(`${userId}|${day}`) ?? 0);
  }
  add(userId: string, day: string, tokens: number): Promise<number> {
    const key = `${userId}|${day}`;
    const next = (this.used.get(key) ?? 0) + tokens;
    this.used.set(key, next);
    return Promise.resolve(next);
  }
}

/** The day key in the user's own time zone, so the limit resets at the user's midnight. */
export function dayKey(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export class TokenBudget {
  constructor(private readonly store: UsageStore, readonly dailyLimit: number) {}

  async check(userId: string, day: string): Promise<{ allowed: boolean; used: number; limit: number }> {
    const used = await this.store.get(userId, day);
    return { allowed: used < this.dailyLimit, used, limit: this.dailyLimit };
  }

  async record(userId: string, day: string, usage: Usage): Promise<number> {
    return this.store.add(userId, day, usage.inputTokens + usage.outputTokens);
  }
}
