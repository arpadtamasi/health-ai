// The landing page at "/": what Health AI is, shown as a conversation, and how to connect it.
// Same plain Material Design 3 as the sign-in pages (.impeccable/surfaces/server-src-landing-ts.md).
// The example answer is one real week of the owner's testing, translated; no other health values appear.
import { esc, FONTS, icon, STYLE } from "./auth/pages.js";

const LANDING_STYLE = `
::selection{background:var(--md-primary-container);color:var(--md-on-primary-container)}
.lp{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;padding:0 32px}
.lp .appbar{padding:0;justify-content:space-between}
.brand{display:flex;align-items:center;gap:12px}
.pill{font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border-radius:8px;background:var(--md-secondary-container);color:var(--md-on-secondary-container);white-space:nowrap}
.hero{flex:none;display:grid;grid-template-columns:5fr 7fr;gap:48px;align-items:start;padding:40px 0 32px}
.lead{display:flex;flex-direction:column;gap:20px}
.lp h1{font-size:44px;line-height:52px;letter-spacing:-.01em;max-width:14ch}
.lp .intro{font-size:17px;line-height:26px;color:var(--md-on-surface-variant);max-width:44ch}
.connect{background:var(--md-surface-container-low);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px}
.connect h2{margin:0;font-size:16px;line-height:24px;font-weight:500}
.url{display:flex;align-items:center;gap:8px;background:var(--md-surface-container-high);border-radius:12px;padding:6px 6px 6px 14px}
.url code{flex:1;font:13.5px/20px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--md-on-surface);overflow-wrap:anywhere;user-select:all}
.copy{min-height:36px;border:0;border-radius:18px;padding:0 14px 0 10px;background:var(--md-primary);color:var(--md-on-primary);font:500 13px/1 "Roboto Flex",Roboto,system-ui,sans-serif;display:inline-flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap}
.copy .ms{width:18px;height:18px}
.copy{position:relative;overflow:hidden}.copy::after{content:"";position:absolute;inset:0;background:var(--md-on-primary);opacity:0;transition:opacity .15s}
.copy:hover::after{opacity:.08}.copy:active::after{opacity:.12}.copy:focus-visible{outline:3px solid var(--md-primary);outline-offset:3px}
.copy.done{background:var(--md-primary-container);color:var(--md-on-primary-container)}
.how{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;counter-reset:step}
.how li{display:grid;grid-template-columns:28px 1fr;gap:12px;align-items:start;font-size:14px;line-height:20px}
.how li::before{counter-increment:step;content:counter(step);width:28px;height:28px;border-radius:50%;background:var(--md-secondary-container);color:var(--md-on-secondary-container);display:grid;place-items:center;font-size:13px;font-weight:500}
.how b{font-weight:500}.how span{display:block;color:var(--md-on-surface-variant);font-size:13px;line-height:18px}
.connect .note{text-align:left}
.chat{background:var(--md-surface-container-low);border-radius:24px;padding:20px 24px 16px;display:flex;flex-direction:column;gap:14px;font-variant-numeric:tabular-nums}
.photo-q{padding:6px 6px 10px}.photo-q .photo{display:block;width:100%;max-width:240px;height:auto;border-radius:16px 16px 6px 6px}.photo-q p{padding:8px 10px 0}
.logged{display:grid;grid-template-columns:32px 1fr;gap:10px;align-items:center;margin-top:12px;background:var(--md-surface);border-radius:12px;padding:8px 12px 8px 8px;font-size:14px;line-height:20px}
.logged .icon{width:32px;height:32px}.logged .icon .ms{width:18px;height:18px}.logged .s{font-size:12.5px}
.chat .q{align-self:flex-end;max-width:70%;background:var(--md-primary-container);color:var(--md-on-primary-container);border-radius:20px 20px 4px 20px;padding:10px 16px;font-size:15px;line-height:22px}
.chat .a{display:grid;grid-template-columns:32px 1fr;gap:12px}
.chat .a .logo{margin-top:2px}
.chat .a p{font-size:15px;line-height:22px}
.chat .a p+p{margin-top:8px}
.wk{width:100%;border-collapse:collapse;margin:12px 0 2px;font-size:13px;line-height:18px}
.wk caption{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.wk th,.wk td{text-align:left;padding:5px 8px 5px 0;font-weight:400;white-space:nowrap}
.wk thead th{font-size:11px;font-weight:500;letter-spacing:.4px;text-transform:uppercase;color:var(--md-on-surface-variant);border-bottom:1px solid var(--md-outline-variant)}
.wk tbody th{font-weight:500}.wk td b{font-weight:500;color:var(--md-primary)}
.wk tbody tr+tr td,.wk tbody tr+tr th{border-top:1px solid color-mix(in srgb,var(--md-outline-variant) 45%,transparent)}
.hl{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.hl li{display:grid;grid-template-columns:32px 1fr;gap:10px;align-items:start;font-size:14px;line-height:20px}
.hl .icon{width:32px;height:32px}.hl .icon .ms{width:18px;height:18px}
.hl b{font-weight:500}
.chat .offer{color:var(--md-on-surface-variant);font-size:14px;line-height:20px;margin-top:10px}
.chat .cap{font-size:12px;line-height:16px;color:var(--md-on-surface-variant);border-top:1px solid var(--md-outline-variant);padding-top:12px;display:flex;align-items:center;gap:6px}
.chat .cap .ms{width:16px;height:16px}
.shared{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));margin:0;padding:0;list-style:none;background:var(--md-surface-container-low);border-radius:16px;overflow:hidden}
.shared .item{padding:12px 20px}
.shared .item+.item{border-top:0;border-left:1px solid var(--md-outline-variant)}
.more{padding:40px 0 8px;display:flex;flex-direction:column;gap:16px}
.more h2{margin:0;font-size:24px;line-height:32px;font-weight:400;letter-spacing:-.005em}
.more .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr));gap:24px;align-items:stretch}
.more .chat .cap{margin-top:auto}
.more .chat{padding:20px 24px 16px}
.foot{padding:32px 0 24px;font-size:12px;line-height:16px;color:var(--md-on-surface-variant);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media (max-width:900px){
.lp{padding:0 20px}.hero{grid-template-columns:1fr;gap:24px;padding:16px 0 24px}
.lp h1{font-size:34px;line-height:42px}.lp .intro{font-size:16px;line-height:24px}
.chat{order:-1;padding:16px 18px 14px;border-radius:20px}.wk{font-size:12px}.wk th,.wk td{padding-right:6px}.wk td:nth-child(2),.wk thead th:nth-child(2){display:none}.chat .q{max-width:85%}
.lead{gap:16px}.connect{order:1}
.shared{grid-template-columns:1fr}.more{padding:32px 0 0}.more .grid{grid-template-columns:1fr;gap:16px}.more .chat{order:0}.more h2{font-size:22px;line-height:28px}.shared .item{padding:12px 16px}.shared .item+.item{border-left:0;border-top:1px solid var(--md-outline-variant)}.foot{padding:24px 0 20px}
}
@media (max-width:900px){.hero{display:flex;flex-direction:column}.lead{display:contents}.lp h1{order:-2}.lp .intro{order:-1}}
`;

