const { execSync } = require("child_process");
const { chromium } = require(execSync("npm root -g").toString().trim() + "/playwright");
const fs = require("fs");
(async () => {
  const A = await import("../../video7/scripts/art.mjs");
  const H = A.HEAD;
  const outline = (c, w) => Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return `${(Math.cos(a) * w).toFixed(1)}px ${(Math.sin(a) * w).toFixed(1)}px 0 ${c}`; }).join(",");
  const teeth = "data:image/png;base64," + fs.readFileSync("teeth.png").toString("base64");
  const head = `<svg width="760" height="760" viewBox="150 230 720 720">${A.DEFS}${A.sagittalHead()}
    <path d="${H.proper}" fill="#F97316" opacity=".75" stroke="#C2410C" stroke-width="5"/>
    <path d="${H.vestUp} ${H.vestLow}" fill="#EC4899" stroke="#9D174D" stroke-width="3"/>
    <path d="M262 410 C180 410 170 610 262 612" fill="none" stroke="#FACC15" stroke-width="12" stroke-linecap="round"/></svg>`;
  const html = `<html><head><link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet"></head>
  <body style="margin:0"><div id="t" style="position:relative;width:1280px;height:720px;overflow:hidden;background:linear-gradient(120deg,#E0F2FE 0%,#F0FDFA 45%,#FFFFFF 100%);font-family:'Archivo Black',Inter,sans-serif">
   <div style="position:absolute;left:-140px;top:-180px;width:760px;height:760px;border-radius:50%;background:#FDE68A;opacity:.55"></div>
   <div style="position:absolute;right:-160px;bottom:-220px;width:720px;height:720px;border-radius:50%;background:#BBF7D0;opacity:.7"></div>
   <div style="position:absolute;left:10px;top:30px;transform:scale(.78);transform-origin:0 0;filter:drop-shadow(0 18px 24px rgba(15,23,42,.25))">${head}</div>
   <div style="position:absolute;right:-30px;top:140px;width:720px;height:444px;border-radius:28px;overflow:hidden;border:8px solid #fff;box-shadow:0 20px 40px rgba(15,23,42,.3);transform:rotate(3deg);background:#F8FAFC">
     <img src="${teeth}" style="width:100%;height:100%;object-fit:cover;object-position:30% 50%"></div>
   <div style="position:absolute;right:40px;top:28px;background:#E11D48;color:#fff;font-size:92px;padding:6px 34px 10px;border-radius:24px;transform:rotate(-4deg);box-shadow:0 12px 24px rgba(15,23,42,.3);border:6px solid #fff">RA2</div>
   <div style="position:absolute;left:0;right:0;bottom:26px;text-align:center;font-size:88px;line-height:1;color:#0F172A;text-shadow:${outline("#fff", 9)},0 14px 24px rgba(15,23,42,.35)">PLANS I <span style="color:#EA580C">CAVITAT ORAL</span></div>
   <svg style="position:absolute;left:440px;top:240px" width="160" height="120" viewBox="0 0 160 120"><path d="M10 100 C40 30 90 20 140 30" stroke="#E11D48" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M118 8 L148 30 L120 54" stroke="#E11D48" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div></body></html>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.setContent(html, { waitUntil: "networkidle" }); await p.waitForTimeout(500);
  await p.screenshot({ path: "miniatura-ra2.png" }); await b.close();
})();
