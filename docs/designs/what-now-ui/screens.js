// Screens: composed only from components. Change a component or a token and every screen follows.
const fs = require("fs");
const path = require("path");
const K = require("./components");
const T = require("./tokens");
const { UiIcon, FoodIcon, Screen, AppBar, Card, Button, Chip, PaceRow, OptionCard, Banner, ListItem, Viewfinder, Input, ChatBubble, ChatInput, PaceStrip, Ring, Hero, CameraInput, PhotoBubble, Stack, Row, Pad } = K;

const heart = fs.readFileSync(path.join(__dirname, "../../../server/src/auth/pages.ts"), "utf8").match(/favorite: "([^"]+)"/)[1];
const logo = `<span style="width:32px;height:32px;border-radius:8px;background:${T.color.primary};display:grid;place-items:center"><svg viewBox="0 0 24 24" width="20" fill="#fff"><path d="${heart}"/></svg></span>`;

const logoSvg = (px) => `<svg viewBox="0 0 24 24" width="${px}" fill="#fff"><path d="${heart}"/></svg>`;
const strip = () => PaceStrip([
  { label: "Calories", gap: "−209", eaten: 38, plan: 49 },
  { label: "Carbs", gap: "−50 g", behind: true, eaten: 27, plan: 49 },
  { label: "Protein", gap: "−13 g", eaten: 37, plan: 49 },
]);
const usuals = Row([Chip("Glass", { icon: "water" }), Chip("Cappuccino", { icon: "coffee" }), Chip("Oat bran", { icon: "grain" }), Chip("Apple", { icon: "fruit" })], 8);
const chatBody = (inner) => `<div class="col gap-m" style="height:560px;overflow:hidden">${inner}</div>`;

const ring = (label, center, sub, gap, eaten, behind = false, size = 106) => `<div class="col" style="align-items:center;gap:6px">${Ring({ size, eaten, plan: 49, behind, center, sub })}<div style="font-weight:600;font-size:14px">${label}</div><div class="small" style="color:${behind ? T.color.warn : T.color.onSurfaceVariant};font-weight:${behind ? 700 : 400}">${gap}</div></div>`;
const rings = () => `<div style="background:${T.color.surfaceLow};border-radius:28px;padding:12px 8px"><div style="display:grid;grid-template-columns:1fr 1fr;row-gap:10px">
${ring("Calories", "720", "of 1,900", "209 under", 38)}${ring("Carbs", "62 g", "of 230 g", "50 g under", 27, true)}
${ring("Protein", "41 g", "of 110 g", "13 g under", 37)}${ring("Water", "0.9 l", "of 2.0 l", "0.15 l under", 45)}</div></div>`;
const miniRing = (label, eaten, behind = false) => `<div class="col" style="align-items:center;gap:2px">${Ring({ size: 52, stroke: 7, eaten, plan: 49, behind, hideCenter: true })}<div style="font-size:11px;color:${behind ? T.color.warn : T.color.onSurfaceVariant};font-weight:${behind ? 700 : 500}">${label}</div></div>`;
const homeStrip = () => `<div style="background:${T.color.surfaceLow};border-radius:24px;padding:10px 16px 6px"><div class="row" style="justify-content:space-around">${miniRing("−209", 38)}${miniRing("−50 g", 27, true)}${miniRing("−13 g", 37)}${miniRing("−0.15 l", 45)}</div>
<div class="row" style="justify-content:center;gap:6px;padding:4px 0 2px;color:${T.color.onSurfaceVariant};font-size:12px">${UiIcon("chevron-down", "14px")}<span>Pull down for the full day</span></div></div>`;
const freq = (icon, label) => `<div style="background:${T.color.primaryContainer};color:${T.color.onPrimaryContainer};border-radius:32px;height:56px;padding:0 18px;display:flex;align-items:center;gap:8px;font-weight:600;font-size:15px">${icon}${label}</div>`;
const logRow = () => `<div class="row" style="gap:10px;justify-content:center"><div style="background:${T.color.primary};color:${T.color.onPrimary};border-radius:32px;height:56px;padding:0 24px;display:flex;align-items:center;gap:8px;font-weight:700;font-size:17px">${UiIcon("plus", "22px")}Log</div>${freq(FoodIcon("water"), "Glass")}${freq(UiIcon("camera", "20px"), "Photo")}</div>`;
const logButton = () => `<div class="row" style="justify-content:center"><div style="background:${T.color.primary};color:${T.color.onPrimary};border-radius:32px;height:56px;padding:0 28px;display:flex;align-items:center;gap:10px;font-weight:600;font-size:17px">${UiIcon("plus", "22px")}Log</div></div>`;

