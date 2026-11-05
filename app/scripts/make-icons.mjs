// Draws the "three grains" mark (src/components/Logo.tsx) into every icon the app, the web app and the Claude connector use.
// Run from app/: node scripts/make-icons.mjs   (needs Playwright with Chromium; the files are committed, so the deploy does not run it)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const C = { stone: "#3b403d", p: "#e07a4f", c: "#f1e8d3", f: "#7f9e47", edge: "rgba(70,52,30,.38)", speck: "#9aa39d" };
const P = (r, a) => [50 + r * Math.cos((a * Math.PI) / 180), 52 + r * Math.sin((a * Math.PI) / 180)];

/** tile: "round" (rounded square), "full" (square, the platform rounds it), "none" (grains only); scale shrinks the grains. */
function svg({ px, tile = "round", scale = 1, mono = false, specks = px >= 64 }) {
  const k = (px <= 32 ? 1.2 : 1) * scale, sw = px <= 32 || mono ? 0 : 1;
  const col = (x) => (mono ? "#000" : x);
  const [lx, ly] = P(19 * scale, -90), [rx, ry] = P(19 * scale, 30), [fx, fy] = P(19 * scale, 150);
  let s = tile === "round" ? `<rect width="100" height="100" rx="23" fill="${C.stone}"/>` : tile === "full" ? `<rect width="100" height="100" fill="${C.stone}"/>` : "";
  if (tile !== "none" && specks) {
    let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 40; i++) s += `<circle cx="${(r() * 100).toFixed(1)}" cy="${(r() * 100).toFixed(1)}" r="${(0.3 + r() * 0.5).toFixed(2)}" fill="${C.speck}" opacity="${(0.25 + r() * 0.35).toFixed(2)}"/>`;
  }
  s += `<circle cx="${lx}" cy="${ly}" r="${11.5 * k}" fill="${col(C.p)}" stroke="${C.edge}" stroke-width="${sw}"/>`;
  if (px >= 64 && !mono) s += `<circle cx="${lx - 3.5 * scale}" cy="${ly - 3.5 * scale}" r="${3 * scale}" fill="#fff" opacity=".35"/>`;
  s += `<ellipse cx="${rx}" cy="${ry}" rx="${16.5 * k}" ry="${8.5 * k}" transform="rotate(-60 ${rx} ${ry})" fill="${col(C.c)}" stroke="${C.edge}" stroke-width="${sw}"/>`;
  s += `<path d="M${fx - 17 * k} ${fy} Q${fx} ${fy - 13 * k} ${fx + 17 * k} ${fy} Q${fx} ${fy + 13 * k} ${fx - 17 * k} ${fy} Z" transform="rotate(60 ${fx} ${fy})" fill="${col(C.f)}" stroke="${C.edge}" stroke-width="${sw}"/>`;
  if (px >= 64 && !mono) s += `<path d="M${fx - 11 * scale} ${fy} Q${fx} ${fy - 6 * scale} ${fx + 11 * scale} ${fy}" transform="rotate(60 ${fx} ${fy})" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.6" stroke-linecap="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 100 100">${s}</svg>`;
}

const PNG = [
  ["assets/icon.png", { px: 1024, tile: "full" }],
  ["assets/favicon.png", { px: 48 }],
  ["assets/splash-icon.png", { px: 1024 }],
  ["assets/android-icon-foreground.png", { px: 1024, tile: "none", scale: 0.82 }],
  ["assets/android-icon-monochrome.png", { px: 1024, tile: "none", scale: 0.82, mono: true }],
  ["public/icon-192.png", { px: 192, tile: "full" }],
  ["public/icon-512.png", { px: 512, tile: "full" }],
  ["public/apple-touch-icon.png", { px: 180, tile: "full" }],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [file, o] of PNG) {
  await page.setViewportSize({ width: o.px, height: o.px });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(o)}</body></html>`);
  await page.locator("svg").screenshot({ path: file, omitBackground: true });
}
await page.setViewportSize({ width: 1024, height: 1024 });
await page.setContent(`<html><body style="margin:0"><div style="width:1024px;height:1024px;background:${C.stone}"></div></body></html>`);
await page.locator("div").screenshot({ path: "assets/android-icon-background.png" });
await browser.close();
writeFileSync("public/favicon.svg", svg({ px: 32 }));
console.log("icons written");
