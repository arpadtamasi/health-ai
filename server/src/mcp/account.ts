import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GoogleAccess } from "../auth/google-access.js";
import type { Sealer } from "../crypto/sealer.js";
import type { GoogleOAuth } from "../google/oauth.js";
import { logEvent } from "../log.js";
import { addTool, errorResult, textResult, type CallContext } from "./tool.js";

export interface AccountDeps {
  sealer: Sealer;
  google: GoogleOAuth;
  googleAccess: GoogleAccess;
}

/** IF-01m3eb1cqb3yah1ydzbas3hvar (delete_my_data tool). */
export function registerDeleteMyData(server: McpServer, ctx: CallContext, deps: AccountDeps): void {
  addTool(server, ctx, "delete_my_data", {
    title: "Delete my data",
    description:
      "Disconnects the user from Health AI: revokes its Google access, deletes everything Health AI stores about the user " +
      "(account, sign-in tokens, feedback, call intents) and signs out every connected client. Data in Google Health " +
      "itself is not touched. Call it only after the user explicitly asked for it, with confirm: true.",
    inputSchema: {
      confirm: z.boolean().optional().describe("Must be true: the user explicitly asked to delete their Health AI data."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  }, async ({ confirm }) => {
    if (confirm !== true) {
      return errorResult(
        "Nothing was deleted: confirmation is required. Ask the user to confirm, then call delete_my_data again with confirm: true.",
      );
    }
    const user = await ctx.store.getUser(ctx.userId);
    let googleRevoked = false;
    if (user) {
      try {
        await deps.google.revoke(await deps.sealer.open(user.googleRefreshTokenSealed));
        googleRevoked = true;
      } catch (err) {
        logEvent({ msg: "google_revoke_failed", user: ctx.userRef, error: err instanceof Error ? err.name : "unknown" });
      }
    }
    await ctx.store.deleteUserData(ctx.userId);
    deps.googleAccess.forget(ctx.userId);
    logEvent({ msg: "user_data_deleted", user: ctx.userRef, googleRevoked });
    return textResult(
      "Done. Health AI deleted everything it stored about you, and every connected client is signed out." +
        (googleRevoked
          ? " Health AI's access to your Google account was revoked."
          : " Google could not be reached to revoke access; remove Health AI at https://myaccount.google.com/permissions."),
    );
  });
}
