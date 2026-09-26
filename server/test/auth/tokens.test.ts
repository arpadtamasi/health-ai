// Task 3.4 · BR-01m3eb1emh9rysqjsxn62b3rsw (MCP token lifecycle)
import { describe, expect, it } from "vitest";
import { makeTestApp, pkce, REDIRECT_URI, registerClient, signIn, startAuthorize } from "../helpers.js";

const refresh = (t: ReturnType<typeof makeTestApp>, clientId: string, rt: string) =>
  t.http.post("/token").type("form").send({ grant_type: "refresh_token", client_id: clientId, refresh_token: rt });

describe("token endpoint", () => {
  async function codeFor(t: ReturnType<typeof makeTestApp>) {
    t.google.account("g");
    const clientId = await registerClient(t);
    const { verifier, challenge } = pkce();
    const state = await startAuthorize(t, clientId, challenge);
    const cb = await t.http.get("/oauth/google/callback").query({ code: "g", state });
    const back = new URL(cb.text.match(/href="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&") ?? "");
    return { clientId, verifier, code: back.searchParams.get("code") ?? "" };
  }
  const exchange = (t: ReturnType<typeof makeTestApp>, clientId: string, code: string, verifier: string) =>
    t.http.post("/token").type("form").send({ grant_type: "authorization_code", client_id: clientId, code, code_verifier: verifier, redirect_uri: REDIRECT_URI });

  it("exchanges a code with the right PKCE verifier", async () => {
    const t = makeTestApp();
    const { clientId, verifier, code } = await codeFor(t);
    const res = await exchange(t, clientId, code, verifier);
    expect(res.status).toBe(200);
    expect(res.body.token_type).toBe("Bearer");
    expect(res.body.expires_in).toBe(900);
  });

  it("rejects a wrong PKCE verifier", async () => {
    const t = makeTestApp();
    const { clientId, code } = await codeFor(t);
    const res = await exchange(t, clientId, code, pkce().verifier);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_grant");
  });

  it("an authorization code works only once", async () => {
    const t = makeTestApp();
    const { clientId, verifier, code } = await codeFor(t);
    expect((await exchange(t, clientId, code, verifier)).status).toBe(200);
    const again = await exchange(t, clientId, code, verifier);
    expect(again.status).toBe(400);
    expect(again.body.error).toBe("invalid_grant");
  });

  it("rotates refresh tokens: the old one stops working", async () => {
    const t = makeTestApp();
    const { clientId, token } = await signIn(t);
    const first = await refresh(t, clientId, token.body.refresh_token);
    expect(first.status).toBe(200);
    expect(first.body.refresh_token).not.toBe(token.body.refresh_token);
    const second = await refresh(t, clientId, first.body.refresh_token);
    expect(second.status).toBe(200);
  });

  it("reuse of a used refresh token revokes the whole grant", async () => {
    const t = makeTestApp();
    const { clientId, token } = await signIn(t);
    const rotated = await refresh(t, clientId, token.body.refresh_token);
    const reuse = await refresh(t, clientId, token.body.refresh_token);
    expect(reuse.status).toBe(400);
    expect(reuse.body.error).toBe("invalid_grant");
    // The newer refresh token and the access token die with the grant.
    expect((await refresh(t, clientId, rotated.body.refresh_token)).status).toBe(400);
    const mcp = await t.http.post("/mcp").set("authorization", `Bearer ${rotated.body.access_token}`);
    expect(mcp.status).toBe(401);
  });
});
