import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/** Encrypts secrets at rest. Implements BR-01m3eb1e9vvvzkdcxwyjjjqbhd (Google credentials are protected). */
export interface Sealer {
  seal(plain: string): Promise<string>;
  open(sealed: string): Promise<string>;
}

/**
 * AES-256-GCM with a local key. Used in tests and local development; production uses
 * Cloud KMS envelope encryption behind the same interface (task 2.2).
 */
export class AesGcmSealer implements Sealer {
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) throw new Error("AesGcmSealer needs a 32-byte key");
  }

  async seal(plain: string): Promise<string> {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
  }

  async open(sealed: string): Promise<string> {
    const raw = Buffer.from(sealed, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", this.key, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
  }
}
