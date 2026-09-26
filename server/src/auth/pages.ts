// Minimal server-rendered pages for the sign-in flow. Task 3.7 restyles them in
// Material Design 3 per docs/designs/signin-flow-brief.md; the states and copy stay.

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

function page(title: string, body: string, head = ""): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Health AI</title>${head}</head>
<body><main><h1>${esc(title)}</h1>${body}</main></body></html>`;
}

const button = (href: string, label: string, id = ""): string =>
  `<p><a ${id ? `id="${id}" ` : ""}href="${esc(href)}">${esc(label)}</a></p>`;

/** BR-01m3eb1hxc1z2rfzkd2jcgeae2: Connected screen, continues to the client after a short delay. */
export function connectedPage(returnUrl: string, delayMs = 1500): string {
  const head = `<meta http-equiv="refresh" content="${Math.ceil(delayMs / 1000)};url=${esc(returnUrl)}">
<script>setTimeout(function(){location.replace(${JSON.stringify(returnUrl)})}, ${delayMs});</script>`;
  return page("You're connected", `<p>Return to Claude to continue.</p>${button(returnUrl, "Back to Claude", "continue")}`, head);
}

export function reconnectedPage(): string {
  return page("You're reconnected", "<p>Google access is restored. Return to Claude and ask again.</p>");
}

export function notInvitedPage(email: string): string {
  return page(
    "This account isn't invited",
    `<p>Health AI is open to invited testers only. ${esc(email)} is not on the list. Ask the owner to add it, or sign in with a different Google account.</p>`,
  );
}

export function permissionsMissingPage(missing: string[], retryUrl: string): string {
  const items = missing.map((s) => `<li>${esc(s)}</li>`).join("");
  return page(
    "Permissions are missing",
    `<p>Health AI needs these Google permissions to work:</p><ul>${items}</ul>${button(retryUrl, "Try again")}`,
  );
}

export function errorPage(message: string): string {
  return page("Something went wrong", `<p>${esc(message)}</p>`);
}
