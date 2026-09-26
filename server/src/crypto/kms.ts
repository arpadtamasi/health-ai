import { randomBytes } from "node:crypto";
import { KeyManagementServiceClient } from "@google-cloud/kms";
import { AesGcmSealer, type Sealer } from "./sealer.js";

/** Wraps and unwraps data keys with a key that never leaves its service. */
export interface KeyWrapper {
  wrap(dataKey: Buffer): Promise<Buffer>;
  unwrap(wrapped: Buffer): Promise<Buffer>;
}

const PREFIX = "kms1";

/**
 * Envelope encryption (design D4): every secret gets a fresh 256-bit data key, the secret is
 * sealed with AES-256-GCM under it, and the data key is stored wrapped by Cloud KMS.
 * Keeps BR-01m3eb1e9vvvzkdcxwyjjjqbhd (Google credentials are protected).
 */
export class EnvelopeSealer implements Sealer {
  constructor(private readonly wrapper: KeyWrapper) {}

  async seal(plain: string): Promise<string> {
    const dataKey = randomBytes(32);
    const body = await new AesGcmSealer(dataKey).seal(plain);
    const wrapped = await this.wrapper.wrap(dataKey);
    return `${PREFIX}.${wrapped.toString("base64url")}.${body}`;
  }

  async open(sealed: string): Promise<string> {
    const [prefix, wrapped, body] = sealed.split(".");
    if (prefix !== PREFIX || !wrapped || !body) throw new Error("not an envelope-sealed value");
    const dataKey = await this.wrapper.unwrap(Buffer.from(wrapped, "base64url"));
    return new AesGcmSealer(dataKey).open(body);
  }
}

/** Cloud KMS as the key wrapper. `keyName` is `projects/…/locations/…/keyRings/…/cryptoKeys/…`. */
export function cloudKmsWrapper(keyName: string, client = new KeyManagementServiceClient()): KeyWrapper {
  return {
    async wrap(dataKey) {
      const [res] = await client.encrypt({ name: keyName, plaintext: dataKey });
      if (!res.ciphertext) throw new Error("KMS returned no ciphertext");
      return Buffer.from(res.ciphertext);
    },
    async unwrap(wrapped) {
      const [res] = await client.decrypt({ name: keyName, ciphertext: wrapped });
      if (!res.plaintext) throw new Error("KMS returned no plaintext");
      return Buffer.from(res.plaintext);
    },
  };
}
