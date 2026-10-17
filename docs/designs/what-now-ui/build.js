// Renders every screen to screens/<name>.html and .png with headless Chrome. Run: node build.js
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const T = require("./tokens");
const out = path.join(__dirname, "screens");
fs.mkdirSync(out, { recursive: true });
const screens = require("./screens");
for (const [name, render] of Object.entries(screens)) {
  const html = path.join(out, name + ".html");
  fs.writeFileSync(html, render());
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=4000", "--force-device-scale-factor=2",
    `--window-size=${T.size.screenW},${T.size.screenH}`, `--screenshot=${path.join(out, name + ".png")}`, "file://" + html], { stdio: "ignore" });
  console.log("rendered", name);
}
