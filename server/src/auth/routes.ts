import { Router } from "express";
import type { Sealer } from "../crypto/sealer.js";
import type { GoogleOAuth } from "../google/oauth.js";
import type { AuthRequest, Store } from "../store/types.js";
import { connectedPage, errorPage, notInvitedPage, permissionsMissingPage, reconnectedPage } from "./pages.js";
import type { ReconnectLinks } from "./reconnect.js";
import { checkGrantedScopes, googleScopes } from "./scopes.js";
import { AUTH_REQUEST_TTL_MS, randomToken, sha256 } from "./tokens.js";

export const GOOGLE_CALLBACK_PATH = "/oauth/google/callback";

export interface AuthRoutesDeps {
  store: Store;
  sealer: Sealer;
  google: GoogleOAuth;
  links: ReconnectLinks;
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
        const missing = checkGrantedScopes(deps, []).missingRead;
        res.status(403).type("html").send(permissionsMissingPage(missing, await retryUrl(authReq)));
        return;
      }
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const result = await deps.google.exchangeCode(code);

      // BR-01m3eb1cehbhtykqpwpgqnygxe: only allow-listed accounts; nothing is stored otherwise.
      if (!(await deps.store.getAllowEntry(result.email))) {
        await deps.google.revoke(result.refreshToken ?? result.accessToken).catch(() => undefined);
        res.status(403).type("html").send(notInvitedPage(result.email));
        return;
      }

      // BR-01m3eb1dz1bqrx534g1g403fqw: no MCP tokens unless the Health read scopes were granted.
      const scopeCheck = checkGrantedScopes(deps, result.grantedScopes);
      if (scopeCheck.missingRead.length > 0) {
        res.status(403).type("html").send(permissionsMissingPage(scopeCheck.missingRead, await retryUrl(authReq)));
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
      res.redirect(deps.google.authUrl({ state: id, scopes: googleScopes(deps), loginHint: user.email }));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
