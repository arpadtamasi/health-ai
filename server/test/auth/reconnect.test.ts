// Task 3.6 · BR-01m3eb1eyq4j8yawgs12rtmjkp (Re-authentication when Google access is lost)
import { describe, expect, it } from "vitest";
import { ReconnectRequiredError } from "../../src/auth/google-access.js";
import { continueHref, makeTestApp, signIn } from "../helpers.js";

describe("Google access and reconnect", () => {
  it("refreshes and caches the Google access token", async () => {
    const t = makeTestApp();
    await signIn(t);
    expect(await t.googleAccess.accessToken("sub-owner")).toBe("google-at-1");
    expect(await t.googleAccess.accessToken("sub-owner")).toBe("google-at-1");
    expect(t.google.refreshCalls).toBe(1);
  });

  it("invalid_grant: a reconnect error with a link, and the user is marked", async () => {
    const t = makeTestApp();
    await signIn(t);
    t.google.refreshBehavior = "invalid_grant";
    const err = await t.googleAccess.accessToken("sub-owner").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ReconnectRequiredError);
    expect((err as ReconnectRequiredError).message).toContain("Google access expired");
    expect((err as ReconnectRequiredError).reconnectUrl).toMatch(/^http:\/\/localhost:8080\/reconnect\?t=/);
    expect(t.store.users.get("sub-owner")?.status).toBe("needs_reconnect");
  });

  it("reconnecting replaces the Google token and keeps the user record", async () => {
    const t = makeTestApp();
    await signIn(t);
    const before = t.store.users.get("sub-owner");
    t.google.refreshBehavior = "invalid_grant";
    const err = (await t.googleAccess.accessToken("sub-owner").catch((e: unknown) => e)) as ReconnectRequiredError;

    const link = new URL(err.reconnectUrl);
    const go = await t.http.get(link.pathname + link.search);
    expect(go.status).toBe(200);
    expect(go.text).toContain("Google access expired");
    expect(t.google.lastAuth?.loginHint).toBe("owner@example.com");
    const state = new URL(continueHref(go.text)).searchParams.get("state");

    t.google.account("g-re", { refreshToken: "google-refresh-new" });
    const cb = await t.http.get("/oauth/google/callback").query({ code: "g-re", state });
    expect(cb.status).toBe(200);
    expect(cb.text).toMatch(/You(&#39;|')re reconnected/);

    const after = t.store.users.get("sub-owner");
    expect(after?.status).toBe("active");
    expect(after?.createdAt).toBe(before?.createdAt);
    expect(await t.sealer.open(after?.googleRefreshTokenSealed ?? "")).toBe("google-refresh-new");

    t.google.refreshBehavior = "ok";
    await expect(t.googleAccess.accessToken("sub-owner")).resolves.toMatch(/^google-at-/);
  });

  it("a reconnect link works only once", async () => {
    const t = makeTestApp();
    await signIn(t);
    const url = new URL(await t.links.issue("sub-owner"));
    expect((await t.http.get(url.pathname + url.search)).status).toBe(200);
    const again = await t.http.get(url.pathname + url.search);
    expect(again.status).toBe(400);
    expect(again.text).toContain("expired or was already used");
  });
});
