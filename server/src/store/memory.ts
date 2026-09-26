import type {
  AllowEntry, AuthCode, AuthRequest, ClientRecord, FeedbackRecord, Grant, IntentRecord, ReconnectNonce, RefreshToken, Store,
  TimeRange, User,
} from "./types.js";

/** In-memory store for tests and local development. Single-process only. */
export class MemoryStore implements Store {
  readonly clients = new Map<string, ClientRecord>();
  readonly authRequests = new Map<string, AuthRequest>();
  readonly authCodes = new Map<string, AuthCode>();
  readonly grants = new Map<string, Grant>();
  readonly refreshTokens = new Map<string, RefreshToken>();
  readonly users = new Map<string, User>();
  readonly allowList = new Map<string, AllowEntry>();
  readonly reconnectNonces = new Map<string, ReconnectNonce>();
  readonly feedback = new Map<string, FeedbackRecord>();
  readonly intents = new Map<string, IntentRecord>();

  allow(email: string, owner = false): void {
    this.allowList.set(email.toLowerCase(), { email: email.toLowerCase(), owner });
  }

  async getClient(id: string) { return this.clients.get(id); }
  async putClient(c: ClientRecord) { this.clients.set(c.client_id, c); }

  async putAuthRequest(r: AuthRequest) { this.authRequests.set(r.id, r); }
  async takeAuthRequest(id: string) {
    const r = this.authRequests.get(id);
    this.authRequests.delete(id);
    return r;
  }

  async putAuthCode(c: AuthCode) { this.authCodes.set(c.codeHash, c); }
  async getAuthCode(h: string) { return this.authCodes.get(h); }
  async markAuthCodeUsed(h: string, at: number) {
    const c = this.authCodes.get(h);
    if (!c || c.usedAt !== undefined) return false;
    c.usedAt = at;
    return true;
  }

  async putGrant(g: Grant) { this.grants.set(g.id, g); }
  async getGrant(id: string) { return this.grants.get(id); }
  async revokeGrant(id: string, at: number) {
    const g = this.grants.get(id);
    if (g && g.revokedAt === undefined) g.revokedAt = at;
  }
  async revokeGrantsOfUser(userId: string, at: number) {
    for (const g of this.grants.values()) if (g.userId === userId && g.revokedAt === undefined) g.revokedAt = at;
  }

  async putRefreshToken(t: RefreshToken) { this.refreshTokens.set(t.tokenHash, t); }
  async getRefreshToken(h: string) { return this.refreshTokens.get(h); }
  async markRefreshTokenUsed(h: string, at: number) {
    const t = this.refreshTokens.get(h);
    if (!t || t.usedAt !== undefined) return false;
    t.usedAt = at;
    return true;
  }

  async getUser(id: string) { return this.users.get(id); }
  async putUser(u: User) { this.users.set(u.id, u); }

  async getAllowEntry(email: string) { return this.allowList.get(email.toLowerCase()); }

  async putReconnectNonce(n: ReconnectNonce) { this.reconnectNonces.set(n.nonce, n); }
  async consumeReconnectNonce(nonce: string, at: number) {
    const n = this.reconnectNonces.get(nonce);
    if (!n || n.usedAt !== undefined) return undefined;
    n.usedAt = at;
    return n;
  }

  async putFeedback(f: FeedbackRecord) { this.feedback.set(f.id, f); }
  async listFeedback(range: TimeRange, limit: number) {
    return newestFirst([...this.feedback.values()].filter((f) => inRange(f.createdAt, range))).slice(0, limit);
  }
  async putIntent(i: IntentRecord) { this.intents.set(i.id, i); }
  async listIntents(range: TimeRange) {
    return newestFirst([...this.intents.values()].filter((i) => inRange(i.createdAt, range)));
  }

  async deleteUserData(userId: string) {
    this.users.delete(userId);
    for (const [k, g] of this.grants) if (g.userId === userId) this.grants.delete(k);
    for (const [k, t] of this.refreshTokens) if (t.userId === userId) this.refreshTokens.delete(k);
    for (const [k, c] of this.authCodes) if (c.userId === userId) this.authCodes.delete(k);
    for (const [k, r] of this.authRequests) if (r.userId === userId) this.authRequests.delete(k);
    for (const [k, n] of this.reconnectNonces) if (n.userId === userId) this.reconnectNonces.delete(k);
    for (const [k, f] of this.feedback) if (f.userId === userId) this.feedback.delete(k);
    for (const [k, i] of this.intents) if (i.userId === userId) this.intents.delete(k);
  }
}

function inRange(at: number, range: TimeRange): boolean {
  return at >= range.from && at < range.to;
}

function newestFirst<T extends { createdAt: number }>(items: T[]): T[] {
  return items.sort((a, b) => b.createdAt - a.createdAt);
}
