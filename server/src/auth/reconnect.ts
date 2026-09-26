import { SignJWT, jwtVerify } from "jose";
import type { Store } from "../store/types.js";
import { RECONNECT_LINK_TTL_SECONDS, randomToken } from "./tokens.js";

/**
 * Signed, single-use reconnect links (design D7).
 * Keeps BR-01m3eb1eyq4j8yawgs12rtmjkp (Re-authentication when Google access is lost).
 */
export class ReconnectLinks {
  constructor(
    private readonly store: Store,
    private readonly secret: Uint8Array,
    private readonly publicUrl: URL,
    private readonly now: () => number = Date.now,
  ) {}

  async issue(userId: string): Promise<string> {
    const nonce = randomToken();
    await this.store.putReconnectNonce({ nonce, userId, createdAt: this.now() });
    const t = await new SignJWT({ typ: "reconnect", nonce })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt(Math.floor(this.now() / 1000))
      .setExpirationTime(Math.floor(this.now() / 1000) + RECONNECT_LINK_TTL_SECONDS)
      .sign(this.secret);
    return new URL(`/reconnect?t=${t}`, this.publicUrl).href;
  }

  /** Returns the user id when the link is valid and not used before; consumes it. */
  async redeem(t: string): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(t, this.secret);
      if (payload.typ !== "reconnect" || typeof payload.nonce !== "string" || typeof payload.sub !== "string") return undefined;
      const nonce = await this.store.consumeReconnectNonce(payload.nonce, this.now());
      return nonce && nonce.userId === payload.sub ? payload.sub : undefined;
    } catch {
      return undefined;
    }
  }
}
