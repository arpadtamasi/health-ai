// Server-rendered pages of the sign-in flow, in plain Material Design 3
// (docs/designs/signin-flow-brief.md). No health values are ever shown here.

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

// Material Icons paths (Apache-2.0), inlined so pages never depend on an icon font.
const ICONS: Record<string, string> = {
  favorite: "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z",
  bedtime: "M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-12.09-8.43-8.32-14.96z",
  restaurant: "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z",
  lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
  login: "M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z",
  check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  schedule: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  block: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z",
  error: "M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
  lock_open: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
};

const STYLE = `
:root{color-scheme:light dark;
--md-primary:#39608f;--md-on-primary:#ffffff;--md-primary-container:#d3e4ff;--md-on-primary-container:#1e4875;
--md-secondary-container:#d7e3f8;--md-on-secondary-container:#3c4758;--md-tertiary-container:#f5d9ff;--md-on-tertiary-container:#533f5e;--md-error-container:#ffdad6;--md-on-error-container:#93000a;
--md-surface:#f8f9ff;--md-surface-container-low:#f2f3fa;--md-surface-container-high:#e7e8ee;
--md-on-surface:#191c20;--md-on-surface-variant:#43474e;--md-outline-variant:#c3c6cf}
@media (prefers-color-scheme:dark){:root{
--md-primary:#a3c9fe;--md-on-primary:#00315b;--md-primary-container:#1e4875;--md-on-primary-container:#d3e4ff;
--md-secondary-container:#3c4758;--md-on-secondary-container:#d7e3f8;--md-tertiary-container:#533f5e;--md-on-tertiary-container:#f5d9ff;--md-error-container:#93000a;--md-on-error-container:#ffdad6;
--md-surface:#111418;--md-surface-container-low:#191c20;--md-surface-container-high:#272a2f;
--md-on-surface:#e1e2e8;--md-on-surface-variant:#c3c6cf;--md-outline-variant:#43474e}}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--md-surface);color:var(--md-on-surface)}
body{font-family:"Roboto Flex",Roboto,system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;line-height:1.5;
padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0)}
.ms{width:24px;height:24px;fill:currentColor;flex:none;display:block}
.shell{max-width:480px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column}
.appbar{height:64px;display:flex;align-items:center;gap:12px;padding:0 20px;font-size:18px;font-weight:500}
.logo{width:32px;height:32px;border-radius:8px;background:var(--md-primary-container);color:var(--md-on-primary-container);display:grid;place-items:center}
.logo .ms{width:20px;height:20px}
main{flex:1;display:flex;flex-direction:column;gap:16px;padding:8px 20px 24px}
main.center{align-items:center;text-align:center;justify-content:center;padding-bottom:64px}
.steps{display:flex;gap:6px}.steps span{height:4px;flex:1;border-radius:2px;background:var(--md-surface-container-high)}
.steps span.on{background:var(--md-primary)}
.overline{font-size:12px;font-weight:500;letter-spacing:.5px;color:var(--md-on-surface-variant);margin:0}
h1{margin:0;font-size:28px;line-height:36px;font-weight:400;text-wrap:balance}
p{margin:0}.body{font-size:14px;line-height:20px;color:var(--md-on-surface-variant);max-width:40ch}
.list{list-style:none;margin:0;padding:0;background:var(--md-surface-container-low);border-radius:16px;overflow:hidden;text-align:left;align-self:stretch}
.item{display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center;padding:12px 16px;min-height:56px}
.item+.item{border-top:1px solid var(--md-outline-variant)}
.icon{width:40px;height:40px;border-radius:50%;background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:grid;place-items:center}
.t{font-size:15px;line-height:20px}.s{font-size:12.5px;line-height:16px;color:var(--md-on-surface-variant)}
.chip{font-size:12px;font-weight:500;padding:4px 10px;border-radius:8px;border:1px solid var(--md-outline-variant);color:var(--md-on-surface-variant);white-space:nowrap}
.actions{display:flex;flex-direction:column;gap:8px;align-self:stretch;margin-top:auto}
main.center .actions{margin-top:8px}
.btn{min-height:48px;border-radius:24px;background:var(--md-primary);color:var(--md-on-primary);display:flex;align-items:center;justify-content:center;
gap:8px;font-weight:500;font-size:15px;letter-spacing:.1px;text-decoration:none;padding:0 24px}
.btn.text{background:transparent;color:var(--md-primary);min-height:40px}
.btn:focus-visible{outline:3px solid var(--md-primary);outline-offset:3px}
.btn:hover{filter:brightness(1.06)}
.note{font-size:12px;line-height:16px;color:var(--md-on-surface-variant);text-align:center}
.badge{width:72px;height:72px;border-radius:50%;display:grid;place-items:center}.badge .ms{width:40px;height:40px}
.ok{background:var(--md-primary-container);color:var(--md-on-primary-container)}
.warn{background:var(--md-tertiary-container);color:var(--md-on-tertiary-container)}
.err{background:var(--md-error-container);color:var(--md-on-error-container)}
.progress{width:120px;height:4px;border-radius:2px;background:var(--md-surface-container-high);overflow:hidden}
.progress span{display:block;height:100%;width:100%;background:var(--md-primary);transform-origin:left;animation:fill var(--delay) linear forwards}
@keyframes fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@media (prefers-reduced-motion:reduce){.progress span{animation:none}}
`;

const FONTS = `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,400;8..144,500&display=swap">`;

