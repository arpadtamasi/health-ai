import express, { type Express } from "express";
import { mcpAuthRouter, getOAuthProtectedResourceMetadataUrl } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
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
import { HealthApi, type Fetch } from "./health/api.js";
import { logEvent, pseudonym } from "./log.js";
import { landingPage } from "./landing.js";
import { buildMcpServer } from "./mcp/server.js";

export interface AppDeps {
  publicUrl: URL;
  jwtSecret: Uint8Array;
  healthReadScopes: string[];
  healthWriteScopes: string[];
  store: Store;
  sealer: Sealer;
  google: GoogleOAuth;
  now?: () => number;
  /** fetch for Google Health API calls; tests replace it. */
  healthFetch?: Fetch;
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

  const landing = landingPage(deps.publicUrl, deps.healthWriteScopes.length > 0);
  app.get("/", (_req, res) => {
    res.type("html").send(landing);
  });

  // Cloud Run reserves paths ending in "z", so deployed checks use /health.
  app.get(["/health", "/healthz"], (_req, res) => {
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
  const pseudonymOf = (userId: string) => pseudonym(deps.jwtSecret, userId);

  // IF-01m3eb1b7edb7e1dh0rft2dq63 (MCP endpoint): stateless Streamable HTTP, one server per request (design D2).
  app.post("/mcp", bearer, express.json({ limit: "1mb" }), async (req, res, next) => {
    try {
      // BR-01m3eb1btydhctabx4d1c6zyat: the user comes from the verified token, never from tool arguments.
      const userId = String(req.auth?.extra?.["userId"] ?? "");
      const user = await deps.store.getUser(userId);
      if (!user) {
        res.status(401).json({ error: "invalid_token" });
        return;
      }
      const allow = await deps.store.getAllowEntry(user.email);
      const server = buildMcpServer(
        {
          userId,
          userRef: pseudonymOf(userId),
          pseudonymOf,
          isOwner: allow?.owner === true,
          scopes: req.auth?.scopes ?? [],
          googleScopes: user.grantedScopes,
          api: new HealthApi(() => googleAccess.accessToken(userId), deps.healthFetch),
          store: deps.store,
          now,
        },
        { sealer: deps.sealer, google: deps.google, googleAccess },
      );
      const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
      // No sessionIdGenerator: stateless mode. The cast bridges the SDK's own optional-property types.
      await server.connect(transport as Transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      next(err);
    }
  });
  // Stateless: no server-initiated streams and no sessions to end.
  app.all("/mcp", bearer, (_req, res) => {
    res.status(405).set("allow", "POST").json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // BR-01m3eb1d1eddbp6nd8cm0nnjtm: log the failure class only, never tokens or health values.
    logEvent({ msg: "unhandled_error", name: err instanceof Error ? err.name : "unknown" });
    res.status(500).type("html").send(errorPage("Please try again in a moment."));
  });

  return { app, provider, tokens, googleAccess, links };
}
