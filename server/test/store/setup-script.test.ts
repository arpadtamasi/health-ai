// Task 4b.4 · BR-01m3ec2jxj4979r5rs0ttmqgc8 (Insight records are protected): the setup script puts a
// TTL policy on every collection whose documents carry `expireAt`, feedback and intents included.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TTL_COLLECTIONS } from "../../src/store/firestore.js";

const script = readFileSync(new URL("../../../scripts/gcp-setup.sh", import.meta.url), "utf8");

describe("scripts/gcp-setup.sh", () => {
  it("enables TTL on exactly the collections the store writes expireAt to", () => {
    const listed = script.match(/^TTL_COLLECTIONS="([^"]+)"/m)?.[1]?.split(/\s+/) ?? [];
    expect([...listed].sort()).toEqual([...TTL_COLLECTIONS].sort());
    expect(listed).toEqual(expect.arrayContaining(["feedback", "intents"]));
    expect(script).toMatch(/fields ttls update expireAt --collection-group "\$collection" --enable-ttl/);
  });
});
