import { Firestore, Timestamp, type CollectionReference, type DocumentData } from "@google-cloud/firestore";
import { AUTH_CODE_TTL_MS, AUTH_REQUEST_TTL_MS, RECONNECT_LINK_TTL_SECONDS } from "../auth/tokens.js";
import type {
  AllowEntry, AuthCode, AuthRequest, ClientRecord, FeedbackRecord, Grant, IntentRecord, ReconnectNonce, RefreshToken, Store,
  TimeRange, User,
} from "./types.js";

/** Refresh tokens (rotated or not) are removed this long after they were issued; the client then signs in again. */
export const REFRESH_TOKEN_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Collection names (design D5). Every collection with an `expireAt` field has a Firestore TTL
 * policy on it, created by `scripts/gcp-setup.sh`.
 */
export const COLLECTIONS = {
  clients: "oauthClients",
  authRequests: "authRequests",
  authCodes: "authCodes",
  grants: "grants",
  refreshTokens: "refreshTokens",
  users: "users",
  allowList: "allowList",
  reconnectNonces: "reconnectNonces",
  feedback: "feedback",
  intents: "intents",
} as const;

export const TTL_COLLECTIONS = [
  COLLECTIONS.authRequests, COLLECTIONS.authCodes, COLLECTIONS.refreshTokens, COLLECTIONS.reconnectNonces,
  COLLECTIONS.feedback, COLLECTIONS.intents,
] as const;

/** Collections whose documents carry a `userId`; `deleteUserData` empties them for one user. */
const USER_COLLECTIONS = [
  COLLECTIONS.grants, COLLECTIONS.refreshTokens, COLLECTIONS.authCodes, COLLECTIONS.authRequests,
  COLLECTIONS.reconnectNonces, COLLECTIONS.feedback, COLLECTIONS.intents,
] as const;

const expireAt = (ms: number) => Timestamp.fromMillis(ms);

/** Firestore persistence. `take`/`markUsed`/`consume` run in transactions so exactly one caller wins. */
export class FirestoreStore implements Store {
  constructor(private readonly db: Firestore) {}

  static create(options: { projectId?: string; databaseId?: string } = {}): FirestoreStore {
    return new FirestoreStore(new Firestore({ ...options, ignoreUndefinedProperties: true }));
  }

  private col(name: string) {
    return this.db.collection(name) as CollectionReference<DocumentData>;
  }

  private async get<T>(name: string, id: string): Promise<T | undefined> {
    const snap = await this.col(name).doc(id).get();
    return snap.exists ? strip<T>(snap.data()) : undefined;
  }

  async getClient(id: string) { return this.get<ClientRecord>(COLLECTIONS.clients, id); }
  async putClient(c: ClientRecord) { await this.col(COLLECTIONS.clients).doc(c.client_id).set(c); }

