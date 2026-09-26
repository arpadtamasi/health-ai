import type { Response } from "express";
import type { AuthorizationParams, OAuthServerProvider } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import {
  InvalidClientMetadataError, InvalidGrantError, InvalidTokenError,
} from "@modelcontextprotocol/sdk/server/auth/errors.js";
import type {
  OAuthClientInformationFull, OAuthTokenRevocationRequest, OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import type { GoogleOAuth } from "../google/oauth.js";
import type { Store } from "../store/types.js";
import { ACCESS_TOKEN_TTL_SECONDS, AUTH_CODE_TTL_MS, type AccessTokens, randomToken, sha256 } from "./tokens.js";
import { startPage } from "./pages.js";
import { googleScopes } from "./scopes.js";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** IF-01m3eb1dn2x3v6146zd227h8br: only HTTPS or loopback redirect URIs may be registered. */
export function isAllowedRedirectUri(uri: string): boolean {
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.hash) return false;
  if (url.protocol === "https:") return true;
  return url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname);
}

export interface ProviderDeps {
  store: Store;
  google: GoogleOAuth;
  tokens: AccessTokens;
  healthReadScopes: string[];
  healthWriteScopes: string[];
  now?: () => number;
}

/**
 * The MCP authorization server, federating sign-in to Google (design D3).
 * Keeps BR-01m3eb1emh9rysqjsxn62b3rsw (MCP token lifecycle) and
 * BR-01m3eb1bh5h0gad7vmdj01xfc6 (Every MCP request is authenticated).
 */
export class HealthOAuthProvider implements OAuthServerProvider {
  private readonly now: () => number;

  constructor(private readonly deps: ProviderDeps) {
    this.now = deps.now ?? Date.now;
  }

  get clientsStore(): OAuthRegisteredClientsStore {
    const { store } = this.deps;
    return {
      getClient: (id) => store.getClient(id),
      registerClient: async (client) => {
        const bad = client.redirect_uris.filter((u) => !isAllowedRedirectUri(String(u)));
        if (bad.length > 0) {
          throw new InvalidClientMetadataError(`redirect_uris must use https or a loopback address: ${bad.join(", ")}`);
        }
        const full = client as OAuthClientInformationFull;
        await store.putClient(full);
        return full;
      },
    };
  }

  async authorize(client: OAuthClientInformationFull, params: AuthorizationParams, res: Response): Promise<void> {
    const id = randomToken();
    await this.deps.store.putAuthRequest({
      id,
      kind: "connect",
      createdAt: this.now(),
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      ...(params.state !== undefined ? { clientState: params.state } : {}),
      ...(params.resource ? { resource: params.resource.href } : {}),
    });
    // The start page shows what is shared before Google sign-in (signin-flow-brief, state "Start").
    const googleUrl = this.deps.google.authUrl({ state: id, scopes: googleScopes(this.deps) });
    res.status(200).type("html").send(startPage(googleUrl, this.deps.healthWriteScopes.length > 0));
  }

  async challengeForAuthorizationCode(_client: OAuthClientInformationFull, code: string): Promise<string> {
    const record = await this.deps.store.getAuthCode(sha256(code));
    if (!record) throw new InvalidGrantError("unknown authorization code");
    return record.codeChallenge;
  }

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    code: string,
    _verifier?: string,
    redirectUri?: string,
  ): Promise<OAuthTokens> {
    const { store } = this.deps;
    const hash = sha256(code);
    const record = await store.getAuthCode(hash);
    if (!record || record.clientId !== client.client_id) throw new InvalidGrantError("unknown authorization code");
    if (this.now() - record.createdAt > AUTH_CODE_TTL_MS) throw new InvalidGrantError("authorization code expired");
    if (redirectUri !== undefined && redirectUri !== record.redirectUri) throw new InvalidGrantError("redirect_uri mismatch");
    if (!(await store.markAuthCodeUsed(hash, this.now()))) throw new InvalidGrantError("authorization code already used");

    const grantId = randomToken();
    await store.putGrant({ id: grantId, userId: record.userId, clientId: client.client_id, scopes: record.scopes, createdAt: this.now() });
    return this.issue(grantId, record.userId, client.client_id, record.scopes);
  }

  async exchangeRefreshToken(client: OAuthClientInformationFull, refreshToken: string): Promise<OAuthTokens> {
    const { store } = this.deps;
    const hash = sha256(refreshToken);
    const record = await store.getRefreshToken(hash);
    if (!record) throw new InvalidGrantError("unknown refresh token");
    const grant = await store.getGrant(record.grantId);
    if (!grant || grant.clientId !== client.client_id || grant.revokedAt !== undefined) {
      throw new InvalidGrantError("refresh token is not valid");
    }
    if (!(await store.markRefreshTokenUsed(hash, this.now()))) {
      // Reuse of a rotated refresh token: revoke the whole grant.
      await store.revokeGrant(grant.id, this.now());
      throw new InvalidGrantError("refresh token reuse detected; the grant was revoked");
    }
    return this.issue(grant.id, grant.userId, grant.clientId, grant.scopes);
  }

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    let claims;
    try {
      claims = await this.deps.tokens.verify(token);
    } catch {
      throw new InvalidTokenError("invalid or expired access token");
    }
    const grant = await this.deps.store.getGrant(claims.grantId);
    if (!grant || grant.revokedAt !== undefined) throw new InvalidTokenError("access token was revoked");
    const user = await this.deps.store.getUser(claims.userId);
    if (!user) throw new InvalidTokenError("access token was revoked");
    return {
      token,
      clientId: claims.clientId,
      scopes: claims.scopes,
      expiresAt: claims.expiresAt,
      extra: { userId: claims.userId, grantId: claims.grantId },
    };
  }

  async revokeToken(_client: OAuthClientInformationFull, request: OAuthTokenRevocationRequest): Promise<void> {
    const refresh = await this.deps.store.getRefreshToken(sha256(request.token));
    if (refresh) {
      await this.deps.store.revokeGrant(refresh.grantId, this.now());
      return;
    }
    try {
      const claims = await this.deps.tokens.verify(request.token);
      await this.deps.store.revokeGrant(claims.grantId, this.now());
    } catch {
      // Unknown or invalid tokens are ignored, as RFC 7009 requires.
    }
  }

  private async issue(grantId: string, userId: string, clientId: string, scopes: string[]): Promise<OAuthTokens> {
    const refresh = randomToken();
    await this.deps.store.putRefreshToken({ tokenHash: sha256(refresh), grantId, createdAt: this.now() });
    return {
      access_token: await this.deps.tokens.sign({ userId, clientId, grantId, scopes }),
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      refresh_token: refresh,
      scope: scopes.join(" "),
    };
  }
}
