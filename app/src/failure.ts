// BR-01m6rhz5t5b2p9n35twmgv4bkn (A failed message says why, and the owner can read the failure): what the person is told when a
// message did not go out, and what the owner's record holds. The photo is blamed only when the service said it could not read it.

/** The step that failed: getting the ticket, sending the message, or reading the reply. */
export type Stage = "ticket" | "send" | "reply";
export type Reason = "network" | "timeout" | "server" | "refused" | "daily_limit" | "unavailable" | "photo" | "generic";

export function reasonOf(status: number, code: string): Reason {
  if (code === "timeout") return "timeout";
  if (code === "daily_limit") return "daily_limit";
  if (code === "ai_unavailable") return "unavailable";
  if (code === "image_unreadable") return "photo";
  if (code === "network" || status === 0) return "network";
  if (status >= 500) return "server";
  if (status >= 400) return "refused";
  return "generic";
}

/** The owner's record of a failed send: no text and no photo of the message. */
export interface FailureRecord { stage: Stage; status: number; code: string; photo: boolean }
export const recordOf = (stage: Stage, status: number, code: string, photo: boolean): FailureRecord =>
  ({ stage, status: Math.max(0, Math.min(599, Math.round(status) || 0)), code: (code || "error").slice(0, 100), photo });
