import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const AUTH_CODE_TTL_MS = 2 * 60 * 1000;
export const AUTH_REQUEST_TTL_MS = 10 * 60 * 1000;
export const RECONNECT_LINK_TTL_SECONDS = 60 * 60;

export const randomToken = (): string => randomBytes(32).toString("base64url");
export const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

export interface AccessClaims {
  userId: string;
  clientId: string;
  grantId: string;
  scopes: string[];
  expiresAt: number;
}

/** Signs and verifies the server's own MCP access tokens (HS256). */
export class AccessTokens {
  constructor(
    private readonly secret: Uint8Array,
    private readonly issuer: string,
    private readonly audience: string,
  ) {}

  async sign(c: Omit<AccessClaims, "expiresAt">, ttlSeconds = ACCESS_TOKEN_TTL_SECONDS): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ cid: c.clientId, gid: c.grantId, scope: c.scopes.join(" "), typ: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(c.userId)
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt(now)
      .setExpirationTime(now + ttlSeconds)
      .sign(this.secret);
  }

  async verify(token: string): Promise<AccessClaims> {
    const { payload } = await jwtVerify(token, this.secret, { issuer: this.issuer, audience: this.audience });
    if (payload.typ !== "access" || typeof payload.sub !== "string") throw new Error("not an access token");
    return {
      userId: payload.sub,
      clientId: String(payload.cid),
      grantId: String(payload.gid),
      scopes: String(payload.scope ?? "").split(" ").filter(Boolean),
      expiresAt: Number(payload.exp),
    };
  }
}
