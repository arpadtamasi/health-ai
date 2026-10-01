import { Router } from "express";
import type { Sessions } from "../app-api/session.js";
import type { Sealer } from "../crypto/sealer.js";
import type { GoogleOAuth } from "../google/oauth.js";
import type { AuthRequest, Store } from "../store/types.js";
import { accessExpiredPage, connectedPage, errorPage, notInvitedPage, permissionsMissingPage, reconnectedPage } from "./pages.js";
import type { ReconnectLinks } from "./reconnect.js";
import { checkGrantedScopes, describeMissing, googleScopes } from "./scopes.js";
import { AUTH_REQUEST_TTL_MS, randomToken, sha256 } from "./tokens.js";

export const GOOGLE_CALLBACK_PATH = "/oauth/google/callback";
/** Where the browser lands after the app's own sign-in. */
export const APP_HOME = "/app/";

export interface AuthRoutesDeps {
  store: Store;
  sealer: Sealer;
  google: GoogleOAuth;
  links: ReconnectLinks;
  sessions: Sessions;
  healthReadScopes: string[];
  healthWriteScopes: string[];
  onGoogleTokenReplaced?: (userId: string) => void;
  now?: () => number;
}

/** The Google callback and the reconnect link (design D3, D7). */
export function authRoutes(deps: AuthRoutesDeps): Router {
  const now = deps.now ?? Date.now;
  const router = Router();

  // A fresh request with the same parameters, for "Try again" after a denial.
  async function retryUrl(req: AuthRequest): Promise<string> {
    const id = randomToken();
    await deps.store.putAuthRequest({ ...req, id, createdAt: now() });
    return deps.google.authUrl({ state: id, scopes: googleScopes(deps), ...(req.loginHint ? { loginHint: req.loginHint } : {}) });
  }

  // OAuth error response to the client, for "Back to Claude" after a refusal.
  function backToClient(req: AuthRequest, error: string): string | undefined {
    if (req.kind !== "connect" || !req.redirectUri) return undefined;
    const u = new URL(req.redirectUri);
    u.searchParams.set("error", error);
    if (req.clientState !== undefined) u.searchParams.set("state", req.clientState);
    return u.href;
  }

  router.get(GOOGLE_CALLBACK_PATH, async (req, res, next) => {
    try {
      const state = typeof req.query.state === "string" ? req.query.state : "";
      const authReq = state ? await deps.store.takeAuthRequest(state) : undefined;
      if (!authReq || now() - authReq.createdAt > AUTH_REQUEST_TTL_MS) {
        res.status(400).type("html").send(errorPage("This sign-in link has expired. Start again from Claude."));
        return;
      }
      if (typeof req.query.error === "string") {
        // The user denied consent on Google's screen.
        const missing = describeMissing(deps, checkGrantedScopes(deps, []).missingRead);
        res.status(403).type("html").send(permissionsMissingPage(missing, await retryUrl(authReq), backToClient(authReq, "access_denied")));
        return;
      }
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const result = await deps.google.exchangeCode(code);

      // BR-01m3eb1cehbhtykqpwpgqnygxe: only allow-listed accounts; nothing is stored otherwise.
      if (!(await deps.store.getAllowEntry(result.email))) {
        await deps.google.revoke(result.refreshToken ?? result.accessToken).catch(() => undefined);
        res.status(403).type("html").send(notInvitedPage(result.email, await retryUrl(authReq), backToClient(authReq, "access_denied")));
        return;
      }

      // The app's own sign-in asks for the person's identity only: the app works without Google Health. A person who already connected
      // it keeps their connection, and one who grants it here (with offline access) is connected.
      if (authReq.kind === "app") {
        const connects = result.refreshToken !== undefined && checkGrantedScopes(deps, result.grantedScopes).missingRead.length === 0;
        const prior = await deps.store.getUser(result.sub);
        if (connects && result.refreshToken) {
          await deps.store.putUser({
            id: result.sub, email: result.email, grantedScopes: result.grantedScopes, googleRefreshTokenSealed: await deps.sealer.seal(result.refreshToken),
            status: "active", createdAt: prior?.createdAt ?? now(), updatedAt: now(),
          });
          deps.onGoogleTokenReplaced?.(result.sub);
        } else if (prior) {
          await deps.store.putUser({ ...prior, email: result.email, updatedAt: now() });
        } else {
          await deps.store.putUser({ id: result.sub, email: result.email, grantedScopes: result.grantedScopes, status: "active", createdAt: now(), updatedAt: now() });
        }
        res.setHeader("set-cookie", deps.sessions.cookie(await deps.sessions.issue(result.sub)));
        res.redirect(APP_HOME);
        return;
      }

      if (authReq.kind === "app-connect" && authReq.userId !== result.sub) {
        res.status(403).type("html").send(errorPage("That is a different Google account from the one you are signed in with. Sign in again and connect Google Health with the same account."));
        return;
      }

      // BR-01m3eb1dz1bqrx534g1g403fqw: no MCP tokens unless the Health read scopes were granted.
      const scopeCheck = checkGrantedScopes(deps, result.grantedScopes);
      if (scopeCheck.missingRead.length > 0) {
        const missing = describeMissing(deps, scopeCheck.missingRead);
        res.status(403).type("html").send(permissionsMissingPage(missing, await retryUrl(authReq), backToClient(authReq, "access_denied")));
        return;
      }
      if (!result.refreshToken) {
        res.status(502).type("html").send(errorPage("Google did not return offline access. Start again from Claude."));
        return;
      }

      // BR-01m3eb1e9vvvzkdcxwyjjjqbhd: the Google refresh token is stored sealed only.
      const existing = await deps.store.getUser(result.sub);
      await deps.store.putUser({
        id: result.sub,
        email: result.email,
        grantedScopes: result.grantedScopes,
        googleRefreshTokenSealed: await deps.sealer.seal(result.refreshToken),
        status: "active",
        createdAt: existing?.createdAt ?? now(),
        updatedAt: now(),
      });
      deps.onGoogleTokenReplaced?.(result.sub);

      if (authReq.kind === "reconnect") {
        res.type("html").send(reconnectedPage());
        return;
      }

      // Connecting Google Health afterwards, from the app: the Health permissions were granted by the person who is signed in.
      if (authReq.kind === "app-connect") {
        res.setHeader("set-cookie", deps.sessions.cookie(await deps.sessions.issue(result.sub)));
        res.redirect(APP_HOME);
        return;
      }

      const code2 = randomToken();
      await deps.store.putAuthCode({
        codeHash: sha256(code2),
        clientId: authReq.clientId ?? "",
        userId: result.sub,
        codeChallenge: authReq.codeChallenge ?? "",
        redirectUri: authReq.redirectUri ?? "",
        ...(authReq.resource ? { resource: authReq.resource } : {}),
        scopes: scopeCheck.mcpScopes,
        createdAt: now(),
      });
      const back = new URL(authReq.redirectUri ?? "");
      back.searchParams.set("code", code2);
      if (authReq.clientState !== undefined) back.searchParams.set("state", authReq.clientState);
      res.type("html").send(connectedPage(back.href));
    } catch (err) {
      next(err);
    }
  });

  // US-01m3rw2bqxkqp6v1hg9g02t1zr: the app starts its Google sign-in here (identity only); the callback above finishes it.
  router.get("/api/auth/start", async (_req, res, next) => {
    try {
      const id = randomToken();
      await deps.store.putAuthRequest({ id, kind: "app", createdAt: now() });
      res.redirect(deps.google.authUrl({ state: id, scopes: ["openid", "email"] }));
    } catch (err) {
      next(err);
    }
  });

  // US-01m3w51cs0tvb44382vsx72nsp (Connect Google Health afterwards): the signed-in person grants the Health permissions.
  router.get("/api/auth/connect-health", async (req, res, next) => {
    try {
      const userId = await deps.sessions.userOf(req.headers.cookie);
      const user = userId ? await deps.store.getUser(userId) : undefined;
      if (!user) {
        res.redirect("/api/auth/start");
        return;
      }
      const id = randomToken();
      await deps.store.putAuthRequest({ id, kind: "app-connect", createdAt: now(), userId: user.id, loginHint: user.email });
      res.redirect(deps.google.authUrl({ state: id, scopes: googleScopes(deps), loginHint: user.email }));
    } catch (err) {
      next(err);
    }
  });

  router.get("/reconnect", async (req, res, next) => {
    try {
      const t = typeof req.query.t === "string" ? req.query.t : "";
      const userId = t ? await deps.links.redeem(t) : undefined;
      const user = userId ? await deps.store.getUser(userId) : undefined;
      if (!user) {
        res.status(400).type("html").send(errorPage("This reconnect link has expired or was already used. Ask Claude again for a fresh link."));
        return;
      }
      const id = randomToken();
      await deps.store.putAuthRequest({ id, kind: "reconnect", createdAt: now(), userId: user.id, loginHint: user.email });
      res.type("html").send(accessExpiredPage(deps.google.authUrl({ state: id, scopes: googleScopes(deps), loginHint: user.email })));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
