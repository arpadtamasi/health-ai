// Task 2.2 · the Store contract, run against the in-memory store always and against Firestore
// when FIRESTORE_EMULATOR_HOST points at a running Firestore emulator.
import { randomUUID } from "node:crypto";
import { Firestore } from "@google-cloud/firestore";
import { describe, expect, it } from "vitest";
import { FirestoreStore } from "../../src/store/firestore.js";
import { MemoryStore } from "../../src/store/memory.js";
import type { Store } from "../../src/store/types.js";

const targets: [string, () => Store][] = [["memory", () => new MemoryStore()]];
if (process.env.FIRESTORE_EMULATOR_HOST) {
  // A fresh project id per store keeps test runs apart in one emulator.
  targets.push(["firestore", () => new FirestoreStore(new Firestore({ projectId: `test-${randomUUID()}`, ignoreUndefinedProperties: true }))]);
}

const user = (id: string) => ({
  id, email: `${id}@example.com`, grantedScopes: ["r"], googleRefreshTokenSealed: "sealed", status: "active" as const,
  createdAt: 1, updatedAt: 1,
});

describe.each(targets)("%s store", (_name, make) => {
  it("round-trips clients, users and grants", async () => {
    const s = make();
    await s.putClient({ client_id: "c1", redirect_uris: ["https://x.test/cb"], client_id_issued_at: 1 });
    expect((await s.getClient("c1"))?.redirect_uris).toEqual(["https://x.test/cb"]);
    await s.putUser(user("u1"));
    expect(await s.getUser("u1")).toEqual(user("u1"));
    expect(await s.getUser("nobody")).toBeUndefined();
    await s.putGrant({ id: "g1", userId: "u1", clientId: "c1", scopes: ["health.read"], createdAt: 1 });
    await s.revokeGrant("g1", 5);
    await s.revokeGrant("g1", 9);
    expect((await s.getGrant("g1"))?.revokedAt).toBe(5);
  });

  it("takes an auth request exactly once", async () => {
    const s = make();
    await s.putAuthRequest({ id: "r1", kind: "connect", createdAt: 1, clientId: "c1" });
    const results = await Promise.all([s.takeAuthRequest("r1"), s.takeAuthRequest("r1")]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(results.find(Boolean)).toEqual({ id: "r1", kind: "connect", createdAt: 1, clientId: "c1" });
  });

  it("marks codes, refresh tokens and nonces used exactly once", async () => {
    const s = make();
    await s.putAuthCode({ codeHash: "h", clientId: "c", userId: "u1", codeChallenge: "x", redirectUri: "r", scopes: [], createdAt: 1 });
    expect(await Promise.all([s.markAuthCodeUsed("h", 2), s.markAuthCodeUsed("h", 3)])).toEqual(expect.arrayContaining([true, false]));
    expect(await s.markAuthCodeUsed("missing", 2)).toBe(false);
    await s.putRefreshToken({ tokenHash: "t", grantId: "g", userId: "u1", createdAt: 1 });
    expect(await s.markRefreshTokenUsed("t", 2)).toBe(true);
    expect(await s.markRefreshTokenUsed("t", 3)).toBe(false);
    await s.putReconnectNonce({ nonce: "n", userId: "u1", createdAt: 1 });
    expect((await s.consumeReconnectNonce("n", 2))?.userId).toBe("u1");
    expect(await s.consumeReconnectNonce("n", 3)).toBeUndefined();
  });

  it("revokes all grants of one user only", async () => {
    const s = make();
    await s.putGrant({ id: "a", userId: "u1", clientId: "c", scopes: [], createdAt: 1 });
    await s.putGrant({ id: "b", userId: "u1", clientId: "c", scopes: [], createdAt: 1 });
    await s.putGrant({ id: "c", userId: "u2", clientId: "c", scopes: [], createdAt: 1 });
    await s.revokeGrantsOfUser("u1", 7);
    expect((await s.getGrant("a"))?.revokedAt).toBe(7);
    expect((await s.getGrant("b"))?.revokedAt).toBe(7);
    expect((await s.getGrant("c"))?.revokedAt).toBeUndefined();
  });

  it("lists feedback and intents newest first within a half-open range", async () => {
    const s = make();
    for (const [id, at] of [["f1", 100], ["f2", 200], ["f3", 300]] as const) {
      await s.putFeedback({ id, userId: "u1", source: "user", kind: "bug", tools: ["read_data"], message: id, createdAt: at, expireAt: at + 5 });
      await s.putIntent({ id, userId: "u2", tool: "read_data", intent: at === 200 ? null : id, createdAt: at, expireAt: at + 5 });
    }
    const fb = await s.listFeedback({ from: 100, to: 300 }, 10);
    expect(fb.map((f) => f.id)).toEqual(["f2", "f1"]);
    expect(fb[0]).toEqual({ id: "f2", userId: "u1", source: "user", kind: "bug", tools: ["read_data"], message: "f2", createdAt: 200, expireAt: 205 });
    expect((await s.listFeedback({ from: 0, to: 1000 }, 1)).map((f) => f.id)).toEqual(["f3"]);
    expect((await s.listIntents({ from: 0, to: 1000 })).map((i) => i.intent)).toEqual(["f3", null, "f1"]);
  });

  it("deleteUserData removes every record of that user and nothing else", async () => {
    const s = make();
    for (const u of ["u1", "u2"]) {
      await s.putUser(user(u));
      await s.putGrant({ id: `g-${u}`, userId: u, clientId: "c", scopes: [], createdAt: 1 });
      await s.putRefreshToken({ tokenHash: `t-${u}`, grantId: `g-${u}`, userId: u, createdAt: 1 });
      await s.putAuthCode({ codeHash: `h-${u}`, clientId: "c", userId: u, codeChallenge: "x", redirectUri: "r", scopes: [], createdAt: 1 });
      await s.putAuthRequest({ id: `r-${u}`, kind: "reconnect", createdAt: 1, userId: u });
      await s.putReconnectNonce({ nonce: `n-${u}`, userId: u, createdAt: 1 });
      await s.putFeedback({ id: `f-${u}`, userId: u, source: "user", kind: "bug", tools: [], message: "m", createdAt: 10, expireAt: 20 });
      await s.putIntent({ id: `i-${u}`, userId: u, tool: "x", intent: null, createdAt: 10, expireAt: 20 });
    }
    await s.deleteUserData("u1");
    expect(await s.getUser("u1")).toBeUndefined();
    expect(await s.getGrant("g-u1")).toBeUndefined();
    expect(await s.getRefreshToken("t-u1")).toBeUndefined();
    expect(await s.getAuthCode("h-u1")).toBeUndefined();
    expect(await s.takeAuthRequest("r-u1")).toBeUndefined();
    expect(await s.consumeReconnectNonce("n-u1", 2)).toBeUndefined();
    expect((await s.listFeedback({ from: 0, to: 100 }, 10)).map((f) => f.userId)).toEqual(["u2"]);
    expect((await s.listIntents({ from: 0, to: 100 })).map((i) => i.userId)).toEqual(["u2"]);
    expect(await s.getUser("u2")).toBeDefined();
    expect(await s.getGrant("g-u2")).toBeDefined();
  });
});
