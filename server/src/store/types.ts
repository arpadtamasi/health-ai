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
}
