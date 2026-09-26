import { createHash, randomBytes } from "node:crypto";
import request from "supertest";
import { createApp } from "../src/app.js";
import { AesGcmSealer } from "../src/crypto/sealer.js";
import {
  GoogleInvalidGrantError, type GoogleAccessResult, type GoogleAuthUrlOptions, type GoogleCodeResult, type GoogleOAuth,
} from "../src/google/oauth.js";
import { MemoryStore } from "../src/store/memory.js";

export const READ_SCOPES = ["https://www.googleapis.com/auth/health.read"];
export const WRITE_SCOPES = ["https://www.googleapis.com/auth/health.write"];
export const PUBLIC_URL = new URL("http://localhost:8080");

/** A Google stand-in: each code maps to the account and scopes the test wants. */
export class FakeGoogle implements GoogleOAuth {
  readonly codes = new Map<string, GoogleCodeResult>();
  readonly revoked: string[] = [];
  lastAuth?: GoogleAuthUrlOptions;
  refreshBehavior: "ok" | "invalid_grant" = "ok";
  refreshCalls = 0;

  authUrl(opts: GoogleAuthUrlOptions): string {
    this.lastAuth = opts;
    const u = new URL("https://accounts.google.test/auth");
    u.searchParams.set("state", opts.state);
    return u.href;
  }
  async exchangeCode(code: string): Promise<GoogleCodeResult> {
    const r = this.codes.get(code);
    if (!r) throw new Error("unknown fake code");
    return r;
  }
  async refresh(_rt: string): Promise<GoogleAccessResult> {
    this.refreshCalls++;
    if (this.refreshBehavior === "invalid_grant") throw new GoogleInvalidGrantError();
    return { accessToken: `google-at-${this.refreshCalls}`, expiresIn: 3600 };
  }
  async revoke(token: string): Promise<void> {
    this.revoked.push(token);
  }
  account(code: string, over: Partial<GoogleCodeResult> = {}): void {
    this.codes.set(code, {
      sub: "sub-owner",
      email: "owner@example.com",
      refreshToken: "google-refresh-owner",
      accessToken: "google-at-0",
      expiresIn: 3600,
      grantedScopes: ["openid", "email", ...READ_SCOPES, ...WRITE_SCOPES],
      ...over,
    });
  }
}

export function makeTestApp(opts: { now?: () => number } = {}) {
  const store = new MemoryStore();
  store.allow("owner@example.com", true);
  store.allow("tester@example.com");
  const google = new FakeGoogle();
  const sealer = new AesGcmSealer(randomBytes(32));
  const built = createApp({
    publicUrl: PUBLIC_URL,
    jwtSecret: new TextEncoder().encode("x".repeat(48)),
    healthReadScopes: READ_SCOPES,
    healthWriteScopes: WRITE_SCOPES,
    store,
    sealer,
    google,
    ...(opts.now ? { now: opts.now } : {}),
  });
  return { ...built, store, google, sealer, http: request(built.app) };
}

export type TestApp = ReturnType<typeof makeTestApp>;

export function pkce() {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export const REDIRECT_URI = "https://claude.ai/api/mcp/auth_callback";

export async function registerClient(t: TestApp, redirectUris = [REDIRECT_URI]): Promise<string> {
  const res = await t.http.post("/register").send({ redirect_uris: redirectUris, client_name: "Test client", token_endpoint_auth_method: "none" });
  if (res.status !== 201) throw new Error(`registration failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.client_id as string;
}

/** Runs /authorize and returns the state the server sent to Google. */
export async function startAuthorize(t: TestApp, clientId: string, challenge: string): Promise<string> {
  const res = await t.http.get("/authorize").query({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: "client-state",
    resource: new URL("/mcp", PUBLIC_URL).href,
  });
  if (res.status !== 302) throw new Error(`authorize failed: ${res.status} ${res.text}`);
  return new URL(res.headers.location as string).searchParams.get("state") ?? "";
}

/** Completes a full sign-in and returns the client's token response. */
export async function signIn(t: TestApp, googleCode = "g-code", over: Parameters<FakeGoogle["account"]>[1] = {}) {
  t.google.account(googleCode, over);
  const clientId = await registerClient(t);
  const { verifier, challenge } = pkce();
  const state = await startAuthorize(t, clientId, challenge);
  const cb = await t.http.get("/oauth/google/callback").query({ code: googleCode, state });
  if (cb.status !== 200) throw new Error(`callback failed: ${cb.status}`);
  const back = new URL(cb.text.match(/href="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&") ?? "");
  const token = await t.http.post("/token").type("form").send({
    grant_type: "authorization_code",
    client_id: clientId,
    code: back.searchParams.get("code"),
    code_verifier: verifier,
    redirect_uri: REDIRECT_URI,
  });
  return { clientId, token, back };
}
