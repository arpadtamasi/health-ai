// Task 2.2 · BR-01m3eb1e9vvvzkdcxwyjjjqbhd (Google credentials are protected)
import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { EnvelopeSealer, type KeyWrapper } from "../../src/crypto/kms.js";
import { AesGcmSealer } from "../../src/crypto/sealer.js";

/** Stands in for Cloud KMS: wraps data keys under a key the test holds. */
function fakeKms(): KeyWrapper & { calls: number } {
  const kek = new AesGcmSealer(randomBytes(32));
  return {
    calls: 0,
    async wrap(dataKey) {
      this.calls++;
      return Buffer.from(await kek.seal(dataKey.toString("base64")), "base64url");
    },
    async unwrap(wrapped) {
      return Buffer.from(await kek.open(wrapped.toString("base64url")), "base64");
    },
  };
}

describe("EnvelopeSealer", () => {
  it("round-trips and never stores the secret in plain text", async () => {
    const kms = fakeKms();
    const sealer = new EnvelopeSealer(kms);
    const sealed = await sealer.seal("1//google-refresh-token");
    expect(sealed).not.toContain("google-refresh-token");
    expect(sealed.startsWith("kms1.")).toBe(true);
    expect(await sealer.open(sealed)).toBe("1//google-refresh-token");
  });

  it("uses a fresh data key for every secret", async () => {
    const kms = fakeKms();
    const sealer = new EnvelopeSealer(kms);
    const [a, b] = [await sealer.seal("same"), await sealer.seal("same")];
    expect(a.split(".")[1]).not.toBe(b.split(".")[1]);
    expect(kms.calls).toBe(2);
  });

  it("cannot be opened with another key or after tampering", async () => {
    const sealed = await new EnvelopeSealer(fakeKms()).seal("secret");
    await expect(new EnvelopeSealer(fakeKms()).open(sealed)).rejects.toThrow();
    const kms = fakeKms();
    const own = await new EnvelopeSealer(kms).seal("secret");
    const tampered = own.slice(0, -2) + (own.endsWith("A") ? "BB" : "AA");
    await expect(new EnvelopeSealer(kms).open(tampered)).rejects.toThrow();
    await expect(new EnvelopeSealer(kms).open("plain-value")).rejects.toThrow();
  });
});
