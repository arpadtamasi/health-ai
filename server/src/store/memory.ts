import type {
  AllowEntry, AuthCode, AuthRequest, ClientRecord, Grant, ReconnectNonce, RefreshToken, Store, User,
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
}
