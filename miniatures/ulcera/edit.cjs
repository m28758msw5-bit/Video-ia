// Retoc de la miniatura: color, contrast, vinyeta, resplendor a la lesió i títol opcional.
const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs");
const img = "data:image/png;base64," + fs.readFileSync("original.png").toString("base64");
const outline = (c, w) => Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return `${(Math.cos(a) * w).toFixed(1)}px ${(Math.sin(a) * w).toFixed(1)}px 0 ${c}`; }).join(",");
const page = (withText) => `<html><head><link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet"></head><body style="margin:0">
<div style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#000">
  <img src="${img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.1) saturate(1.18) brightness(1.03)">
  <!-- resplendor a la lesió -->
  <div style="position:absolute;left:${1010 - 330}px;top:${470 - 300}px;width:660px;height:600px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,120,60,.45),rgba(255,60,30,.15) 60%,rgba(0,0,0,0));mix-blend-mode:screen"></div>
  <!-- llum freda al costat de la calavera -->
  <div style="position:absolute;left:-200px;top:-200px;width:900px;height:700px;border-radius:50%;background:radial-gradient(closest-side,rgba(80,160,255,.25),rgba(0,0,0,0));mix-blend-mode:screen"></div>
  <!-- vinyeta -->
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 75% 70% at 52% 48%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)"></div>
  ${withText ? `<div style="position:absolute;left:560px;top:30px;transform:rotate(-5deg);font-family:Anton,Impact,sans-serif;font-size:190px;line-height:1;letter-spacing:4px;color:#FDE047;text-shadow:${outline("#111", 12)},0 18px 30px rgba(0,0,0,.7)">ÚLCERA!</div>` : ""}
</div></body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const [name, t] of [["miniatura-retocada.png", false], ["miniatura-retocada-text.png", true]]) {
    await p.setContent(page(t), { waitUntil: "networkidle" }); await p.waitForTimeout(400);
    await p.screenshot({ path: name });
  }
  await b.close();
})();