const COPY_SCRIPT = `<script>
(function(){var b=document.getElementById('copy'),u=document.getElementById('mcp-url');if(!b||!u||!navigator.clipboard)return;
var l=b.innerHTML;b.addEventListener('click',function(){navigator.clipboard.writeText(u.textContent).then(function(){
b.classList.add('done');b.innerHTML='<svg class="ms" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Copied';
setTimeout(function(){b.classList.remove('done');b.innerHTML=l},2000)})})})();
</script>`;

const MEAL_EXAMPLE = `<section class="chat" aria-label="Example conversation: logging a meal">
<div class="q photo-q"><svg class="photo" viewBox="0 0 240 160" role="img" aria-label="Photo of lunch: grilled chicken breast, rice and cucumber salad on a plate">
<defs><radialGradient id="tbl" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#d8c2a4"/><stop offset="1" stop-color="#a98663"/></radialGradient>
<radialGradient id="plt" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9e4dc"/></radialGradient></defs>
<rect width="240" height="160" fill="url(#tbl)"/>
<ellipse cx="123" cy="86" rx="72" ry="66" fill="#3b2a1a" opacity=".22"/>
<circle cx="120" cy="80" r="70" fill="url(#plt)"/><circle cx="120" cy="80" r="54" fill="none" stroke="#ddd6cb" stroke-width="1.5"/>
<g fill="#fbf9f3" stroke="#e2dccd" stroke-width=".8">
<ellipse cx="86" cy="98" rx="26" ry="19"/><ellipse cx="72" cy="88" rx="14" ry="11"/><ellipse cx="100" cy="110" rx="15" ry="9"/></g>
<g fill="#f0ebdf"><ellipse cx="78" cy="88" rx="3" ry="1.4" transform="rotate(20 78 88)"/><ellipse cx="86" cy="92" rx="3" ry="1.4" transform="rotate(-30 86 92)"/><ellipse cx="94" cy="98" rx="3" ry="1.4" transform="rotate(10 94 98)"/><ellipse cx="82" cy="100" rx="3" ry="1.4" transform="rotate(60 82 100)"/><ellipse cx="90" cy="104" rx="3" ry="1.4" transform="rotate(-10 90 104)"/><ellipse cx="72" cy="80" rx="3" ry="1.4" transform="rotate(40 72 80)"/><ellipse cx="100" cy="94" rx="3" ry="1.4" transform="rotate(-50 100 94)"/><ellipse cx="88" cy="84" rx="3" ry="1.4" transform="rotate(15 88 84)"/></g>
<g transform="rotate(-24 136 62)"><path d="M100 60c4-18 24-28 48-26s38 14 36 28-20 24-44 24-44-8-40-26z" fill="#d49a5f"/>
<path d="M100 60c4-18 24-28 48-26s38 14 36 28" fill="none" stroke="#b97b40" stroke-width="3" stroke-linecap="round"/>
<path d="M122 36v48M142 34v52M162 38v44" stroke="#f3e2c8" stroke-width="2.4"/>
<path d="M108 52l10 8M112 70l10 7M128 44l10 8M128 62l10 8M148 44l10 8M148 64l10 8M166 50l10 7" stroke="#7a4a20" stroke-width="2.4" stroke-linecap="round"/></g>
<g stroke="#4f7a3a" stroke-width="2"><circle cx="138" cy="108" r="9.5" fill="#dfeccb"/><circle cx="138" cy="108" r="4" fill="#b9d49a" stroke="none"/><circle cx="156" cy="100" r="9.5" fill="#dfeccb"/><circle cx="156" cy="100" r="4" fill="#b9d49a" stroke="none"/><circle cx="152" cy="118" r="9.5" fill="#dfeccb"/><circle cx="152" cy="118" r="4" fill="#b9d49a" stroke="none"/><circle cx="170" cy="110" r="9.5" fill="#dfeccb"/><circle cx="170" cy="110" r="4" fill="#b9d49a" stroke="none"/></g>
</svg><p>Lunch.</p></div>
<div class="a"><span class="logo" aria-hidden="true">${icon("favorite")}</span><div>
<p>Logged to Google Health as lunch at 12:40: grilled chicken breast, rice and a cucumber salad. From the photo I estimate about 640 kcal and 48 g of protein.</p>
<div class="logged"><span class="icon">${icon("check")}</span><div><div>Lunch · 12:40 · 640 kcal</div><div class="s">Written to Google Health · Nutrition</div></div></div>
<p class="offer">If the portion was bigger or smaller than it looks, tell me and I'll replace the entry with the right amounts.</p>
</div></div>
<p class="cap">${icon("chat")}Example exchange. The dish and its numbers are illustrative.</p>
</section>`;

