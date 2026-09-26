import type { OAuthClientInformationFull } from "@modelcontextprotocol/sdk/shared/auth.js";

export type ClientRecord = OAuthClientInformationFull;

/** A pending /authorize or reconnect, keyed by the `state` sent to Google. */
export interface AuthRequest {
  id: string;
  kind: "connect" | "reconnect";
  createdAt: number;
  clientId?: string;
  redirectUri?: string;
  codeChallenge?: string;
  clientState?: string;
  resource?: string;
  /** For reconnects: the user the link was issued to. */
  userId?: string;
  loginHint?: string;
}

export interface AuthCode {
  codeHash: string;
  clientId: string;
  userId: string;
  codeChallenge: string;
  redirectUri: string;
  resource?: string;
  scopes: string[];
  createdAt: number;
  usedAt?: number;
}

export interface Grant {
  id: string;
  userId: string;
  clientId: string;
  scopes: string[];
  createdAt: number;
  revokedAt?: number;
}

export interface RefreshToken {
  tokenHash: string;
  grantId: string;
  userId: string;
  createdAt: number;
  usedAt?: number;
}

export interface User {
  /** Google account id (`sub`). */
  id: string;
  email: string;
  grantedScopes: string[];
  /** Google refresh token, sealed; never stored in plain text. */
  googleRefreshTokenSealed: string;
  status: "active" | "needs_reconnect";
  createdAt: number;
  updatedAt: number;
}

export interface AllowEntry {
  email: string;
  owner?: boolean;
}

export interface ReconnectNonce {
  nonce: string;
  userId: string;
  createdAt: number;
  usedAt?: number;
}

export const FEEDBACK_SOURCES = ["user", "agent"] as const;
export const FEEDBACK_KINDS = ["bug", "confusing", "too_many_calls", "missing_capability", "other"] as const;

/** Feedback about the service, readable only by the owner (design D6b). */
export interface FeedbackRecord {
  id: string;
  userId: string;
  source: (typeof FEEDBACK_SOURCES)[number];
  kind: (typeof FEEDBACK_KINDS)[number];
  tools: string[];
  message: string;
  createdAt: number;
  /** Firestore TTL field: 90 days after `createdAt`. */
  expireAt: number;
}

/** Why a tool was called; `intent` is null when the agent sent none. */
export interface IntentRecord {
  id: string;
  userId: string;
  tool: string;
  intent: string | null;
  createdAt: number;
  /** Firestore TTL field: 90 days after `createdAt`. */
  expireAt: number;
}

/** A half-open time range [from, to) in epoch milliseconds. */
export interface TimeRange {
  from: number;
  to: number;
}

/**
 * Persistence for the authorization server. Methods named `take`/`markUsed`/`consume`
 * must be atomic: they succeed for exactly one caller.
 */
export interface Store {
  getClient(clientId: string): Promise<ClientRecord | undefined>;
  putClient(client: ClientRecord): Promise<void>;

  putAuthRequest(req: AuthRequest): Promise<void>;
  takeAuthRequest(id: string): Promise<AuthRequest | undefined>;

  putAuthCode(code: AuthCode): Promise<void>;
  getAuthCode(codeHash: string): Promise<AuthCode | undefined>;
  markAuthCodeUsed(codeHash: string, at: number): Promise<boolean>;

  putGrant(grant: Grant): Promise<void>;
  getGrant(id: string): Promise<Grant | undefined>;
  revokeGrant(id: string, at: number): Promise<void>;
  revokeGrantsOfUser(userId: string, at: number): Promise<void>;

  putRefreshToken(token: RefreshToken): Promise<void>;
  getRefreshToken(tokenHash: string): Promise<RefreshToken | undefined>;
  markRefreshTokenUsed(tokenHash: string, at: number): Promise<boolean>;

  getUser(id: string): Promise<User | undefined>;
  putUser(user: User): Promise<void>;

  getAllowEntry(email: string): Promise<AllowEntry | undefined>;

  putReconnectNonce(nonce: ReconnectNonce): Promise<void>;
  consumeReconnectNonce(nonce: string, at: number): Promise<ReconnectNonce | undefined>;

  putFeedback(record: FeedbackRecord): Promise<void>;
  /** All users' feedback in the range, newest first. Owner tools only. */
  listFeedback(range: TimeRange, limit: number): Promise<FeedbackRecord[]>;
  putIntent(record: IntentRecord): Promise<void>;
  /** All users' intent records in the range, newest first. Owner tools only. */
  listIntents(range: TimeRange): Promise<IntentRecord[]>;

  /**
   * Deletes everything stored for the user: the user record, grants, refresh tokens,
   * authorization codes, reconnect nonces, feedback and intents.
   */
  deleteUserData(userId: string): Promise<void>;
}
