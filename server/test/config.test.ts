import { describe, expect, it } from "vitest";
import { loadConfig, loadPort } from "../src/config.js";

const env = {
  PUBLIC_URL: "https://health.example.com",
  GOOGLE_CLIENT_ID: "id",
  GOOGLE_CLIENT_SECRET: "secret",
  GOOGLE_HEALTH_READ_SCOPES: "a b",
  GOOGLE_HEALTH_WRITE_SCOPES: "c,d",
  JWT_SECRET: "j".repeat(32),
  SEALER_KEY: Buffer.alloc(32, 1).toString("base64"),
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
    expect(() => loadConfig({ ...env, SEALER_KEY: "short" })).toThrow(/SEALER_KEY/);
  });
});
