import { createHash, randomBytes } from "node:crypto";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import request from "supertest";
import { createApp } from "../src/app.js";
import { AesGcmSealer } from "../src/crypto/sealer.js";
import {
  GoogleInvalidGrantError, type GoogleAccessResult, type GoogleAuthUrlOptions, type GoogleCodeResult, type GoogleOAuth,
} from "../src/google/oauth.js";
import { MemoryStore } from "../src/store/memory.js";

const GH = "https://www.googleapis.com/auth/googlehealth.";
export const READ_SCOPES = [`${GH}sleep.readonly`, `${GH}activity_and_fitness.readonly`, `${GH}health_metrics_and_measurements.readonly`];
export const WRITE_SCOPES = [`${GH}nutrition.writeonly`];

/** A Google Health API stand-in: records requests and answers with the handler's JSON. */
export class FakeHealth {
  readonly requests: { method: string; url: URL; body: unknown; auth: string }[] = [];
  handler: (req: { method: string; url: URL; body: unknown }) => { status?: number; json: unknown } = () => ({ json: {} });

  readonly fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    const headers = new Headers(init?.headers);
    const req = { method: init?.method ?? "GET", url, body };
    this.requests.push({ ...req, auth: headers.get("authorization") ?? "" });
    const r = this.handler(req);
    return new Response(JSON.stringify(r.json), { status: r.status ?? 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;

  last() {
    const r = this.requests.at(-1);
    if (!r) throw new Error("no Health API request was made");
    return r;
  }
}
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
  async refresh(rt: string): Promise<GoogleAccessResult> {
    this.refreshCalls++;
    if (this.refreshBehavior === "invalid_grant") throw new GoogleInvalidGrantError();
    // The access token names the refresh token it came from, so tests can tell users apart.
    return { accessToken: `google-at-${this.refreshCalls}-for-${rt}`, expiresIn: 3600 };
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
  const health = new FakeHealth();
  const sealer = new AesGcmSealer(randomBytes(32));
  const built = createApp({
    publicUrl: PUBLIC_URL,
    jwtSecret: new TextEncoder().encode("x".repeat(48)),
    healthReadScopes: READ_SCOPES,
    healthWriteScopes: WRITE_SCOPES,
    store,
    sealer,
    google,
    healthFetch: health.fetch,
    ...(opts.now ? { now: opts.now } : {}),
  });
  return { ...built, store, google, health, sealer, http: request(built.app) };
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

/** The href of the page's primary button (id="continue"). */
export function continueHref(html: string): string {
  const m = html.match(/id="continue" href="([^"]+)"/) ?? html.match(/href="([^"]+)" id="continue"/);
  return (m?.[1] ?? "").replace(/&amp;/g, "&");
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
  if (res.status !== 200) throw new Error(`authorize failed: ${res.status} ${res.text}`);
  return new URL(continueHref(res.text)).searchParams.get("state") ?? "";
}

/** Completes a full sign-in and returns the client's token response. */
export async function signIn(t: TestApp, googleCode = "g-code", over: Parameters<FakeGoogle["account"]>[1] = {}) {
  t.google.account(googleCode, over);
  const clientId = await registerClient(t);
  const { verifier, challenge } = pkce();
  const state = await startAuthorize(t, clientId, challenge);
  const cb = await t.http.get("/oauth/google/callback").query({ code: googleCode, state });
  if (cb.status !== 200) throw new Error(`callback failed: ${cb.status}`);
  const back = new URL(continueHref(cb.text));
  const token = await t.http.post("/token").type("form").send({
    grant_type: "authorization_code",
    client_id: clientId,
    code: back.searchParams.get("code"),
    code_verifier: verifier,
    redirect_uri: REDIRECT_URI,
  });
  return { clientId, token, back };
}

/** Starts the app on a free port and connects a real MCP client with the given access token. */
export async function connectMcp(t: TestApp, accessToken: string) {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { StreamableHTTPClientTransport } = await import("@modelcontextprotocol/sdk/client/streamableHttp.js");
  const listener = t.app.listen(0);
  await new Promise<void>((resolve) => listener.once("listening", () => resolve()));
  const address = listener.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`), {
    requestInit: { headers: { authorization: `Bearer ${accessToken}` } },
  });
  // The cast bridges the SDK's own optional-property types under exactOptionalPropertyTypes.
  await client.connect(transport as Transport);
  return {
    client,
    /** Calls a tool and returns its first text block and error flag. */
    async call(name: string, args: Record<string, unknown> = {}) {
      const r = await client.callTool({ name, arguments: args });
      const content = r.content as { type: string; text?: string }[];
      return { text: content[0]?.text ?? "", isError: r.isError === true };
    },
    async close() {
      await client.close();
      await new Promise<void>((resolve) => listener.close(() => resolve()));
    },
  };
}

export const TESTER = { sub: "sub-tester", email: "tester@example.com", refreshToken: "google-refresh-tester" };
