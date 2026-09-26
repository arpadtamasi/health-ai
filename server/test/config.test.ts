import { describe, expect, it } from "vitest";
import { loadConfig, loadPort } from "../src/config.js";

const env = {
  PUBLIC_URL: "https://health.example.com",
  GOOGLE_CLIENT_ID: "id",
  GOOGLE_CLIENT_SECRET: "secret",
  GOOGLE_HEALTH_READ_SCOPES: "a b",
  GOOGLE_HEALTH_WRITE_SCOPES: "c,d",
  JWT_SECRET: "j".repeat(32),
  KMS_KEY_NAME: "projects/p/locations/europe-west1/keyRings/r/cryptoKeys/k",
};

const memoryEnv = {
  ...env,
  STORE: "memory",
  SEALER_KEY: Buffer.alloc(32, 1).toString("base64"),
  ALLOW_LIST: " Owner@Example.com, tester@example.com ,",
  OWNER_EMAIL: "OWNER@example.com",
};

describe("config", () => {
  it("defaults to port 8080", () => {
    expect(loadPort({})).toBe(8080);
  });

  it("rejects an invalid PORT", () => {
    expect(() => loadPort({ PORT: "abc" })).toThrow(/PORT must be an integer/);
  });

  it("parses scopes and URLs", () => {
    const c = loadConfig(env);
    expect(c.publicUrl.href).toBe("https://health.example.com/");
    expect(c.healthReadScopes).toEqual(["a", "b"]);
    expect(c.healthWriteScopes).toEqual(["c", "d"]);
  });

  it("requires the secrets", () => {
    expect(() => loadConfig({ ...env, JWT_SECRET: "" })).toThrow(/JWT_SECRET/);
    expect(() => loadConfig({ ...memoryEnv, SEALER_KEY: "short" })).toThrow(/SEALER_KEY/);
  });

  it("defaults to Firestore with Cloud KMS, and requires the KMS key", () => {
    const c = loadConfig(env);
    expect(c.store).toEqual({ kind: "firestore" });
    expect(c.sealer).toEqual({ kind: "kms", keyName: env.KMS_KEY_NAME });
    expect(() => loadConfig({ ...env, KMS_KEY_NAME: "" })).toThrow(/KMS_KEY_NAME/);
  });

  it("uses memory and a local key only when STORE=memory", () => {
    const c = loadConfig(memoryEnv);
    expect(c.store).toEqual({ kind: "memory", allowList: ["owner@example.com", "tester@example.com"], ownerEmail: "owner@example.com" });
    expect(c.sealer.kind).toBe("local");
    expect(() => loadConfig({ ...env, STORE: "postgres" })).toThrow(/STORE/);
  });
});
