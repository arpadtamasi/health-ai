import type { Sealer } from "../crypto/sealer.js";
import { GoogleInvalidGrantError, type GoogleOAuth } from "../google/oauth.js";
import type { Store } from "../store/types.js";
import type { ReconnectLinks } from "./reconnect.js";

/** Tools turn this into an actionable error: Google access expired, with a reconnect link. */
export class ReconnectRequiredError extends Error {
  constructor(readonly reconnectUrl: string) {
    super(`Google access expired. Ask the user to reconnect Health AI by opening this link: ${reconnectUrl}`);
  }
}

/**
 * Hands out Google access tokens for a user, refreshing them as needed.
 * Access tokens are cached per instance only (design D4); refresh tokens stay sealed.
 * Keeps BR-01m3eb1eyq4j8yawgs12rtmjkp (Re-authentication when Google access is lost).
 */
export class GoogleAccess {
  private readonly cache = new Map<string, { token: string; expiresAt: number }>();

  constructor(
    private readonly store: Store,
    private readonly sealer: Sealer,
    private readonly google: GoogleOAuth,
    private readonly links: ReconnectLinks,
    private readonly now: () => number = Date.now,
  ) {}

  async accessToken(userId: string): Promise<string> {
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt - 60_000 > this.now()) return cached.token;

    const user = await this.store.getUser(userId);
    if (!user) throw new Error("unknown user");
    if (user.status === "needs_reconnect") throw new ReconnectRequiredError(await this.links.issue(userId));
    try {
      const fresh = await this.google.refresh(await this.sealer.open(user.googleRefreshTokenSealed));
      this.cache.set(userId, { token: fresh.accessToken, expiresAt: this.now() + fresh.expiresIn * 1000 });
      return fresh.accessToken;
    } catch (err) {
      if (!(err instanceof GoogleInvalidGrantError)) throw err;
      this.cache.delete(userId);
      await this.store.putUser({ ...user, status: "needs_reconnect", updatedAt: this.now() });
      throw new ReconnectRequiredError(await this.links.issue(userId));
    }
  }

  forget(userId: string): void {
    this.cache.delete(userId);
  }
}