  async putAuthRequest(r: AuthRequest) {
    await this.col(COLLECTIONS.authRequests).doc(r.id).set({ ...r, expireAt: expireAt(r.createdAt + AUTH_REQUEST_TTL_MS) });
  }
  async takeAuthRequest(id: string) {
    const ref = this.col(COLLECTIONS.authRequests).doc(id);
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return undefined;
      tx.delete(ref);
      return strip<AuthRequest>(snap.data());
    });
  }

  async putAuthCode(c: AuthCode) {
    await this.col(COLLECTIONS.authCodes).doc(c.codeHash).set({ ...c, expireAt: expireAt(c.createdAt + AUTH_CODE_TTL_MS) });
  }
  async getAuthCode(h: string) { return this.get<AuthCode>(COLLECTIONS.authCodes, h); }
  async markAuthCodeUsed(h: string, at: number) { return this.markUsed(COLLECTIONS.authCodes, h, at); }

  async putGrant(g: Grant) { await this.col(COLLECTIONS.grants).doc(g.id).set(g); }
  async getGrant(id: string) { return this.get<Grant>(COLLECTIONS.grants, id); }
  async revokeGrant(id: string, at: number) {
    const ref = this.col(COLLECTIONS.grants).doc(id);
    await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists && snap.get("revokedAt") === undefined) tx.update(ref, { revokedAt: at });
    });
  }
  async revokeGrantsOfUser(userId: string, at: number) {
    const snaps = await this.col(COLLECTIONS.grants).where("userId", "==", userId).get();
    const batch = this.db.batch();
    for (const d of snaps.docs) if (d.get("revokedAt") === undefined) batch.update(d.ref, { revokedAt: at });
    await batch.commit();
  }

  async putRefreshToken(t: RefreshToken) {
    await this.col(COLLECTIONS.refreshTokens).doc(t.tokenHash).set({ ...t, expireAt: expireAt(t.createdAt + REFRESH_TOKEN_RETENTION_MS) });
  }
  async getRefreshToken(h: string) { return this.get<RefreshToken>(COLLECTIONS.refreshTokens, h); }
  async markRefreshTokenUsed(h: string, at: number) { return this.markUsed(COLLECTIONS.refreshTokens, h, at); }

  async getUser(id: string) { return this.get<User>(COLLECTIONS.users, id); }
  async putUser(u: User) { await this.col(COLLECTIONS.users).doc(u.id).set(u); }

  async getAllowEntry(email: string) { return this.get<AllowEntry>(COLLECTIONS.allowList, email.toLowerCase()); }

  async putReconnectNonce(n: ReconnectNonce) {
    await this.col(COLLECTIONS.reconnectNonces).doc(n.nonce)
      .set({ ...n, expireAt: expireAt(n.createdAt + RECONNECT_LINK_TTL_SECONDS * 1000) });
  }
  async consumeReconnectNonce(nonce: string, at: number) {
    const ref = this.col(COLLECTIONS.reconnectNonces).doc(nonce);
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.get("usedAt") !== undefined) return undefined;
      tx.update(ref, { usedAt: at });
      return { ...strip<ReconnectNonce>(snap.data()), usedAt: at };
    });
  }

  async putFeedback(f: FeedbackRecord) {
    await this.col(COLLECTIONS.feedback).doc(f.id).set({ ...f, expireAt: expireAt(f.expireAt) });
  }
  async listFeedback(range: TimeRange, limit: number) {
    const snaps = await this.inRange(COLLECTIONS.feedback, range).limit(limit).get();
    return snaps.docs.map((d) => withMillis<FeedbackRecord>(d.data()));
  }
  async putIntent(i: IntentRecord) {
    await this.col(COLLECTIONS.intents).doc(i.id).set({ ...i, expireAt: expireAt(i.expireAt) });
  }
  async listIntents(range: TimeRange) {
    const snaps = await this.inRange(COLLECTIONS.intents, range).get();
    return snaps.docs.map((d) => withMillis<IntentRecord>(d.data()));
  }

  async deleteUserData(userId: string) {
    const writer = this.db.bulkWriter();
    for (const name of USER_COLLECTIONS) {
      const snaps = await this.col(name).where("userId", "==", userId).get();
      for (const d of snaps.docs) void writer.delete(d.ref);
    }
    void writer.delete(this.col(COLLECTIONS.users).doc(userId));
    await writer.close();
  }

  private inRange(name: string, range: TimeRange) {
    return this.col(name).where("createdAt", ">=", range.from).where("createdAt", "<", range.to).orderBy("createdAt", "desc");
  }

  private async markUsed(name: string, id: string, at: number): Promise<boolean> {
    const ref = this.col(name).doc(id);
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.get("usedAt") !== undefined) return false;
      tx.update(ref, { usedAt: at });
      return true;
    });
  }
}

/** Drops the storage-only `expireAt` field. */
function strip<T>(data: DocumentData | undefined): T {
  const rest = { ...data };
  delete rest["expireAt"];
  return rest as T;
}

/** Turns the stored `expireAt` timestamp back into epoch milliseconds. */
function withMillis<T>(data: DocumentData): T {
  const ttl = data["expireAt"] as Timestamp | undefined;
  return { ...data, expireAt: ttl?.toMillis() ?? 0 } as T;
}
