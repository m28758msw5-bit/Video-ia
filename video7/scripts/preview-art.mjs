import { createRequire } from "node:module"; const { chromium } = createRequire("/")("playwright");
import * as A from "./art.mjs";
const out = process.argv[2];
const ar = A.arches().sort((a, b) => a.d - b.d).map((t) => t.svg).join("");
const occ = A.lowerOcclusal();
const html = `<html><body style="margin:0;background:#fff">
<svg width="1920" height="1080" viewBox="0 0 1920 1080">${A.DEFS}
<g transform="translate(0,0) scale(0.5)">${A.clinic().replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</g>
<g transform="translate(1440,280) scale(0.6)">${occ.svg}${occ.nums}</g>
<g transform="translate(400,800) scale(0.8)">${ar}<polygon points="${A.planePoly("fro")}" fill="#16A34A" opacity=".3"/></g>
<g transform="translate(960,560) scale(0.5)">${A.sagittalHead()}</g>
<g transform="translate(1700,800) scale(0.6)">${A.headSide()}</g><g transform="translate(1450,850) scale(0.5)">${A.headFront()}</g>
</svg></body></html>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.setContent(html); await p.screenshot({ path: out }); await b.close();
