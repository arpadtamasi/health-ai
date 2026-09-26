import express, { type Express } from "express";
import { mcpAuthRouter, getOAuthProtectedResourceMetadataUrl } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import type { Sealer } from "./crypto/sealer.js";
import type { GoogleOAuth } from "./google/oauth.js";
import type { Store } from "./store/types.js";
import { GoogleAccess } from "./auth/google-access.js";
import { errorPage } from "./auth/pages.js";
import { HealthOAuthProvider } from "./auth/provider.js";
import { ReconnectLinks } from "./auth/reconnect.js";
import { authRoutes } from "./auth/routes.js";
import { MCP_SCOPES } from "./auth/scopes.js";
import { AccessTokens } from "./auth/tokens.js";

export interface AppDeps {
  publicUrl: URL;
  jwtSecret: Uint8Array;
  healthReadScopes: string[];
  healthWriteScopes: string[];
  store: Store;
  sealer: Sealer;
  google: GoogleOAuth;
  now?: () => number;
}

export interface App {
  app: Express;
  provider: HealthOAuthProvider;
  tokens: AccessTokens;
  googleAccess: GoogleAccess;
  links: ReconnectLinks;
}

export function createApp(deps: AppDeps): App {
  const now = deps.now ?? Date.now;
  const mcpUrl = new URL("/mcp", deps.publicUrl);
  const tokens = new AccessTokens(deps.jwtSecret, deps.publicUrl.href, mcpUrl.href);
  const provider = new HealthOAuthProvider({ ...deps, tokens, now });
  const links = new ReconnectLinks(deps.store, deps.jwtSecret, deps.publicUrl, now);
  const googleAccess = new GoogleAccess(deps.store, deps.sealer, deps.google, links, now);

  const app = express();
  // Cloud Run and Firebase Hosting sit in front of the service.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });

  // IF-01m3eb1dc1ps80f3fbg3ve5dv3 (OAuth discovery metadata) and IF-01m3eb1dn2x3v6146zd227h8br (Client registration endpoint).
  app.use(
    mcpAuthRouter({
      provider,
      issuerUrl: deps.publicUrl,
      resourceServerUrl: mcpUrl,
      resourceName: "Health AI",
      scopesSupported: [MCP_SCOPES.read, MCP_SCOPES.write],
    }),
  );

  app.use(
    authRoutes({
      ...deps,
      links,
      now,
      onGoogleTokenReplaced: (userId) => googleAccess.forget(userId),
    }),
  );

  // BR-01m3eb1bh5h0gad7vmdj01xfc6: every MCP request carries a valid access token.
  const bearer = requireBearerAuth({ verifier: provider, resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(mcpUrl) });
  app.all("/mcp", bearer, (_req, res) => {
    // The MCP transport is wired in task 4.1.
    res.status(501).json({ error: "not_implemented" });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // BR-01m3eb1d1eddbp6nd8cm0nnjtm: log the failure class only, never tokens or health values.
    console.error(JSON.stringify({ msg: "unhandled_error", name: err instanceof Error ? err.name : "unknown" }));
    res.status(500).type("html").send(errorPage("Please try again in a moment."));
  });

  return { app, provider, tokens, googleAccess, links };
}
