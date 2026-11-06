// Generador del vídeo «Com es repara el teixit? — Regeneració».
// 1920×1080, fons clar, il·lustració realista d'un bloc de mucosa i lupa a nivell cel·lular.
// Àudio: la veu de l'usuària amb els seus efectes (assets/audio.wav). Cada animació
// cau sobre la paraula (taula W, de la transcripció) o sobre l'efecte de so (taula FX).
//
//   node scripts/build.mjs             vídeo sencer
//   node scripts/build.mjs --until 15  només fins al segon 15

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const UNTIL = args.includes("--until") ? parseFloat(args[args.indexOf("--until") + 1]) : null;
const W_ = 1920, H_ = 1080;
const DUR = +(UNTIL ?? 42.4).toFixed(3);
const r2 = (v) => Math.round(v * 100) / 100;
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ───────────────────────── temps ─────────────────────────
// Paraules (de assets/transcript.json): P("paraula", n) = quan es diu.
const words = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/transcript.json"), "utf8"));
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
function P(word, n = 1) {
  const k = norm(word);
  let c = 0;
  for (const w of words) if ((norm(w.text) === k || norm(w.text.split(/['’]/).pop()) === k) && ++c === n) return w.start;
  throw new Error(`P(${word},${n})`);
}
// Efectes de so que ja porta l'àudio (detectats per bandes de freqüència): s'hi alineen les aparicions.
const FX = { title: 0.35, glit1: 1.5, glit2: 2.6, glit3: 3.35, glock1: 8.1, glock2: 10.0, boom: 12.7, crumble: 16.0, newCells: 18.35, item1: 24.65, item2: 25.8 };

const C = { bg: "#F3F6FA", ink: "#0F172A", yellow: "#FFD21F", pink: "#FF2E7E", teal: "#0D9488", green: "#16A34A", blue: "#2563EB" };

// ───────────────────────── art ─────────────────────────
const DEFS = `<defs>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#0F172A" flood-opacity="0.2"/></filter>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4B1BC"/><stop offset="1" stop-color="#E58A9A"/></linearGradient>
  <linearGradient id="gEpi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7859A"/><stop offset="1" stop-color="#C95C78"/></linearGradient>
  <linearGradient id="gLam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8D0D9"/><stop offset="1" stop-color="#EDB1C0"/></linearGradient>
  <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E3C8"/><stop offset="1" stop-color="#EBCB9F"/></linearGradient>
  <linearGradient id="gSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D98597"/><stop offset="1" stop-color="#B9667A"/></linearGradient>
  <radialGradient id="gWound" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stop-color="#7F1D2D"/><stop offset="0.6" stop-color="#A3253A"/><stop offset="1" stop-color="#C2414F"/></radialGradient>
  <radialGradient id="gCyto" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FAD3E4"/><stop offset="1" stop-color="#E39AC1"/></radialGradient>
  <radialGradient id="gNuc" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#8B6CC8"/><stop offset="1" stop-color="#3F2479"/></radialGradient>
  <radialGradient id="gDead" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#D6D3D1"/><stop offset="1" stop-color="#A8A29E"/></radialGradient>
  <radialGradient id="gLensBg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FBE6EE"/><stop offset="1" stop-color="#F3CDDB"/></radialGradient>
  <linearGradient id="gRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8FAFC"/><stop offset="0.5" stop-color="#94A3B8"/><stop offset="1" stop-color="#334155"/></linearGradient>
  <clipPath id="lensClip"><circle r="300"/></clipPath>
</defs>`;

// Bloc de mucosa amb una ferida al mig (vista en perspectiva).
function block() {
  const R = rng(7);
  let ves = "", fat = "", cellsTex = "";
  for (let i = 0; i < 11; i++) {
    const x = -560 + i * 110 + R() * 30;
    if (Math.abs(x) < 170) continue;
    const red = i % 2 === 0;
    ves += `<path id="ves${i}" d="M${r2(x)} -20 q${r2(26 + R() * 20)} 60 ${r2(-12 + R() * 24)} 110 q-24 50 14 100" stroke="${red ? "#D7263D" : "#3B4FC4"}" stroke-width="${r2(6 + R() * 4)}" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  }
  for (let i = 0; i < 26; i++) fat += `<ellipse cx="${r2(-590 + R() * 1180)}" cy="${r2(225 + R() * 140)}" rx="${r2(26 + R() * 22)}" ry="${r2(18 + R() * 14)}" fill="#FFF6E5" stroke="#E8C893" stroke-width="3"/>`;
  for (let x = -596; x < 590; x += 26) if (Math.abs(x) > 140) cellsTex += `<path d="M${x} -118 V-44" stroke="#B4486A" stroke-width="2" opacity="0.35"/>`;
  return `<g id="block">
    <!-- cara superior -->
    <path d="M-600 -120 L600 -120 L790 -300 L-410 -300Z" fill="url(#gTop)"/>
    <path id="topWound" d="M-60 -190 Q20 -240 130 -228 Q200 -214 150 -176 Q70 -140 -20 -150 Q-90 -160 -60 -190Z" fill="url(#gWound)"/>
    <path id="topHeal" d="M-60 -190 Q20 -240 130 -228 Q200 -214 150 -176 Q70 -140 -20 -150 Q-90 -160 -60 -190Z" fill="#EFA3B1" opacity="0"/>
    <!-- cara frontal: capes -->
    <rect x="-600" y="200" width="1200" height="180" fill="url(#gSub)"/>${fat}
    <rect x="-600" y="-44" width="1200" height="244" fill="url(#gLam)"/>${ves}
    <rect x="-600" y="-120" width="1200" height="76" fill="url(#gEpi)"/>${cellsTex}
    <path d="M-600 -44 Q-300 -30 0 -44 T600 -44" stroke="#9D3B5C" stroke-width="3" fill="none" opacity="0.6"/>
    <!-- ferida (tall en V a la cara frontal) -->
    <path id="wound" d="M-150 -120 Q-110 -40 -40 30 Q0 60 40 30 Q110 -40 150 -120Z" fill="url(#gWound)"/>
    <g transform="translate(0,40)"><g id="woundFill"><path d="M-150 -160 Q-110 -80 -40 -10 Q0 20 40 -10 Q110 -80 150 -160Z" fill="url(#gLam)"/></g></g>
    <g transform="translate(-150,-82)"><g id="epiL"><rect x="0" y="-38" width="150" height="76" fill="url(#gEpi)"/></g></g>
    <g transform="translate(150,-82)"><g id="epiR"><rect x="-150" y="-38" width="150" height="76" fill="url(#gEpi)"/></g></g>
    <!-- cara lateral -->
    <path d="M600 -120 L790 -300 V200 L600 380Z" fill="url(#gSide)"/>
    <path d="M600 -44 L790 -224 M600 200 L790 20" stroke="#fff" stroke-width="3" opacity="0.5"/>
    <path d="M-600 -120 H600 L790 -300" fill="none" stroke="#fff" stroke-width="4" opacity="0.7"/>
    <!-- escut de protecció -->
    <g transform="translate(0,-330)"><g id="shield" opacity="0">
      <path d="M0 -90 L80 -60 V0 Q80 70 0 100 Q-80 70 -80 0 V-60Z" fill="${C.teal}" stroke="#fff" stroke-width="8"/>
      <path d="M-34 4 L-8 30 L38 -20" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>
  </g>`;
}

// Cèl·lula (paleta H&E). kind: "ok" | "dead".
const cell = (id, x, y, rw, rh, kind = "ok", extra = "") => `<g transform="translate(${r2(x)},${r2(y)})"><g id="${id}" ${extra}>
  <rect x="${r2(-rw)}" y="${r2(-rh)}" width="${r2(rw * 2)}" height="${r2(rh * 2)}" rx="${r2(Math.min(rw, rh) * 0.8)}" fill="${kind === "dead" ? "url(#gDead)" : "url(#gCyto)"}" stroke="${kind === "dead" ? "#78716C" : "#D07BAA"}" stroke-width="3" ${kind === "dead" ? 'stroke-dasharray="10 6"' : ""}/>
  ${kind === "dead" ? `<circle cx="-6" cy="-4" r="${r2(Math.min(rw, rh) * 0.28)}" fill="#57534E"/><circle cx="8" cy="6" r="${r2(Math.min(rw, rh) * 0.16)}" fill="#57534E"/>` : `<circle r="${r2(Math.min(rw, rh) * 0.45)}" fill="url(#gNuc)"/>`}
</g></g>`;

// Contingut de la lupa: epiteli a nivell cel·lular amb un forat (ferida) al mig.
const ROWS = [
  { y: 150, rw: 26, rh: 34, basal: true },
  { y: 82, rw: 30, rh: 28 },
  { y: 22, rw: 34, rh: 24 },
  { y: -32, rw: 40, rh: 20 },
  { y: -78, rw: 46, rh: 16 },
];
const GAP = 120;
const lensCells = [];
ROWS.forEach((r, ri) => {
  const step = r.rw * 2 + 8;
  for (let x = -330 + (ri % 2) * (step / 2); x < 330; x += step) {
    const inGap = Math.abs(x) < GAP;
    lensCells.push({ id: `c${ri}_${Math.round(x)}`, x, y: r.y, rw: r.rw, rh: r.rh, ri, inGap, basal: !!r.basal, edge: !inGap && Math.abs(x) < GAP + step });
  }
});
const gapCells = lensCells.filter((c) => c.inGap);
const edgeCells = lensCells.filter((c) => c.edge && !c.basal);
const basalCells = lensCells.filter((c) => c.basal && !c.inGap);

function lens() {
  return `<g id="lens">
    <circle r="318" fill="url(#gRim)" filter="url(#shadow)"/>
    <circle r="300" fill="url(#gLensBg)"/>
    <g clip-path="url(#lensClip)">
      <rect x="-330" y="190" width="660" height="160" fill="#F7E3C8" opacity="0.6"/>
      <path d="M-330 188 Q-160 174 0 190 T330 188" stroke="#9D3B5C" stroke-width="5" fill="none"/>
      ${lensCells.filter((c) => !c.inGap).map((c) => cell(c.id, c.x, c.y, c.rw, c.rh)).join("")}
      ${gapCells.map((c) => cell(`d_${c.id}`, c.x, c.y, c.rw * 0.9, c.rh * 0.9, "dead")).join("")}
      ${gapCells.map((c) => cell(`n_${c.id}`, c.x, c.y, c.rw, c.rh, "ok", 'opacity="0"')).join("")}
      ${edgeCells.map((c) => `<g transform="translate(${r2(c.x)},${r2(c.y)})"><circle id="sv_${c.id}" r="${r2(Math.max(c.rw, c.rh) + 10)}" fill="none" stroke="${C.yellow}" stroke-width="6" opacity="0" filter="url(#glow)"/></g>`).join("")}
      ${basalCells.map((c) => `<g transform="translate(${r2(c.x)},${r2(c.y)})"><circle id="bs_${c.id}" r="${r2(c.rh + 8)}" fill="none" stroke="${C.green}" stroke-width="6" opacity="0" filter="url(#glow)"/></g>`).join("")}
      <path id="migL" d="M-210 110 H-60 M-90 84 L-60 110 L-90 136" stroke="${C.blue}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>
      <path id="migR" d="M210 110 H60 M90 84 L60 110 L90 136" stroke="${C.blue}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>
    </g>
    <circle r="300" fill="none" stroke="#fff" stroke-width="6" opacity="0.6"/>
    <path d="M220 220 L360 360" stroke="url(#gRim)" stroke-width="44" stroke-linecap="round"/>
  </g>`;
}

const LENS = { x: 1150, y: -60 };
function world() {
  // Senyals de reparació: punts que viatgen pels vasos cap a la ferida.
  const R = rng(3);
  const sig = Array.from({ length: 10 }, (_, i) => ({ id: `sig${i}`, x: (i < 5 ? -1 : 1) * (240 + R() * 300), y: 20 + R() * 160 }));
  return {
    sig,
    svg: `<svg class="layer" style="left:-1600px;top:-1200px" width="3600" height="2400" viewBox="-1600 -1200 3600 2400">
      ${DEFS}
      <g filter="url(#shadow)">${block()}</g>
      ${sig.map((s) => `<g transform="translate(${r2(s.x)},${r2(s.y)})"><circle id="${s.id}" r="12" fill="#FFF7AE" filter="url(#glow)" opacity="0"/></g>`).join("")}
      <path id="lensLink" d="M120 -100 L${LENS.x - 280} ${LENS.y - 60} M120 40 L${LENS.x - 240} ${LENS.y + 170}" stroke="#94A3B8" stroke-width="4" stroke-dasharray="12 10" opacity="0"/>
      <g transform="translate(${LENS.x},${LENS.y})"><g id="lensWrap" opacity="0">${lens()}</g></g>
    </svg>`,
  };
}

const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif}
#bgSoft{position:absolute;inset:0;background:radial-gradient(70% 60% at 55% 45%, #FFFFFF, ${C.bg} 72%)}
#punchz{position:absolute;left:${W_ / 2}px;top:${H_ / 2}px;width:0;height:0}
#cam,#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
.t{position:absolute;font-family:"Archivo Black",Inter,sans-serif;text-transform:uppercase;line-height:1.02;letter-spacing:.01em;white-space:nowrap;opacity:0;paint-order:stroke fill}
.yellow{color:${C.yellow};text-shadow:6.0px 0.0px 0 #7A2E0E,5.5px 2.3px 0 #7A2E0E,4.2px 4.2px 0 #7A2E0E,2.3px 5.5px 0 #7A2E0E,0.0px 6.0px 0 #7A2E0E,-2.3px 5.5px 0 #7A2E0E,-4.2px 4.2px 0 #7A2E0E,-5.5px 2.3px 0 #7A2E0E,-6.0px 0.0px 0 #7A2E0E,-5.5px -2.3px 0 #7A2E0E,-4.2px -4.2px 0 #7A2E0E,-2.3px -5.5px 0 #7A2E0E,-0.0px -6.0px 0 #7A2E0E,2.3px -5.5px 0 #7A2E0E,4.2px -4.2px 0 #7A2E0E,5.5px -2.3px 0 #7A2E0E,0 11px 0 #7A2E0E}
.white{color:#fff;text-shadow:6.0px 0.0px 0 #111827,5.5px 2.3px 0 #111827,4.2px 4.2px 0 #111827,2.3px 5.5px 0 #111827,0.0px 6.0px 0 #111827,-2.3px 5.5px 0 #111827,-4.2px 4.2px 0 #111827,-5.5px 2.3px 0 #111827,-6.0px 0.0px 0 #111827,-5.5px -2.3px 0 #111827,-4.2px -4.2px 0 #111827,-2.3px -5.5px 0 #111827,-0.0px -6.0px 0 #111827,2.3px -5.5px 0 #111827,4.2px -4.2px 0 #111827,5.5px -2.3px 0 #111827,0 11px 0 #111827}
.pinkbox{color:#fff;background:${C.pink};padding:10px 28px 6px;border-radius:12px;box-shadow:0 10px 0 rgba(150,10,60,.35)}
.list{color:#fff;font-size:60px;line-height:1.05;text-shadow:5.0px 0.0px 0 #111827,4.6px 1.9px 0 #111827,3.5px 3.5px 0 #111827,1.9px 4.6px 0 #111827,0.0px 5.0px 0 #111827,-1.9px 4.6px 0 #111827,-3.5px 3.5px 0 #111827,-4.6px 1.9px 0 #111827,-5.0px 0.0px 0 #111827,-4.6px -1.9px 0 #111827,-3.5px -3.5px 0 #111827,-1.9px -4.6px 0 #111827,-0.0px -5.0px 0 #111827,1.9px -4.6px 0 #111827,3.5px -3.5px 0 #111827,4.6px -1.9px 0 #111827,0 9px 0 #111827}
.list .n{color:${C.yellow}}
`;

// ───────────────────────── línia de temps ─────────────────────────
const T = [];
const tw = (sel, from, vars, t) => { const o = { sel, from, vars, t }; T.push(o); return o; };
const to = (sel, vars, t) => tw(sel, null, vars, t);
const fromTo = (sel, a, b, t) => tw(sel, a, b, t);
const set = (sel, vars, t) => T.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r2(t)});`);
const raw = (s) => T.push(s);
let camState = { x: 0, y: 0, s: 1 }, lastCam = null;
function cam(t, x, y, s, dur = 1.2, ease = "power2.inOut", blur = false) {
  if (lastCam && t < lastCam.t + lastCam.dur) lastCam.tw.forEach((o) => (o.vars.duration = r2(Math.max(0.15, t - lastCam.t))));
  const tws = [to("#zoom", { scale: s, duration: dur, ease }, t), to("#pan", { x: -x, y: -y, duration: dur, ease }, t), to("#bgpan", { x: -x * 0.5, y: -y * 0.5, duration: dur, ease }, t)];
  lastCam = { t, dur, tw: tws };
  if (blur) { to("#zoom", { filter: "blur(8px)", duration: dur * 0.45, ease: "power2.in" }, t); to("#zoom", { filter: "blur(0px)", duration: dur * 0.5, ease: "power2.out" }, t + dur * 0.45); }
  camState = { x, y, s };
}
const punch = (t, s = 1.05) => { to("#punchz", { scale: s, duration: 0.14, ease: "power3.out" }, t); to("#punchz", { scale: 1, duration: 0.5, ease: "power2.inOut" }, t + 0.16); };
const slam = (sel, t, d) => {
  fromTo(sel, { opacity: 0, scale: 1.6, rotation: -3 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.32, ease: "back.out(2.2)" }, t);
  if (d) to(sel, { opacity: 0, scale: 0.9, y: -20, duration: 0.3, ease: "power2.in" }, t + d - 0.3);
};

const { svg: WSVG, sig } = world();
raw(`gsap.set(["#lens","#shield","#woundFill","#epiL","#epiR","#lensWrap"], {svgOrigin:"0 0"});`);
raw(`gsap.set("#woundFill", {scaleY:0}); gsap.set(["#epiL","#epiR"], {scaleX:0});`);

// Títols (en pantalla).
const TXT = [
  ["tTitle", "yellow", "left:0;right:0;top:60px;text-align:center;font-size:104px", "COM ES REPARA<br>EL TEIXIT?"],
  ["tRep", "white", "left:110px;top:100px;font-size:96px", "REPARACIÓ"],
  ["tTwo", "pinkbox", "left:110px;top:100px;font-size:88px", "2 PROCESSOS PRINCIPALS"],
  ["tReg", "white", "left:0;right:0;top:110px;text-align:center;font-size:150px", "REGENERACIÓ"],
  ["tSame", "yellow", "left:110px;top:150px;font-size:78px", "MATEIX TIPUS<br>DE CÈL·LULA"],
  ["tL1", "list", "left:110px;top:130px", '<span class="n">1.</span> CÈL·LULES<br>&nbsp;&nbsp;&nbsp;&nbsp;SUPERVIVENTS'],
  ["tL2", "list", "left:110px;top:400px", '<span class="n">2.</span> CÈL·LULES AMB<br>&nbsp;&nbsp;&nbsp;&nbsp;CAPACITAT DE<br>&nbsp;&nbsp;&nbsp;&nbsp;PROLIFERACIÓ'],
  ["tDiv", "pinkbox", "left:110px;top:200px;font-size:96px", "DIVISIÓ"],
  ["tMig", "pinkbox", "left:110px;top:360px;font-size:96px", "MIGRACIÓ"],
  ["tStruct", "yellow", "left:110px;top:150px;font-size:88px", "ESTRUCTURA<br>RECUPERADA"],
  ["tProt", "white", "left:110px;top:440px;font-size:88px", "FUNCIÓ<br>PROTECTORA"],
];
const txtHTML = TXT.map(([id, cls, style, html]) => `<div class="t ${cls}" id="${id}" style="${style}">${html}</div>`).join("");

// ═════ 0–8 s · com es repara el teixit? ═════
set("#zoom", { scale: 1.25 }, 0); set("#pan", { x: 0, y: 60 }, 0); set("#bgpan", { x: 0, y: 30 }, 0);
camState = { x: 0, y: -60, s: 1.25 };
cam(0, 0, -40, 0.86, 1.4, "power3.out");
slam("#tTitle", 0.05, 2.4);
punch(FX.title);
// l'organisme activa la reparació: senyals pels vasos cap a la ferida (sobre les purpurines)
sig.forEach((s, i) => {
  const t = [FX.glit1, FX.glit2, FX.glit3][i % 3] - 0.1 + (i % 4) * 0.12;
  fromTo(`#${s.id}`, { opacity: 0, scale: 0.4, x: 0, y: 0 }, { opacity: 1, scale: 1.2, duration: 0.3 }, t);
  to(`#${s.id}`, { x: r2(-s.x * 0.82), y: r2(-s.y - 30 + 20), duration: 1.6, ease: "power2.in" }, t + 0.3);
  to(`#${s.id}`, { opacity: 0, scale: 0.3, duration: 0.3 }, t + 1.9);
});
fromTo("#wound", { opacity: 1 }, { opacity: 0.75, duration: 0.25, yoyo: true, repeat: 5 }, FX.glit1);
slam("#tRep", P("reparació") - 0.05, 4.6);
cam(1.6, 0, -40, 1.25, 5.0, "sine.inOut");
fromTo("#topWound", { scale: 1 }, { scale: 1.06, duration: 0.3, yoyo: true, repeat: 3, svgOrigin: "45 -190" }, P("dany"));

// ═════ 8–11 s · 2 processos principals ═════
cam(FX.glock1 - 0.3, 0, 20, 0.92, 0.9);
slam("#tTwo", FX.glock1, P("regeneració") - FX.glock1 - 0.1);
punch(FX.glock2, 1.04);

// ═════ 11–20 s · regeneració ═════
slam("#tReg", FX.boom - 0.05, 2.2);
punch(FX.boom, 1.08);
fromTo("#lensLink", { opacity: 0 }, { opacity: 1, duration: 0.4 }, P("procés") + 0.6);
fromTo("#lensWrap", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, P("procés") + 0.7);
cam(P("procés") + 0.4, 560, -20, 0.72, 1.0);
// entrem a la lupa
cam(P("cèl·lules", 1) - 0.2, LENS.x - 250, LENS.y + 10, 1.6, 1.2, "power3.inOut", true);
// les cèl·lules destruïdes es desfan (cop més fort de l'àudio)
gapCells.forEach((c, i) => {
  fromTo(`#d_${c.id}`, { x: 0 }, { x: 4, duration: 0.05, repeat: 5, yoyo: true }, P("destruïdes") - 0.5 + (i % 3) * 0.05);
  to(`#d_${c.id}`, { opacity: 0, scale: 0.2, rotation: (i % 2 ? 1 : -1) * 40, y: 30, duration: 0.6, ease: "power2.in" }, FX.crumble + (i % 5) * 0.08);
});
// cèl·lules noves del mateix tipus (primeres, sobre l'efecte)
const firstNew = gapCells.filter((c) => c.basal);
firstNew.forEach((c, i) => fromTo(`#n_${c.id}`, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, FX.newCells + i * 0.25));
slam("#tSame", P("mateix") - 0.1, 2.3);

// ═════ 20–28 s · d'on surten ═════
edgeCells.forEach((c, i) => fromTo(`#sv_${c.id}`, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }, FX.item1 + (i % 4) * 0.06));
basalCells.forEach((c, i) => fromTo(`#bs_${c.id}`, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }, FX.item2 + (i % 5) * 0.05));
slam("#tL1", FX.item1, P("durant") - FX.item1 - 0.1);
slam("#tL2", FX.item2, P("durant") - FX.item2 - 0.1);
cam(P("aquestes") - 0.2, LENS.x - 270, LENS.y + 30, 1.5, 1.4);

// ═════ 28–36 s · divisió i migració ═════
[...edgeCells.map((c) => `#sv_${c.id}`), ...basalCells.map((c) => `#bs_${c.id}`)].forEach((s) => to(s, { opacity: 0, duration: 0.4 }, P("durant")));
// les cèl·lules de la vora es divideixen (polsen) i les noves migren cap al forat
const tDiv = P("divideixen"), tMig = P("migren"), tRec = P("reconstruir");
slam("#tDiv", tDiv - 0.05, P("teixit", 3) - tDiv + 0.8);
slam("#tMig", tMig - 0.05, P("teixit", 3) - tMig + 0.8);
edgeCells.forEach((c, i) => fromTo(`#${c.id}`, { scale: 1 }, { scale: 1.18, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, tDiv + (i % 4) * 0.1));
fromTo(["#migL", "#migR"], { opacity: 0, x: 0 }, { opacity: 1, duration: 0.3 }, tMig);
fromTo("#migL", { x: -30 }, { x: 30, duration: 0.6, repeat: 3, ease: "power1.inOut" }, tMig + 0.2);
fromTo("#migR", { x: 30 }, { x: -30, duration: 0.6, repeat: 3, ease: "power1.inOut" }, tMig + 0.2);
to(["#migL", "#migR"], { opacity: 0, duration: 0.4 }, tRec + 0.2);
const rest = gapCells.filter((c) => !c.basal).sort((a, b) => b.y - a.y || Math.abs(b.x) - Math.abs(a.x));
rest.forEach((c, i) => {
  const t = tMig + 0.6 + (i / rest.length) * (tRec + 0.6 - tMig);
  fromTo(`#n_${c.id}`, { opacity: 0, x: c.x < 0 ? -140 : 140, scale: 0.6 }, { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "power2.out" }, t);
});
// a la vegada, al bloc, la ferida s'omple (es veurà en sortir)
to("#woundFill", { scaleY: 1, duration: 5.0, ease: "power1.inOut" }, tMig);
to(["#epiL", "#epiR"], { scaleX: 1, duration: 4.0, ease: "power1.inOut" }, tMig + 1.5);
to("#wound", { opacity: 0, duration: 2.0 }, tRec);
to("#topHeal", { opacity: 1, duration: 2.0 }, tRec);

// ═════ 36–42 s · estructura i funció recuperades ═════
const tOut = P("d'aquesta") - 0.1;
to("#lensWrap", { opacity: 0, scale: 0.4, duration: 0.8, ease: "power2.in" }, tOut + 0.4);
to("#lensLink", { opacity: 0, duration: 0.4 }, tOut + 0.4);
cam(tOut, -330, -40, 0.86, 1.6, "power3.inOut", true);
slam("#tStruct", P("recuperar", 2) - 0.05, DUR - P("recuperar", 2) + 0.4);
fromTo("#shield", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, P("funció") - 0.05);
slam("#tProt", P("funció") - 0.05, DUR - P("funció") + 0.4);
punch(P("funció"), 1.04);
cam(P("funció") + 0.3, -350, -60, 0.9, 2.4, "sine.inOut");

// ───────────────────────── escriptura ─────────────────────────
function serialize() {
  const META = new Set(["duration", "ease", "repeat", "yoyo", "repeatDelay", "svgOrigin", "transformOrigin"]);
  const objs = T.filter((o) => typeof o !== "string");
  const props = (o) => Object.keys(o.vars).filter((k) => !META.has(k));
  const byT = [...objs].sort((a, b) => a.t - b.t);
  byT.forEach((a, i) => {
    if (a.vars.repeat) return;
    for (let j = i + 1; j < byT.length; j++) {
      const b = byT[j];
      if (b.t >= a.t + a.vars.duration) break;
      if (JSON.stringify(b.sel) !== JSON.stringify(a.sel) || b.t <= a.t) continue;
      if (props(b).some((k) => props(a).includes(k))) { a.vars.duration = Math.max(0.04, r2(b.t - a.t)); break; }
    }
  });
  return T.map((o) => typeof o === "string" ? o
    : o.from ? `tl.fromTo(${JSON.stringify(o.sel)}, ${JSON.stringify(o.from)}, ${JSON.stringify(o.vars)}, ${r2(o.t)});`
    : `tl.to(${JSON.stringify(o.sel)}, ${JSON.stringify(o.vars)}, ${r2(o.t)});`).join("\n    ");
}
const bgDots = `<svg class="layer" style="left:-3000px;top:-2000px" width="7000" height="4000" viewBox="-3000 -2000 7000 4000">
  <defs><pattern id="gDots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="2.6" fill="#DCE3EC"/></pattern></defs>
  <rect x="-3000" y="-2000" width="7000" height="4000" fill="url(#gDots)"/></svg>`;

fs.writeFileSync(path.join(ROOT, "compositions/world.html"), `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="world" data-width="${W_}" data-height="${H_}">
    <div id="bgSoft"></div>
    <div id="punchz"><div id="cam"><div id="zoom">
      <div id="bgpan">${bgDots}</div>
      <div id="pan">${WSVG}</div>
    </div></div></div>
    <div id="ui">${txtHTML}</div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${serialize()}
    window.__timelines["world"] = tl;
  </script>
</template>
`);
fs.writeFileSync(path.join(ROOT, "index.html"), `<!doctype html>
<html lang="ca">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W_}, height=${H_}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W_}px; height: ${H_}px; overflow: hidden; background: ${C.bg}; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W_}" data-height="${H_}" data-fps="30">
      <div id="world" data-composition-id="world" data-composition-src="compositions/world.html"
        data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="graphics"
        data-width="${W_}" data-height="${H_}" style="z-index:1"></div>
      <audio id="voice" class="clip" src="assets/audio.wav" data-start="0" data-duration="${DUR}" data-track-index="2" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);
console.log(`OK · ${DUR}s · ${T.length} instruccions · ${gapCells.length} cèl·lules a la ferida`);
