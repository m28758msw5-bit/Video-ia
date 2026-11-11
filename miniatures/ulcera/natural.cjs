// Versió "natural": menys saturació i brillantor artificial, negres una mica aixecats, to càlid, gra de foto i lletra feta a mà.
const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs");
const img = "data:image/png;base64," + fs.readFileSync("original.png").toString("base64");
const page = (withText) => `<html><head><link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap" rel="stylesheet"></head><body style="margin:0">
<div style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#000">
  <img src="${img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.8) contrast(.92) brightness(.98) sepia(.08) blur(.6px)">
  <!-- negres aixecats (aspecte de foto) -->
  <div style="position:absolute;inset:0;background:#2a2320;mix-blend-mode:lighten;opacity:.5"></div>
  <!-- to càlid suau -->
  <div style="position:absolute;inset:0;background:#f3d9b8;mix-blend-mode:soft-light;opacity:.35"></div>
  <!-- vinyeta lleu i irregular -->
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 75% at 48% 50%,rgba(0,0,0,0) 60%,rgba(0,0,0,.28) 100%)"></div>
  <!-- gra -->
  <svg style="position:absolute;inset:0;mix-blend-mode:overlay;opacity:.55" width="1920" height="1080"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1920" height="1080" filter="url(#n)"/></svg>
  ${withText ? `<div style="position:absolute;left:600px;top:40px;transform:rotate(-4deg);font-family:'Permanent Marker',cursive;font-size:150px;line-height:1;color:#FFE45C;text-shadow:5px 6px 0 #1a1a1a,-2px -2px 0 #1a1a1a,2px -2px 0 #1a1a1a,-2px 3px 0 #1a1a1a">úlcera!</div>` : ""}
</div></body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [name, t] of [["miniatura-natural.png", false], ["miniatura-natural-text.png", true]]) {
    await p.setContent(page(t), { waitUntil: "networkidle" }); await p.waitForTimeout(400);
    await p.screenshot({ path: name });
  }
  await b.close();
})();
