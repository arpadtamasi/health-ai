// Task 3.3 · BR-01m3eb1dz1bqrx534g1g403fqw (Single sign-in grants identity and Google Health access),
// BR-01m3eb1cehbhtykqpwpgqnygxe (Access restricted to allow-listed users),
// BR-01m3eb1e9vvvzkdcxwyjjjqbhd (Google credentials are protected),
// BR-01m3eb1hxc1z2rfzkd2jcgeae2 (Connected screen before returning to the client)
import { describe, expect, it } from "vitest";
import { continueHref, makeTestApp, pkce, READ_SCOPES, REDIRECT_URI, registerClient, signIn, startAuthorize } from "../helpers.js";

describe("sign-in through Google", () => {
  it("shows the start page with what is shared before Google sign-in", async () => {
    const t = makeTestApp();
    const clientId = await registerClient(t);
    const res = await t.http.get("/authorize").query({
      response_type: "code", client_id: clientId, redirect_uri: REDIRECT_URI,
      code_challenge: pkce().challenge, code_challenge_method: "S256", state: "s",
    });
    expect(res.status).toBe(200);
    expect(res.text).toContain("Connect your Google Health data");
    expect(res.text).toContain("Health values stored by us");
    expect(res.text).toContain("Continue with Google");
    expect(continueHref(res.text)).toMatch(/^https:\/\/accounts\.google\.test\/auth\?state=/);
  });

  it("asks Google for identity, offline access and the Health scopes", async () => {
    const t = makeTestApp();
    const clientId = await registerClient(t);
    await startAuthorize(t, clientId, pkce().challenge);
    expect(t.google.lastAuth?.scopes).toEqual(expect.arrayContaining(["openid", "email", ...READ_SCOPES]));
  });

  it("grants all scopes: stores the sealed Google token, shows the Connected screen, issues tokens", async () => {
    const t = makeTestApp();
    const { token, back } = await signIn(t);
    expect(back.origin + back.pathname).toBe(REDIRECT_URI);
    expect(back.searchParams.get("state")).toBe("client-state");
    expect(token.status).toBe(200);
    expect(token.body.scope).toBe("health.read health.write");
    expect(token.body.refresh_token).toEqual(expect.any(String));

    const user = t.store.users.get("sub-owner");
    expect(user?.googleRefreshTokenSealed).not.toContain("google-refresh-owner");
    expect(await t.sealer.open(user?.googleRefreshTokenSealed ?? "")).toBe("google-refresh-owner");
  });

  it("the Connected screen continues automatically and offers an immediate button", async () => {
    const t = makeTestApp();
    t.google.account("g1");
    const clientId = await registerClient(t);
    const state = await startAuthorize(t, clientId, pkce().challenge);
    const cb = await t.http.get("/oauth/google/callback").query({ code: "g1", state });
    expect(cb.text).toMatch(/You(&#39;|')re connected/);
    expect(cb.text).toMatch(/setTimeout\(function\(\)\{location\.replace\(".*"\)\}, 1500\)/);
    expect(cb.text).toContain('id="continue"');
  });

  it("partial grant: read works, no write scope", async () => {
    const t = makeTestApp();
    const { token } = await signIn(t, "g2", { grantedScopes: ["openid", "email", ...READ_SCOPES] });
    expect(token.body.scope).toBe("health.read");
  });

  it("denied Health scopes: no tokens and the missing permissions are listed", async () => {
    const t = makeTestApp();
    t.google.account("g3", { grantedScopes: ["openid", "email"] });
    const clientId = await registerClient(t);
    const state = await startAuthorize(t, clientId, pkce().challenge);
    const cb = await t.http.get("/oauth/google/callback").query({ code: "g3", state });
    expect(cb.status).toBe(403);
    expect(cb.text).toContain("Permissions are missing");
    expect(cb.text).toContain("Read your Google Health data");
    expect(cb.text).toContain("error=access_denied");
    expect(t.store.users.size).toBe(0);
    expect(t.store.authCodes.size).toBe(0);
  });

  it("consent denied on Google's screen: permissions page with a retry", async () => {
    const t = makeTestApp();
    const clientId = await registerClient(t);
    const state = await startAuthorize(t, clientId, pkce().challenge);
    const cb = await t.http.get("/oauth/google/callback").query({ error: "access_denied", state });
    expect(cb.status).toBe(403);
    expect(cb.text).toContain("Try again");
  });

  it("non-listed account: access denied, nothing stored, Google grant revoked", async () => {
    const t = makeTestApp();
    t.google.account("g4", { sub: "sub-x", email: "stranger@example.com", refreshToken: "rt-x" });
    const clientId = await registerClient(t);
    const state = await startAuthorize(t, clientId, pkce().challenge);
    const cb = await t.http.get("/oauth/google/callback").query({ code: "g4", state });
    expect(cb.status).toBe(403);
    expect(cb.text).toMatch(/isn(&#39;|')t invited/);
    expect(t.store.users.size).toBe(0);
    expect(t.google.revoked).toEqual(["rt-x"]);
  });

  it("rejects an unknown or reused state", async () => {
    const t = makeTestApp();
    t.google.account("g5");
    const clientId = await registerClient(t);
    const state = await startAuthorize(t, clientId, pkce().challenge);
    expect((await t.http.get("/oauth/google/callback").query({ code: "g5", state })).status).toBe(200);
    expect((await t.http.get("/oauth/google/callback").query({ code: "g5", state })).status).toBe(400);
  });
});
