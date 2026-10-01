// Components: small functions that return markup from tokens. Screens only compose these.
// Names match what the Expo build should call its components (AppBar, Card, PaceRow, ...).
const T = require("./tokens");
const c = T.color, r = T.radius, s = T.space;
const x = Object.assign({ display: T.font.family, titleWeight: 500, nameWeight: 700, cardBorder: "none", optionBorder: "none",
  rankBg: c.secondaryContainer, onRank: c.onSecondaryContainer, rankTopBg: c.onPrimary, onRankTop: c.primary, userBubble: c.primaryGradient, onUserBubble: c.onPrimary,
  cameraBg: c.primaryContainer, onCamera: c.onPrimaryContainer, sendBg: c.primaryGradient, track: c.surfaceHigh, planMark: c.onSurface, inputBg: c.surfaceHigh,
  bubbleRadius: 18, chipSelectedBorder: c.primary }, T.style || {});
const esc = (x) => String(x).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]);

const ICONS = require("./food-icons");
// Drawn in currentColor, sized to the surrounding text (1.15em), so chips, cards and list avatars all set it by color and font-size.
const UiIcon = (name, size = "1em") => `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS.ui[name]}</svg>`;
const FoodIcon = (category) => `<svg aria-hidden="true" viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.2em;flex:none">${ICONS[T.icons[category] || T.icons.other]}</svg>`;

const css = `${T.font.url ? `@import url("${T.font.url}");` : ""}*{box-sizing:border-box}body{margin:0;width:${T.size.screenW}px;height:${T.size.screenH}px;background:${c.surface};color:${c.onSurface};
font:${T.font.base}px/1.5 ${T.font.family};position:relative;overflow:hidden}
.status{height:44px;display:flex;justify-content:space-between;align-items:center;padding:0 26px;font-size:14px;font-weight:600}
.col{display:flex;flex-direction:column}.row{display:flex;align-items:center}.gap-s{gap:${s.s}px}.gap-m{gap:${s.m}px}.gap-l{gap:${s.l}px}
.grow{flex:1}.between{justify-content:space-between}.pad{padding:0 ${s.xl}px}.muted{color:${c.onSurfaceVariant}}.small{font-size:${T.font.body}px}
b{font-weight:${x.nameWeight}}.num{font-variant-numeric:tabular-nums}
.overline{font-size:${T.font.overline}px;letter-spacing:${x.overlineTracking || ".5px"};font-weight:${x.overlineWeight || 500};font-family:${x.display};color:${c.onSurfaceVariant}}
.sample{position:absolute;left:0;right:0;bottom:6px;text-align:center;font-size:10px;color:${c.onSurfaceVariant}}`;

const Screen = (body, { time = "14:20" } = {}) =>
  `<!doctype html><meta charset="utf-8"><style>${css}</style><body><div class="status"><span>${time}</span><span>●●● ▮</span></div>${body}<div class="sample">Mockup · sample values</div>`;

const AppBar = ({ title, back = false, logo = "" }) =>
  `<div class="row gap-m pad" style="height:56px;font-size:${x.appBarSize || 18}px;font-weight:${x.titleWeight};font-family:${x.display};letter-spacing:${x.titleTracking || "normal"}">${back ? '<span style="display:grid">${UiIcon("arrow-left", "24px")}</span>' : ""}${logo}<span>${esc(title)}</span></div>`;

const Card = (inner, { tone = "low", pad = s.l } = {}) => {
  const bg = { low: c.surfaceLow, warn: c.warnContainer, good: c.goodContainer, primary: c.primaryContainer }[tone];
  const fg = { low: c.onSurface, warn: c.onWarnContainer, good: c.good, primary: c.onPrimaryContainer }[tone];
  return `<div style="background:${bg};color:${fg};border-radius:${r.card}px;padding:${pad}px;border:${tone === "low" ? x.cardBorder : "none"}">${inner}</div>`;
};

const Button = (label, { kind = "primary", full = true, sub = "", large = false } = {}) => {
  const st = { primary: `background:${c.primaryGradient};color:${c.onPrimary}`, tonal: `background:${c.primaryContainer};color:${c.onPrimaryContainer}`, text: `background:none;color:${c.primary}` }[kind];
  return `<div class="col" style="${full ? "" : "display:inline-flex;"}${st};min-height:${large ? 76 : T.size.button}px;border-radius:${large ? 28 : r.button}px;align-items:center;justify-content:center;font-weight:500;font-size:${large ? 20 : T.font.base}px;padding:0 ${s.xl}px">${esc(label)}${sub ? `<span style="font-size:12px;font-weight:400;opacity:.85">${esc(sub)}</span>` : ""}</div>`;
};

const Chip = (label, { selected = false, icon = "" } = {}) =>
  `<span style="padding:8px 14px;border-radius:${r.chip}px;font-size:14px;font-weight:${selected ? 600 : 400};border:${x.chipBorderW || 1}px solid ${selected ? x.chipSelectedBorder : c.outline};background:${selected ? c.primaryContainer : c.surface};color:${selected ? c.onPrimaryContainer : c.onSurface}">${icon ? FoodIcon(icon) + " " : ""}${esc(label)}</span>`;