function page(title: string, main: string, opts: { center?: boolean; head?: string } = {}): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="referrer" content="no-referrer">
<title>${esc(title)} · Health AI</title>${FONTS}<style>${STYLE}</style>${opts.head ?? ""}</head>
<body><div class="shell"><header class="appbar"><span class="logo" aria-hidden="true">${icon("favorite")}</span>Health AI</header>
<main${opts.center ? ' class="center"' : ""}>${main}</main></div></body></html>`;
}

const icon = (name: string): string =>
  `<svg class="ms" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[name] ?? ""}"/></svg>`;
const badge = (kind: "ok" | "warn" | "err", name: string): string => `<span class="badge ${kind}">${icon(name)}</span>`;
const button = (href: string, label: string, opts: { id?: string; text?: boolean; icon?: string } = {}): string =>
  `<a class="btn${opts.text ? " text" : ""}"${opts.id ? ` id="${opts.id}"` : ""} href="${esc(href)}">${opts.icon ? icon(opts.icon) : ""}${esc(label)}</a>`;
const steps = (current: number): string =>
  `<div class="steps" role="img" aria-label="Step ${current} of 3">${[1, 2, 3].map((n) => `<span${n <= current ? ' class="on"' : ""}></span>`).join("")}</div>`;

const TESTING_NOTE = `<p class="note">Testing access · invited accounts only</p>`;

/** Start: what is shared, then Google sign-in. */
export function startPage(googleUrl: string, writeRequested: boolean): string {
  const rows = [
    ["bedtime", "Sleep, heart rate, activity", "", "Read"],
    ...(writeRequested ? [["restaurant", "Meals and water you log", "", "Read and write"]] : []),
    ["lock", "Health values stored by us", "Delete your data at any time", "None"],
  ];
  const list = rows
    .map(([i, t, s, c]) => `<li class="item"><span class="icon">${icon(i ?? "")}</span><div><div class="t">${esc(t ?? "")}</div>${s ? `<div class="s">${esc(s)}</div>` : ""}</div><span class="chip">${esc(c ?? "")}</span></li>`)
    .join("");
  return page(
    "Connect your Google Health data",
    `${steps(2)}<p class="overline">Connecting from Claude</p><h1>Connect your Google Health data</h1>
<p class="body">Sign in with Google once. Claude can then read your Fitbit data and log meals for you.</p>
<ul class="list" aria-label="What is shared">${list}</ul>
<div class="actions">${button(googleUrl, "Continue with Google", { icon: "login", id: "continue" })}${TESTING_NOTE}</div>`,
  );
}

/** BR-01m3eb1hxc1z2rfzkd2jcgeae2: Connected screen, continues to the client after a short delay. */
export function connectedPage(returnUrl: string, delayMs = 1500): string {
  const head = `<meta http-equiv="refresh" content="${Math.ceil(delayMs / 1000)};url=${esc(returnUrl)}">
<script>setTimeout(function(){location.replace(${JSON.stringify(returnUrl)})}, ${delayMs});</script>`;
  return page(
    "You're connected",
    `${badge("ok", "check")}<h1>You're connected</h1><p class="body">Returning to Claude…</p>
<div class="progress" style="--delay:${delayMs}ms" aria-hidden="true"><span></span></div>
<div class="actions">${button(returnUrl, "Back to Claude", { id: "continue" })}</div>`,
    { center: true, head },
  );
}

export function reconnectedPage(): string {
  return page(
    "You're reconnected",
    `${badge("ok", "check")}<h1>You're reconnected</h1><p class="body">Google access is restored. Return to Claude and ask again. You can close this tab.</p>`,
    { center: true },
  );
}

/** Reconnect link landing: explains the weekly re-sign-in during testing. */
export function accessExpiredPage(googleUrl: string): string {
  return page(
    "Google access expired",
    `${badge("warn", "schedule")}<h1>Google access expired</h1>
<p class="body">While Health AI is in testing, Google asks you to sign in again about once a week. Your data and experiments are kept.</p>
<div class="actions">${button(googleUrl, "Reconnect", { id: "continue" })}</div>`,
    { center: true },
  );
}

export function notInvitedPage(email: string, retryUrl?: string, backUrl?: string): string {
  return page(
    "This account isn't invited",
    `${badge("err", "block")}<h1>This account isn't invited</h1>
<p class="body">Health AI is open to invited testers only. ${esc(email)} is not on the list. Ask the owner to add it, or sign in with a different Google account.</p>
<div class="actions">${retryUrl ? button(retryUrl, "Use another account") : ""}${backUrl ? button(backUrl, "Back to Claude", { text: true }) : ""}</div>`,
    { center: true },
  );
}

export function permissionsMissingPage(missing: string[], retryUrl: string, backUrl?: string): string {
  const items = missing.map((m) => `<li class="item"><span class="icon">${icon("lock_open")}</span><div><div class="t">${esc(m)}</div></div><span></span></li>`).join("");
  return page(
    "Permissions are missing",
    `${badge("warn", "lock")}<h1>Permissions are missing</h1>
<p class="body">Health AI needs these Google permissions to work. On Google's screen, keep them selected.</p>
<ul class="list">${items}</ul>
<div class="actions">${button(retryUrl, "Try again")}${backUrl ? button(backUrl, "Back to Claude", { text: true }) : ""}</div>`,
    { center: true },
  );
}

export function errorPage(message: string): string {
  return page(
    "Something went wrong",
    `${badge("err", "error")}<h1>Something went wrong</h1><p class="body">${esc(message)}</p>`,
    { center: true },
  );
}
