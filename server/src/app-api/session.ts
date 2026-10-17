// The app's browser session: a signed token in a cookie named `__session`, the only cookie Firebase Hosting forwards to
// Cloud Run. The audience differs from the MCP access tokens, so one can never be used as the other.
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "__session";
const ISSUER = "health-ai-app";
const AUDIENCE = "health-ai-app-session";
export const SESSION_TTL_SECONDS = 14 * 24 * 60 * 60;

export class Sessions {
  constructor(
    private readonly secret: Uint8Array,
    private readonly secure: boolean,
    private readonly now: () => number = Date.now,
  ) {}

  async issue(userId: string): Promise<string> {
    const iat = Math.floor(this.now() / 1000);
    return new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId).setIssuer(ISSUER).setAudience(AUDIENCE)
      .setIssuedAt(iat).setExpirationTime(iat + SESSION_TTL_SECONDS)
      .sign(this.secret);
  }

  async verify(token: string): Promise<string | undefined> {
    try {
      const { payload } = await jwtVerify(token, this.secret, { issuer: ISSUER, audience: AUDIENCE, algorithms: ["HS256"], currentDate: new Date(this.now()) });
      return typeof payload.sub === "string" ? payload.sub : undefined;
    } catch {
      return undefined;
    }
  }

  cookie(token: string): string {
    return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${this.secure ? "; Secure" : ""}`;
  }

  clearCookie(): string {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${this.secure ? "; Secure" : ""}`;
  }

  /** The user id behind the request's cookie, if the session is valid. */
  async userOf(cookieHeader: string | undefined): Promise<string | undefined> {
    const raw = cookieHeader?.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
    return raw ? this.verify(raw.slice(SESSION_COOKIE.length + 1)) : undefined;
  }
}
