export interface GoogleAuthUrlOptions {
  state: string;
  scopes: string[];
  loginHint?: string;
}

export interface GoogleCodeResult {
  sub: string;
  email: string;
  refreshToken?: string;
  accessToken: string;
  expiresIn: number;
  grantedScopes: string[];
}

export interface GoogleAccessResult {
  accessToken: string;
  expiresIn: number;
}

/** Thrown when Google says the refresh token can no longer be used. */
export class GoogleInvalidGrantError extends Error {
  constructor() {
    super("Google refresh token is expired or revoked");
  }
}

export interface GoogleOAuth {
  authUrl(opts: GoogleAuthUrlOptions): string;
  exchangeCode(code: string): Promise<GoogleCodeResult>;
  refresh(refreshToken: string): Promise<GoogleAccessResult>;
  revoke(token: string): Promise<void>;
}

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
  error?: string;
}

/** Google OAuth 2.0 over HTTPS. */
export class HttpGoogleOAuth implements GoogleOAuth {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
  ) {}

  authUrl({ state, scopes, loginHint }: GoogleAuthUrlOptions): string {
    const url = new URL(AUTH_ENDPOINT);
    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scopes.join(" "));
    url.searchParams.set("state", state);
    // Offline access and a fresh consent so Google always returns a refresh token.
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("include_granted_scopes", "true");
    if (loginHint) url.searchParams.set("login_hint", loginHint);
    return url.toString();
  }

  async exchangeCode(code: string): Promise<GoogleCodeResult> {
    const body = await this.token({ grant_type: "authorization_code", code, redirect_uri: this.redirectUri });
    if (!body.id_token) throw new Error("Google did not return an id_token");
    // The id_token comes straight from Google's token endpoint over TLS, so its claims
    // can be read without verifying the signature (OpenID Connect Core 3.1.3.7).
    const claims = JSON.parse(Buffer.from(body.id_token.split(".")[1] ?? "", "base64url").toString("utf8")) as {
      sub?: string;
      email?: string;
    };
    if (!claims.sub || !claims.email) throw new Error("Google id_token lacks sub or email");
    return {
      sub: claims.sub,
      email: claims.email.toLowerCase(),
      ...(body.refresh_token ? { refreshToken: body.refresh_token } : {}),
      accessToken: body.access_token,
      expiresIn: body.expires_in,
      grantedScopes: (body.scope ?? "").split(" ").filter(Boolean),
    };
  }

  async refresh(refreshToken: string): Promise<GoogleAccessResult> {
    const body = await this.token({ grant_type: "refresh_token", refresh_token: refreshToken });
    return { accessToken: body.access_token, expiresIn: body.expires_in };
  }

  async revoke(token: string): Promise<void> {
    await fetch(REVOKE_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
  }

  private async token(params: Record<string, string>): Promise<TokenResponse> {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ...params, client_id: this.clientId, client_secret: this.clientSecret }),
    });
    const body = (await res.json()) as TokenResponse;
    if (body.error === "invalid_grant") throw new GoogleInvalidGrantError();
    if (!res.ok) throw new Error(`Google token endpoint returned ${res.status} (${body.error ?? "unknown"})`);
    return body;
  }
}