/** The public front page: an example conversation, the connector URL and what is shared. */
export function landingPage(publicUrl: URL, writeAvailable: boolean): string {
  const mcpUrl = new URL("/mcp", publicUrl).href;
  const shared = [
    ["bedtime", "Sleep, heart rate, activity", "From your Google Health account", "Read"],
    ...(writeAvailable ? [["restaurant", "Meals and water you log", "Written to Google Health", "Read and write"]] : []),
    ["lock", "Health values stored by us", "Delete your data at any time", "None"],
  ]
    .map(([i, t, s, c]) => `<li class="item"><span class="icon">${icon(i ?? "")}</span><div><div class="t">${esc(t ?? "")}</div><div class="s">${esc(s ?? "")}</div></div><span class="chip">${esc(c ?? "")}</span></li>`)
    .join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Health AI connects Claude to your own Google Health and Fitbit data: ask about sleep, heart rate and activity, and log meals by chat.">
<title>Health AI · Ask Claude about your own sleep</title>${FONTS}<style>${STYLE}${LANDING_STYLE}</style></head>
<body><div class="lp">
<header class="appbar"><span class="brand"><span class="logo" aria-hidden="true">${icon("favorite")}</span>Health AI</span><span class="pill">Testing · invited accounts</span></header>
<main class="hero">
<div class="lead">
<h1>Ask Claude about your own sleep.</h1>
<p class="intro">Health AI connects Claude to your Google Health and Fitbit data. Ask about sleep, heart rate and activity, log meals in the conversation, and run honest experiments on yourself.</p>
<section class="connect" aria-labelledby="connect-h">
<h2 id="connect-h">Connect it to Claude</h2>
<div class="url"><code id="mcp-url">${esc(mcpUrl)}</code><button class="copy" id="copy" type="button" aria-live="polite">${icon("content_copy")}Copy</button></div>
<ol class="how">
<li><div><b>Add the connector.</b><span>Claude → Settings → Connectors → Add custom connector, and paste the URL.</span></div></li>
<li><div><b>Sign in with Google.</b><span>Keep the Health permissions selected. If Google says the app isn't verified, choose Advanced → Go to Health AI.</span></div></li>
<li><div><b>Ask Claude.</b><span>Start with “How did I sleep this week?”</span></div></li>
</ol>
<p class="note">Invited Google accounts only. While in testing, Google asks you to sign in again about once a week.</p>
</section>
</div>
<section class="chat" aria-label="Example conversation: sleep">
<p class="q">How did I sleep this week?</p>
<div class="a"><span class="logo" aria-hidden="true">${icon("favorite")}</span><div>
<p>A mixed week: a short first night, two broken nights in the middle, and a good finish. You averaged about 6 h 15 min of sleep a night.</p>
<table class="wk"><caption>Nights this week</caption><thead><tr><th scope="col">Night</th><th scope="col">In bed</th><th scope="col">Asleep</th><th scope="col">Awake</th><th scope="col">Deep</th><th scope="col">REM</th></tr></thead><tbody>
<tr><th scope="row">Sun–Mon</th><td>22:48 – 03:57</td><td>4 h 56</td><td>13 min</td><td>35 min</td><td>39 min</td></tr>
<tr><th scope="row">Mon–Tue</th><td>21:49 – 05:50</td><td><b>7 h 40</b></td><td>21 min</td><td>58 min</td><td>106 min</td></tr>
<tr><th scope="row">Tue–Wed</th><td>23:35 – 06:23</td><td>6 h 40</td><td>8 min</td><td><b>100 min</b></td><td>66 min</td></tr>
<tr><th scope="row">Wed–Thu</th><td>19:55 – 03:37</td><td>5 h 31</td><td><b>131 min</b></td><td>56 min</td><td>35 min</td></tr>
<tr><th scope="row">Thu–Fri</th><td>23:11 – 06:27</td><td>5 h 44</td><td><b>92 min</b></td><td>72 min</td><td>62 min</td></tr>
<tr><th scope="row">Fri–Sat</th><td>23:58 – 07:18</td><td>7 h 08</td><td>12 min</td><td>69 min</td><td>99 min</td></tr>
</tbody></table>
<ul class="hl">
<li><span class="icon">${icon("schedule")}</span><div><b>Wednesday and Thursday</b> were the low point. Both nights you woke before dawn and stayed awake, on Wednesday for about 1 h 20 min from 2:14.</div></li>
<li><span class="icon">${icon("bedtime")}</span><div><b>Tuesday</b> was the most restful. Not the longest night, but 100 min of deep sleep, by far the most this week.</div></li>
<li><span class="icon">${icon("check")}</span><div><b>Last night</b> you bounced back: over 7 hours, little time awake and plenty of REM.</div></li>
</ul>
<p class="offer">If you like, I can check whether the weak middle lines up with your heart rate or daily activity.</p>
</div></div>
<p class="cap">${icon("chat")}A real answer from one week of the owner's testing, translated from Hungarian.</p>
</section>
</main>
<ul class="shared" aria-label="What is shared">${shared}</ul>
<section class="more" aria-labelledby="more-h">
<h2 id="more-h">Also in the same conversation</h2>
<div class="grid">
${writeAvailable ? MEAL_EXAMPLE : ""}
<section class="chat" aria-label="Example conversation: an experiment">
<p class="q">Does a late dinner hurt my deep sleep?</p>
<div class="a"><span class="logo" aria-hidden="true">${icon("favorite")}</span><div>
<p>Let's test it properly instead of guessing. Your usual bedtime is around 23:00, so for two weeks I'll assign each evening as early or late, and read your Fitbit sleep stages every night.</p>
<ul class="hl">
<li><span class="icon">${icon("schedule")}</span><div><b>Tonight is an early night:</b> finish eating by 19:30. Late nights mean dinner between 21:00 and 22:00.</div></li>
<li><span class="icon">${icon("restaurant")}</span><div><b>Log dinner each evening</b> with a photo or one sentence, and tell me when a night should not count.</div></li>
<li><span class="icon">${icon("science")}</span><div><b>The comparison is computed in code,</b> with a confidence interval. If the data can't tell, the answer is “no clear difference”.</div></li>
</ul>
<p class="offer">Shall I start tonight, or from Monday?</p>
</div></div>
<p class="cap">${icon("chat")}Example exchange following the experiment design. No result exists yet.</p>
</section>
</div>
</section>
<footer class="foot"><span>Independent project. Not affiliated with or endorsed by Google. Not medical advice.</span><span>Health AI · MCP server over the Google Health API</span></footer>
</div>${COPY_SCRIPT}</body></html>`;
}