const PaceRow = ({ label, gap, behind = false, eaten = 0, plan = 0 }) =>
  `<div><div class="row between"><span>${esc(label)}</span><span class="small" style="color:${behind ? c.warn : c.onSurfaceVariant};font-weight:${behind ? 700 : 400}">${esc(gap)}</span></div>
<div style="position:relative;margin-top:6px"><div style="height:8px;border-radius:${r.bar}px;background:${c.surfaceHigh}"><div style="width:${eaten}%;height:100%;border-radius:${r.bar}px;background:${behind ? c.behind : c.good}"></div></div>
<div style="position:absolute;left:${plan}%;top:-4px;height:16px;width:2px;background:${c.onSurface}"></div></div></div>`;

const RankBadge = (n) => `<span style="width:28px;height:28px;border-radius:50%;background:${n === 1 ? x.rankTopBg : x.rankBg};color:${n === 1 ? x.onRankTop : x.onRank};font-family:${x.display};display:grid;place-items:center;font-weight:700;font-size:14px;flex:none">${n}</span>`;

const OptionCard = ({ rank, name, macros, reason, primary = false, icon = "other", compact = false }) =>
  `<div style="background:${primary ? c.primaryGradient : c.surfaceLow};color:${primary ? c.onPrimary : c.onSurface};border-radius:${r.card}px;padding:${compact ? s.m : s.l}px;border:${primary ? "none" : x.optionBorder}" class="col gap-s">
<div class="row gap-m">${RankBadge(rank)}<b style="font-size:18px;font-family:${x.display};letter-spacing:${x.titleTracking || "normal"}" class="grow">${esc(name)}</b><span style="font-size:24px">${FoodIcon(icon)}</span></div>
<div class="small num" style="opacity:.9">${esc(macros)}</div>${reason ? `<div class="small" style="opacity:.85">${esc(reason)}</div>` : ""}</div>`;

const Banner = (text, { tone = "warn" } = {}) => Card(`<span class="small">${text}</span>`, { tone, pad: s.m });

const ListItem = ({ title, sub = "", trailing = "", icon = "other" }) =>
  `<div class="row gap-m" style="padding:10px 0"><span style="width:40px;height:40px;border-radius:50%;background:${c.secondaryContainer};color:${c.onSecondaryContainer};display:grid;place-items:center;font-size:20px">${FoodIcon(icon)}</span><div class="grow"><div>${esc(title)}</div>${sub ? `<div class="small muted">${esc(sub)}</div>` : ""}</div>${trailing}</div>`;

const Viewfinder = ({ hint, height = 500 }) =>
  `<div style="height:${height}px;background:linear-gradient(160deg,#5b4636,#a98b6a 45%,#6d5a45);position:relative">
<div style="position:absolute;top:20px;left:20px;color:#fff">${UiIcon("x", "26px")}</div>
<div style="position:absolute;left:40px;right:40px;top:120px;bottom:130px;border:2px solid #fff9;border-radius:${r.card}px"></div>
<div style="position:absolute;bottom:96px;width:100%;text-align:center;color:#fff;font-size:14px">${esc(hint)}</div>
<div style="position:absolute;bottom:20px;left:50%;margin-left:-34px;width:68px;height:68px;border-radius:50%;border:4px solid #fff;background:#fff4"></div></div>`;

const Input = (placeholder) => `<div style="border:1px solid ${c.outline};border-radius:${r.chip}px;padding:12px 14px;color:${c.onSurfaceVariant};font-size:15px">${esc(placeholder)}</div>`;

const ChatBubble = (text, { from = "assistant" } = {}) => from === "user"
  ? `<div style="align-self:flex-end;background:${x.userBubble};color:${x.onUserBubble};padding:10px 14px;border-radius:${x.bubbleRadius}px ${x.bubbleRadius}px 4px ${x.bubbleRadius}px;max-width:82%">${text}</div>`
  : `<div style="align-self:flex-start;background:${c.surfaceLow};border:${x.cardBorder};padding:10px 14px;border-radius:${x.bubbleRadius}px ${x.bubbleRadius}px ${x.bubbleRadius}px 4px;max-width:86%">${text}</div>`;
const ChatInput = (placeholder) => `<div class="row between" style="background:${x.inputBg};border:${x.cardBorder};border-radius:28px;padding:6px 6px 6px 18px"><span class="small muted">${esc(placeholder)}</span><span style="width:44px;height:44px;border-radius:50%;background:${x.sendBg};color:${c.onPrimary};display:grid;place-items:center">${UiIcon("arrow-up", "20px")}</span></div>`;