module.exports = {
  "10-chat-home": () => Screen(AppBar({ title: "Health AI", logo }) + Pad(Stack([
    strip(),
    chatBody(`${ChatBubble("Hi! Ask me what to eat, tell me what you ate, or show me a photo.")}<div style="margin-top:auto" class="col gap-s"><div class="overline">TRY</div>${Row([Chip("What should I eat now?", { selected: true }), Chip("Log something")], 8)}<div class="overline" style="margin-top:4px">QUICK ADD</div>${usuals}</div>`),
    CameraInput("Write or speak…"),
  ], 12))),

  "11-camera": () => Screen(Viewfinder({ hint: "Point at the fridge, a menu, the counter, a plate, anything", height: 700 }) + Pad(Stack([
    `<div style="height:0"></div><div class="row between"><span class="small muted">I read it from the photo.</span><b class="small" style="color:${T.color.primary}">Type instead</b></div>`,
    `<div class="small muted">Photos are kept for 14 days during the test, so estimates can be checked.</div>`,
  ], 8))),

  "12-chat-answer": () => Screen(AppBar({ title: "Health AI", logo }) + Pad(Stack([
    strip(),
    chatBody(`${PhotoBubble("What can I eat from this?")}
    ${ChatBubble("I see chicken, rice, bread, eggs and yoghurt. You are 50 g behind on carbs. <b>Tap the one you choose:</b>")}
    ${OptionCard({ rank: 1, primary: true, compact: true, icon: "grain", name: "Chicken with rice", macros: "560 kcal · 62 g carbs · 38 g protein", reason: "Closes most of the carb gap." })}
    ${OptionCard({ rank: 2, compact: true, icon: "bread", name: "Wholegrain sandwich", macros: "430 kcal · 48 g carbs · 24 g protein", reason: "" })}
    ${OptionCard({ rank: 3, compact: true, icon: "egg", name: "Egg salad", macros: "310 kcal · 12 g carbs · 26 g protein", reason: "" })}`),
    CameraInput("Something else? Write or speak…"),
  ], 12))),

  "13-chat-onboarding": () => Screen(AppBar({ title: "Let's set you up", logo }) + Pad(`<div class="col gap-m" style="height:690px">
    ${ChatBubble("Hi! Before I suggest food, two quick things. Is there anything I should never suggest, like an allergy or something you dislike?")}
    ${ChatBubble("Nuts, and I don't like fish", { from: "user" })}
    ${ChatBubble("Got it: no nuts, no fish. You can change this any time by telling me. What is your calorie goal for a day, and when do you usually eat between?")}
    ${ChatBubble("1900, from 7 to 22", { from: "user" })}
    ${ChatBubble("Set: 1,900 kcal, 7:00 to 22:00, and roughly half carbs and a quarter protein. <b style='color:${T.color.primary}'>Undo</b><div class='small muted' style='margin-top:6px'>I am a tracker and suggestion aid for adults, not medical advice. By continuing you agree that your chat and photos go to the AI provider, and photos are kept 14 days during the test.</div>")}
    <div style="margin-top:auto" class="col gap-s">${Row([Chip("Agree and continue", { selected: true }), Chip("Change something")])}${ChatInput("Write or speak…")}</div></div>`)),

  "14-limit-reached": () => Screen(AppBar({ title: "Health AI", logo }) + Pad(Stack([
    strip(),
    Banner("<b>Daily limit reached.</b> Suggestions and the camera are back tomorrow. Your pace and usual foods still work."),
    `<div class="overline">YOUR USUALS</div>`,
    Card(Stack([
      ListItem({ icon: "coffee", title: "Cappuccino", sub: "eaten 9 times", trailing: Button("Log", { full: false }) }),
      ListItem({ icon: "grain", title: "Oat bran, soy yoghurt", sub: "eaten 6 times", trailing: Button("Log", { full: false }) }),
    ], 0), { pad: 12 }),
    `<div style="height:260px"></div>`,
    CameraInput("Daily limit reached", { disabled: true }),
  ], 12))),

  "20-home": () => Screen(AppBar({ title: "Health AI", logo }) + Pad(Stack([
    Hero({ overline: "14:20 · BEHIND THE PLAN", big: "Carbs −50 g", text: "209 kcal under the plan for now. 1,180 kcal left today." }),
    rings(),
    logRow(),
  ], 14))),

  "21-chat": () => Screen(`<div class="row between pad" style="height:56px"><div class="row gap-m"><span style="font-size:22px">${UiIcon("arrow-left", "22px")}</span><span style="font-size:18px;font-weight:500">Chat</span></div><div style="background:${T.color.surfaceLow};border-radius:20px;padding:8px 14px;font-size:14px;font-weight:600">Status</div></div>` + Pad(Stack([
    chatBody(`<div style="align-self:flex-end;background:${T.color.primary};color:${T.color.onPrimary};padding:10px 14px;border-radius:18px 18px 4px 18px;max-width:82%">Ettem egy almát és ittam két pohár vizet</div>
    ${ChatBubble("Naplóztam: alma (95 kcal) és 500 ml víz. Vízből még 1,1 l van hátra mára.")}
    ${Row([Chip("Visszavonás")], 8)}`),
    `<div class="col gap-s"><div class="overline">QUICK</div>${Row([Chip("Glass 250 ml", { icon: "water" }), Chip("Cappuccino", { icon: "coffee" }), Chip("Oat bran", { icon: "grain" }), Chip("Apple", { icon: "fruit" })], 8)}</div>`,
    CameraInput("Írj vagy mondd…"),
  ], 12))),

  "23-splash": () => Screen(`<div style="height:700px;display:grid;place-items:center"><div class="col" style="align-items:center;gap:18px"><span style="width:84px;height:84px;border-radius:22px;background:${T.color.primary};display:grid;place-items:center">${logoSvg(44)}</span><div style="font-size:24px;font-weight:700">Health AI</div><div style="width:28px;height:28px;border:4px solid ${T.color.surfaceHigh};border-top-color:${T.color.primary};border-radius:50%"></div></div></div>`),
};
