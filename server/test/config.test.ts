import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("defaults to port 8080", () => {
    expect(loadConfig({}).port).toBe(8080);
  });

  it("reads PORT", () => {
    expect(loadConfig({ PORT: "3000" }).port).toBe(3000);
  });

  it("rejects an invalid PORT", () => {
    expect(() => loadConfig({ PORT: "abc" })).toThrow(/PORT must be an integer/);
  });
});