const PaceStrip = (items) => Card(`<div class="row" style="gap:${s.m}px">${items.map((i) => `<div class="grow"><div class="row between" style="font-size:12px;white-space:nowrap;gap:4px"><span class="muted">${esc(i.label)}</span><b class="num" style="font-family:${x.display};color:${i.behind ? c.warn : c.onSurfaceVariant}">${esc(i.gap)}</b></div>
<div style="position:relative;margin-top:4px"><div style="height:${x.barH || 6}px;border-radius:${r.bar}px;background:${x.track}"><div style="width:${i.eaten}%;height:100%;border-radius:${r.bar}px;background:${i.behind ? c.behind : c.good}"></div></div><div style="position:absolute;left:${i.plan}%;top:-3px;height:${(x.barH || 6) + 6}px;width:2px;background:${x.planMark}"></div></div></div>`).join("")}</div>`, { pad: 12 });

// A ring: eaten against the goal, with a tick where the plan for this time of day stands (the same idea as the bar's tick).
const Ring = ({ size = 112, stroke = 12, eaten = 0, plan = 0, behind = false, center = "", sub = "", hideCenter = false }) => {
  const rad = (size - stroke) / 2, circ = 2 * Math.PI * rad, mid = size / 2;
  const a = (plan / 100) * 2 * Math.PI - Math.PI / 2;
  const tick = (len) => `x1="${mid + Math.cos(a) * (rad - len)}" y1="${mid + Math.sin(a) * (rad - len)}" x2="${mid + Math.cos(a) * (rad + len)}" y2="${mid + Math.sin(a) * (rad + len)}"`;
  return `<div style="position:relative;width:${size}px;height:${size}px;flex:none"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<circle cx="${mid}" cy="${mid}" r="${rad}" fill="none" stroke="${x.track}" stroke-width="${stroke}"/>
<circle cx="${mid}" cy="${mid}" r="${rad}" fill="none" stroke="${behind ? c.behind : c.good}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(Math.min(eaten, 100) / 100) * circ} ${circ}" transform="rotate(-90 ${mid} ${mid})"/>
<line ${tick(stroke / 2 + 2)} stroke="${x.planMark}" stroke-width="3" stroke-linecap="round"/></svg>
${hideCenter ? "" : `<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;line-height:1.1"><div><div class="num" style="font-family:${x.display};font-size:${Math.round(size / 4.2)}px;font-weight:700">${esc(center)}</div><div style="font-size:11px;color:${c.onSurfaceVariant}">${esc(sub)}</div></div></div>`}</div>`;
};

// The home's hero: the biggest gap of the day, in words and one large number.
const Hero = ({ overline, big, text }) => `<div style="background:${c.primary};color:${c.onPrimary};border-radius:28px;padding:16px 20px 16px">
<div class="overline" style="color:${c.onPrimary};opacity:.8">${esc(overline)}</div>
<div class="num" style="font-family:${x.display};font-size:44px;line-height:1.05;font-weight:700;margin-top:2px;white-space:nowrap">${esc(big)}</div>
<div style="font-size:15px;opacity:.9;margin-top:4px">${esc(text)}</div></div>`;

const CameraInput = (placeholder, { disabled = false } = {}) => `<div class="row" style="gap:${s.s}px"><span style="width:48px;height:48px;border-radius:50%;background:${disabled ? c.surfaceHigh : x.cameraBg};color:${x.onCamera};display:grid;place-items:center;font-size:22px;flex:none;opacity:${disabled ? .5 : 1}">${UiIcon("camera", "22px")}</span>
<div class="row between grow" style="background:${x.inputBg};border:${x.cardBorder};border-radius:28px;padding:5px 5px 5px 16px"><span class="small muted">${esc(placeholder)}</span><span style="width:42px;height:42px;border-radius:50%;background:${disabled ? (x.disabledSend || c.outline) : x.sendBg};color:${c.onPrimary};display:grid;place-items:center">${UiIcon("arrow-up", "20px")}</span></div></div>`;

const PhotoBubble = (text) => `<div style="align-self:flex-end;background:${x.userBubble};color:${x.onUserBubble};padding:6px;border-radius:${x.bubbleRadius}px ${x.bubbleRadius}px 4px ${x.bubbleRadius}px;max-width:78%">
<div style="width:200px;height:56px;border-radius:14px;background:linear-gradient(160deg,#5b4636,#a98b6a 45%,#6d5a45)"></div><div style="padding:8px 8px 4px">${text}</div></div>`;

const Stack = (children, gap = s.l) => `<div class="col" style="gap:${gap}px">${children.join("")}</div>`;
const Row = (children, gap = s.m) => `<div class="row" style="gap:${gap}px;flex-wrap:wrap">${children.join("")}</div>`;
const Pad = (inner) => `<div class="pad">${inner}</div>`;

module.exports = { UiIcon, Screen, AppBar, Card, Button, Chip, PaceRow, RankBadge, OptionCard, Banner, ListItem, Viewfinder, Input, PaceStrip, Ring, Hero, CameraInput, PhotoBubble, FoodIcon, ChatBubble, ChatInput, Stack, Row, Pad, esc };
