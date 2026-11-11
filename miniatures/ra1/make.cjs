// Miniatura RA1 · gingivitis. Escena SVG pròpia + acabat natural (gra, to càlid) + títol fet a mà.
const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs");
const svg = fs.readFileSync("scene.svg", "utf8");
const page = (txt) => `<html><head><link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Anton&display=swap" rel="stylesheet"></head><body style="margin:0">
<div style="position:relative;width:1920px;height:1080px;overflow:hidden">
  <div style="position:absolute;inset:0;filter:saturate(.92) contrast(.97)">${svg}</div>
  <div style="position:absolute;inset:0;background:#2a2320;mix-blend-mode:lighten;opacity:.35"></div>
  <div style="position:absolute;inset:0;background:#f3d9b8;mix-blend-mode:soft-light;opacity:.3"></div>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 75% at 50% 45%,rgba(0,0,0,0) 60%,rgba(0,0,0,.3) 100%)"></div>
  <svg style="position:absolute;inset:0;mix-blend-mode:overlay;opacity:.5" width="1920" height="1080"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1920" height="1080" filter="url(#n)"/></svg>
  ${txt ? `<div style="position:absolute;left:640px;top:830px;transform:rotate(-3deg);font-family:'Permanent Marker',cursive;font-size:150px;line-height:1;color:#FFE45C;text-shadow:6px 7px 0 #1a1a1a,-2px -2px 0 #1a1a1a,2px -2px 0 #1a1a1a,-2px 3px 0 #1a1a1a,0 0 30px rgba(0,0,0,.6)">gingivitis!</div>
  <div style="position:absolute;left:1430px;top:770px;transform:rotate(6deg);font-family:Anton,Impact,sans-serif;font-size:66px;letter-spacing:3px;color:#fff;background:#DC2626;padding:2px 22px 8px;border-radius:14px;border:5px solid #fff;box-shadow:0 10px 20px rgba(0,0,0,.4)">RA1</div>` : ""}
</div></body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [n, t] of [["miniatura-ra1.png", true], ["miniatura-ra1-sense-text.png", false]]) {
    await p.setContent(page(t), { waitUntil: "networkidle" }); await p.waitForTimeout(400); await p.screenshot({ path: n });
  }
  await b.close();
})();
