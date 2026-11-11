// Generador del vídeo «Per què algunes cèl·lules no paren de dividir-se?» (cicle cel·lular, control i mutacions).
// 1920×1080, fons verd menta #DDF7DE, molt visual i amb poques paraules clau.
// Àudio: la veu de l'usuària + efectes de so (scripts/mix.mjs).
//
//   node scripts/build.mjs && node scripts/mix.mjs && node scripts/build.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const UNTIL = args.includes("--until") ? parseFloat(args[args.indexOf("--until") + 1]) : null;
const W_ = 1920, H_ = 1080;
const DUR = +(UNTIL ?? 73).toFixed(3);
const r2 = (v) => Math.round(v * 100) / 100;
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const words = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/transcript.json"), "utf8"));
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
function P(word, n = 1) {
  const k = norm(word); let c = 0;
  for (const w of words) { const parts = [w.text, ...w.text.split(/[-'’]/)].map(norm); if (parts.includes(k) && ++c === n) return w.start + 0.1; }
  throw new Error(`P(${word},${n})`);
}
const C = { bg: "#DDF7DE", ink: "#064E3B", green: "#16A34A", yellow: "#EAB308", red: "#E11D48", blue: "#2563EB", violet: "#7C3AED" };
const icon = (name, size, color, x = 0, y = 0) =>
  fs.readFileSync(path.join(ROOT, "assets/icons", `${name}.svg`), "utf8").replace("<svg ", `<svg x="${x}" y="${y}" width="${size}" height="${size}" style="color:${color}" `);

// ───────────────────────── il·lustracions ─────────────────────────
const DEFS = `<defs>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#064E3B" flood-opacity="0.18"/></filter>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <radialGradient id="gCyto" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#FCE7F3"/><stop offset="1" stop-color="#F472B6"/></radialGradient>
  <radialGradient id="gCytoBad" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#FECDD3"/><stop offset="1" stop-color="#E11D48"/></radialGradient>
  <radialGradient id="gNuc" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#5B21B6"/></radialGradient>
  <linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#475569"/><stop offset="0.5" stop-color="#CBD5E1"/><stop offset="1" stop-color="#334155"/></linearGradient>
  <linearGradient id="gBox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1F2937"/><stop offset="0.5" stop-color="#374151"/><stop offset="1" stop-color="#111827"/></linearGradient>
</defs>`;
const cell = (id, x, y, r, bad = false, extra = "") => `<g transform="translate(${r2(x)},${r2(y)})"><g id="${id}" ${extra}>
  <circle r="${r}" fill="url(#${bad ? "gCytoBad" : "gCyto"})" stroke="${bad ? "#BE123C" : "#DB2777"}" stroke-width="4"/>
  <circle cx="${r2(-r * 0.1)}" cy="${r2(-r * 0.05)}" r="${r2(r * 0.42)}" fill="url(#gNuc)"/>
  <ellipse cx="${r2(-r * 0.35)}" cy="${r2(-r * 0.4)}" rx="${r2(r * 0.22)}" ry="${r2(r * 0.12)}" fill="#fff" opacity="0.45" transform="rotate(-30 ${r2(-r * 0.35)} ${r2(-r * 0.4)})"/></g></g>`;
const light = (id, colOn, y) => `<circle id="${id}" cy="${y}" r="62" fill="${colOn}" opacity="0.18"/>`;
const trafficLight = (pfx) => `<g>
  <rect x="-20" y="250" width="40" height="300" fill="url(#gMetal)"/>
  <rect x="-100" y="-260" width="200" height="520" rx="40" fill="url(#gBox)" filter="url(#shadow)"/>
  ${light(pfx + "R", "#EF4444", -160)}${light(pfx + "Y", "#FACC15", 0)}${light(pfx + "G", "#22C55E", 160)}
</g>`;
// Doble hèlix (pla) amb n barres; les barres tenen id per poder trencar-ne una.
function helix(pfx, n, len) {
  let s = "", top = "M", bot = "M";
  for (let i = 0; i <= 60; i++) { const x = -len / 2 + (len * i) / 60, y = Math.sin((i / 60) * Math.PI * 4) * 70; top += `${r2(x)} ${r2(y)} `; bot += `${r2(x)} ${r2(-y)} `; if (i < 60) { top += "L"; bot += "L"; } }
  for (let i = 0; i < n; i++) { const x = -len / 2 + (len * (i + 0.5)) / n, y = Math.sin(((i + 0.5) / n) * Math.PI * 4) * 70; s += `<path id="${pfx}r${i}" d="M${r2(x)} ${r2(y)} V${r2(-y)}" stroke="${["#38BDF8", "#F59E0B", "#22C55E", "#A78BFA"][i % 4]}" stroke-width="12" stroke-linecap="round"/>`; }
  return `${s}<path d="${top}" stroke="#2563EB" stroke-width="14" fill="none" stroke-linecap="round"/><path d="${bot}" stroke="#DB2777" stroke-width="14" fill="none" stroke-linecap="round"/>`;
}
// Pedals (accelerador i fre).
const pedals = () => `<g>
  <rect x="-260" y="-40" width="520" height="40" rx="12" fill="#334155"/>
  <g transform="translate(-130,0)"><g id="gas"><rect x="-55" y="0" width="110" height="200" rx="18" fill="url(#gMetal)"/>${[0, 1, 2, 3].map((i) => `<rect x="-40" y="${30 + i * 40}" width="80" height="12" rx="6" fill="#1F2937" opacity="0.5"/>`).join("")}</g></g>
  <g transform="translate(130,0)"><g id="brake"><rect x="-75" y="0" width="150" height="130" rx="22" fill="url(#gMetal)"/>${[0, 1, 2].map((i) => `<rect x="-55" y="${28 + i * 34}" width="110" height="12" rx="6" fill="#1F2937" opacity="0.5"/>`).join("")}</g></g>
</g>`;

const SX = (i) => (i - 1) * 3000;
const R = rng(11);
// Escena 1 i 11: creixement de cèl·lules (posicions de la massa).
const mass = Array.from({ length: 64 }, (_, i) => { const a = i * 2.39996, d = Math.sqrt(i) * 46; return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.85, r: 40 + R() * 10 }; });
const seq = "ATGCGTACTTGA".split("");
const baseCol = { A: "#22C55E", T: "#EF4444", G: "#F59E0B", C: "#3B82F6" };

function world() {
  return `<svg class="layer" style="left:-2000px;top:-1500px" width="38000" height="3000" viewBox="-2000 -1500 38000 3000">
  ${DEFS}
  <!-- 1 · cèl·lules que es divideixen sense parar -->
  <g transform="translate(${SX(1) - 380},40)">${mass.slice(0, 16).map((c, i) => cell(`m${i}`, c.x, c.y, c.r, false, 'opacity="0"')).join("")}</g>
  <g transform="translate(${SX(1) + 480},120)"><g id="pedals" opacity="0">${pedals()}</g></g>
  <g transform="translate(${SX(1) + 610},-130)"><g id="noone" opacity="0">${icon("question", 110, "#94A3B8", -55, -55)}</g></g>
  <!-- 2 · pausa i interrogant -->
  <g transform="translate(${SX(1) - 380},-300)"><g id="bigQ1" opacity="0">${icon("question", 220, C.red, -110, -110)}</g></g>
  <g transform="translate(${SX(1) + 480},-300)"><g id="pauseI" opacity="0">${icon("pause", 160, "#334155", -80, -80)}</g></g>
  <!-- 3 · mecanismes de control -->
  <g transform="translate(${SX(3)},40)">${cell("c3", 0, 0, 170)}
    ${[["shield-check", -380, -60], ["gear-six", 0, -380], ["faders", 380, -60]].map(([n, x, y], i) => `<g transform="translate(${x},${y})"><g id="ctl${i}" opacity="0"><circle r="105" fill="#fff" filter="url(#shadow)"/>${icon(n, 120, C.green, -60, -60)}</g></g>`).join("")}</g>
  <!-- 4 · cicle cel·lular -->
  <g transform="translate(${SX(4)},40)"><g id="cycle" opacity="0">
    ${[["G1", "#22C55E", 0, 140], ["S", "#3B82F6", 140, 230], ["G2", "#F59E0B", 230, 310], ["M", "#E11D48", 310, 360]].map(([l, c, a0, a1]) => {
      const R1 = 300, A = (d) => ((d - 90) * Math.PI) / 180, x0 = Math.cos(A(a0 + 2)) * R1, y0 = Math.sin(A(a0 + 2)) * R1, x1 = Math.cos(A(a1 - 2)) * R1, y1 = Math.sin(A(a1 - 2)) * R1, mid = A((a0 + a1) / 2);
      return `<path d="M${r2(x0)} ${r2(y0)} A${R1} ${R1} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${r2(x1)} ${r2(y1)}" stroke="${c}" stroke-width="70" fill="none"/><text x="${r2(Math.cos(mid) * 420)}" y="${r2(Math.sin(mid) * 420 + 22)}" text-anchor="middle" font-family="Archivo Black,Inter" font-size="64" fill="${c}">${l}</text>`;
    }).join("")}
    <g id="rider">${cell("c4", 0, -300, 70)}</g></g></g>
  <!-- 5 · semàfor -->
  <g transform="translate(${SX(5) - 420},20)">${trafficLight("s5")}</g>
  <g transform="translate(${SX(5) + 330},40)"><g id="c5a">${cell("c5", 0, 0, 150)}</g><g id="c5b" opacity="0">${cell("c5x", 0, 0, 150)}</g></g>
  <!-- 6–7 · revisió de l'ADN -->
  <g transform="translate(${SX(6)},20)"><g id="dna6">${helix("h6", 16, 1300)}</g>
    <g id="lens6" opacity="0"><circle r="130" fill="#fff" fill-opacity="0.25" stroke="#334155" stroke-width="16"/><path d="M92 92 L190 190" stroke="#334155" stroke-width="28" stroke-linecap="round"/></g>
    <g transform="translate(110,0)"><g id="crack" opacity="0"><path d="M-30 -60 L10 -10 L-20 10 L30 60" stroke="${C.red}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>
    <g transform="translate(110,-230)"><g id="wrench" opacity="0">${icon("wrench", 160, "#334155", -80, -80)}</g></g></g>
  <g transform="translate(${SX(6) + 760},-280) scale(0.42)"><g id="tl7" opacity="0">${trafficLight("s7")}</g></g>
  <!-- 8 · apoptosi -->
  <g transform="translate(${SX(8)},40)"><g id="c8w">${cell("c8", 0, 0, 200, true)}</g>
    ${Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2; return `<g transform="translate(${r2(Math.cos(a) * 60)},${r2(Math.sin(a) * 60)})"><g id="frag${i}" opacity="0"><circle r="${30 + (i % 3) * 10}" fill="url(#gCytoBad)" stroke="#BE123C" stroke-width="3"/></g></g>`; }).join("")}</g>
  <!-- 9 · el sistema falla -->
  <g transform="translate(${SX(9)},20)"><g id="tl9">${trafficLight("s9")}</g>
    <g transform="translate(150,-200)"><g id="spark" opacity="0">${icon("lightning", 140, C.yellow, -70, -70)}</g></g></g>
  <!-- 10 · mutació: seqüència -->
  <g transform="translate(${SX(10)},40)">
    ${seq.map((b, i) => `<g transform="translate(${-660 + i * 120},0)"><g id="b${i}" opacity="0"><rect x="-52" y="-70" width="104" height="140" rx="20" fill="${baseCol[b]}" filter="url(#shadow)"/><text y="26" text-anchor="middle" font-family="Archivo Black,Inter" font-size="76" fill="#fff">${b}</text></g></g>`).join("")}
    <g transform="translate(${-660 + 6 * 120},0)"><g id="bMut" opacity="0"><rect x="-52" y="-70" width="104" height="140" rx="20" fill="${C.violet}" stroke="#fff" stroke-width="8" filter="url(#glow)"/><text y="26" text-anchor="middle" font-family="Archivo Black,Inter" font-size="76" fill="#fff">G</text></g></g></g>
  <!-- 11 · neoplàsia -->
  <g transform="translate(${SX(11) + 300},60)">${mass.map((c, i) => cell(`n${i}`, c.x, c.y, c.r, i % 5 === 0, 'opacity="0"')).join("")}</g>
  <g transform="translate(${SX(11) - 560},10) scale(0.6)"><g id="tl11">${trafficLight("s11")}</g></g>
  </svg>`;
}

const LBL = [];
const lbl = (id, html, x, y, size = 90, color = C.ink) => LBL.push(`<div class="anc" style="left:${x}px;top:${y}px"><div class="ctr"><div class="lbl" id="${id}" style="font-size:${size}px;color:${color}">${html}</div></div></div>`);
lbl("lQ", "T'HAS PREGUNTAT MAI…?", SX(1), -420, 92);
lbl("lCtl", "MECANISMES DE CONTROL", SX(3), 380, 88, C.green);
lbl("lCyc", "CICLE CEL·LULAR", SX(4), -470, 96);
lbl("lGrow", "<span style='color:#16A34A'>●</span> CRÉIXER", SX(5) + 330, -330, 76);
lbl("lDiv", "<span style='color:#EAB308'>●</span> DIVIDIR", SX(5) + 330, -330, 76);
lbl("lStop", "<span style='color:#E11D48'>●</span> ATURAR", SX(5) + 330, -330, 76);
lbl("lDna", "REVISIÓ DE L'ADN", SX(6), -400, 92);
lbl("lRep", "ATURA I REPARA", SX(6), 360, 88, C.green);
lbl("lApo", "APOPTOSI", SX(8), 380, 110, C.red);
lbl("lFail", "?", SX(9) + 420, -60, 260, C.red);
lbl("lMut", "MUTACIONS", SX(10), -330, 110, C.violet);
lbl("lNeo", "NEOPLÀSIA", SX(11) + 300, 440, 120, C.red);

const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif}
#bgSoft{position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 45%, #EEFDEF, ${C.bg} 70%)}
#punchz{position:absolute;left:${W_ / 2}px;top:${H_ / 2}px;width:0;height:0}
#cam,#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
.anc{position:absolute;width:0;height:0}
.ctr{position:absolute;left:0;top:0;transform:translate(-50%,-50%)}
.lbl{font-family:"Archivo Black",Inter,sans-serif;white-space:nowrap;opacity:0;letter-spacing:.01em}
#freeze{position:absolute;inset:0;background:#064E3B;mix-blend-mode:saturation;opacity:0;pointer-events:none}
`;

// ───────────────────────── línia de temps ─────────────────────────
const T = [], SFX = [];
const sfx = (file, t, vol = 0.4) => SFX.push({ file, t: +Math.max(0, t).toFixed(3), vol });
const tw = (sel, from, vars, t) => { const o = { sel, from, vars, t }; T.push(o); return o; };
const to = (sel, vars, t) => tw(sel, null, vars, t);
const fromTo = (sel, a, b, t) => tw(sel, a, b, t);
const set = (sel, vars, t) => T.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r2(t)});`);
const raw = (s) => T.push(s);
let wk = 0, pk = 0, lastCam = null, camX = 0;
const whoosh = () => ["whoosh1", "whoosh2", "whoosh3"][wk++ % 3];
const popS = () => ["pop1", "pop2"][pk++ % 2];
function cam(t, x, y, s, dur = 1.0, ease = "power3.inOut") {
  if (lastCam && t < lastCam.t + lastCam.dur) lastCam.tw.forEach((o) => (o.vars.duration = r2(Math.max(0.15, t - lastCam.t))));
  const tws = [to("#zoom", { scale: s, duration: dur, ease }, t), to("#pan", { x: -x, y: -y, duration: dur, ease }, t), to("#bgpan", { x: -x * 0.5, y: -y * 0.5, duration: dur, ease }, t)];
  lastCam = { t, dur, tw: tws };
  if (Math.abs(x - camX) > 1500) { to("#zoom", { filter: "blur(10px)", duration: dur * 0.45, ease: "power2.in" }, t); to("#zoom", { filter: "blur(0px)", duration: dur * 0.5, ease: "power2.out" }, t + dur * 0.45); sfx(whoosh(), t + dur * 0.5, 0.32); }
  camX = x;
}
const punch = (t, s = 1.05) => { to("#punchz", { scale: s, duration: 0.14, ease: "power3.out" }, t); to("#punchz", { scale: 1, duration: 0.5, ease: "power2.inOut" }, t + 0.16); };
const pop = (sel, t, snd = true, extra = {}) => { fromTo(sel, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)", ...extra }, t); if (snd) sfx(popS(), t + 0.05, 0.3); };
const slam = (sel, t, snd = "impact", vol = 0.35) => { fromTo(sel, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power4.in" }, t); sfx(snd, t + 0.28, vol); punch(t + 0.3, 1.04); };
const out = (sel, t, d = 0.3) => to(sel, { opacity: 0, scale: 0.85, duration: d, ease: "power2.in" }, t);
const lamp = (pfx, which, t) => ["R", "Y", "G"].forEach((k) => to(`#${pfx}${k}`, { opacity: k === which ? 1 : 0.18, duration: 0.15 }, t));

const ALL = ["pedals", "gas", "brake", "noone", "bigQ1", "pauseI", "ctl0", "ctl1", "ctl2", "cycle", "rider", "c3", "c4", "c5", "c5a", "c5b", "c5x", "lens6", "crack", "wrench", "tl7", "c8w", "spark", "tl9", "bMut", "tl11"];
raw(`gsap.set(${JSON.stringify(ALL.map((x) => "#" + x))}, {svgOrigin:"0 0"});`);
raw(`gsap.set(${JSON.stringify([...mass.map((_, i) => "#n" + i), ...mass.slice(0, 16).map((_, i) => "#m" + i), ...Array.from({ length: 9 }, (_, i) => "#frag" + i), ...seq.map((_, i) => "#b" + i)])}, {svgOrigin:"0 0"});`);

// ═════ 1 · divisió sense parar (0–8 s) ═════
set("#zoom", { scale: 1.25 }, 0); set("#pan", { x: -(SX(1) - 380), y: -40 }, 0);
cam(0, SX(1), -20, 0.9, 1.6, "power3.out");
slam("#lQ", 0.15, "pop2", 0.3);
[1, 2, 4, 8, 16].forEach((n, g) => {
  const t = 0.5 + g * 0.55;
  for (let i = 0; i < n; i++) if (i >= (g ? n / 2 : 0)) fromTo(`#m${i}`, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, t + i * 0.02);
  sfx("pop1", t, 0.22);
});
pop("#pedals", P("l'accelerador") - 0.3);
fromTo("#gas", { scaleY: 1, y: 0 }, { scaleY: 0.82, y: 20, duration: 0.25, ease: "power3.in" }, P("l'accelerador"));
sfx("click1", P("l'accelerador") + 0.2, 0.4);
pop("#noone", P("ningú"));
fromTo("#noone", { rotation: -10 }, { rotation: 10, duration: 0.15, repeat: 5, yoyo: true }, P("ningú") + 0.3);
mass.slice(0, 16).forEach((_, i) => fromTo(`#m${i}`, { scale: 1 }, { scale: 1.06, duration: 0.3, repeat: 9, yoyo: true }, 3.5 + (i % 4) * 0.08));

// ═════ 2 · un moment… (8–15 s) ═════
fromTo("#freeze", { opacity: 0 }, { opacity: 0.85, duration: 0.25 }, P("moment") - 0.1);
sfx("impact", P("moment"), 0.3);
pop("#pauseI", P("moment") - 0.05, false);
out("#lQ", P("moment"));
pop("#bigQ1", P("sistema"));
fromTo("#bigQ1", { y: 0 }, { y: -20, duration: 0.4, repeat: 5, yoyo: true, ease: "sine.inOut" }, P("sistema") + 0.4);

// ═════ 3 · sí: mecanismes de control (15–20 s) ═════
to("#freeze", { opacity: 0, duration: 0.3 }, P("doncs") - 0.2);
cam(P("doncs") - 0.3, SX(3), 0, 0.95, 1.0);
[0, 1, 2].forEach((i) => pop(`#ctl${i}`, P("mecanismes", 1) + i * 0.3));
fromTo("#ctl1", { rotation: 0 }, { rotation: 180, duration: 2.5, ease: "none" }, P("mecanismes", 1) + 0.6);
slam("#lCtl", P("controlar-ho") - 0.2, "pop2", 0.3);

// ═════ 4 · cicle cel·lular (20–27 s) ═════
cam(P("normalment") - 0.3, SX(4), 0, 0.82, 1.0);
pop("#cycle", P("cicle", 1) - 0.4);
slam("#lCyc", P("cicle", 1), "pop2", 0.3);
fromTo("#rider", { rotation: 0 }, { rotation: 360, duration: 4.0, ease: "none" }, P("cicle", 1) + 0.3);
fromTo("#c4", { rotation: 0 }, { rotation: -360, duration: 4.0, ease: "none" }, P("cicle", 1) + 0.3);

// ═════ 5 · semàfor (27–35 s) ═════
cam(P("aquests") - 0.3, SX(5), -20, 0.95, 1.0);
lamp("s5", "none", 0);
lamp("s5", "G", P("créixer", 2) - 0.1); sfx("click1", P("créixer", 2), 0.4);
slam("#lGrow", P("créixer", 2) - 0.05, "pop1", 0.25); out("#lGrow", P("dividir", 2) - 0.25);
to("#c5a", { scale: 1.25, duration: 0.6, ease: "back.out(2)" }, P("créixer", 2));
lamp("s5", "Y", P("dividir", 2) - 0.1); sfx("click1", P("dividir", 2), 0.4);
slam("#lDiv", P("dividir", 2) - 0.05, "pop2", 0.25); out("#lDiv", P("d'aturar") - 0.25);
to("#c5a", { x: -130, scale: 0.9, duration: 0.5, ease: "power3.inOut" }, P("dividir", 2) + 0.1);
fromTo("#c5b", { opacity: 0, x: 0, scale: 0.9 }, { opacity: 1, x: 130, scale: 0.9, duration: 0.5, ease: "power3.inOut" }, P("dividir", 2) + 0.1);
lamp("s5", "R", P("d'aturar") - 0.1); sfx("click1", P("d'aturar"), 0.4);
slam("#lStop", P("d'aturar") - 0.05, "impact", 0.3);

// ═════ 6–7 · revisió i reparació de l'ADN (35–46 s) ═════
cam(P("abans") - 0.3, SX(6), 0, 0.95, 1.0);
slam("#lDna", P("comprova") - 0.1, "pop2", 0.3);
pop("#lens6", P("l'adn", 1) - 0.2);
fromTo("#lens6", { x: -560 }, { x: 560, duration: 3.6, ease: "sine.inOut" }, P("l'adn", 1));
sfx("rub", P("l'adn", 1) + 0.5, 0.15);
out("#lens6", P("problema", 1) - 0.1);
// problema: una barra es trenca, semàfor vermell, eines que reparen
fromTo("#h6r9", { stroke: "#A78BFA" }, { stroke: "#E11D48", duration: 0.2 }, P("problema", 1) - 0.1);
pop("#crack", P("problema", 1) - 0.1);
sfx("impact", P("problema", 1), 0.3);
pop("#tl7", P("aturar", 2) - 0.3, false);
lamp("s7", "R", P("aturar", 2)); sfx("click1", P("aturar", 2) + 0.05, 0.4);
pop("#wrench", P("reparar-lo") - 0.3);
fromTo("#wrench", { rotation: -30 }, { rotation: 30, duration: 0.2, repeat: 5, yoyo: true }, P("reparar-lo"));
sfx("rub", P("reparar-lo"), 0.25);
to("#crack", { opacity: 0, duration: 0.3 }, P("reparar-lo") + 1.0);
to("#h6r9", { stroke: "#22C55E", duration: 0.3 }, P("reparar-lo") + 1.0);
slam("#lRep", P("reparar-lo") + 0.2, "pop1", 0.3);
out("#lRep", P("si", 4) - 0.2);

// ═════ 8 · apoptosi (46–49 s) ═════
cam(P("si", 4) - 0.3, SX(8), 0, 0.95, 0.8);
fromTo("#c8w", { x: 0 }, { x: 8, duration: 0.06, repeat: 9, yoyo: true }, P("greu") - 0.3);
to("#c8w", { scale: 0.55, duration: 0.6, ease: "power2.in" }, P("activar") - 0.2);
to("#c8w", { opacity: 0, duration: 0.2 }, P("l'apoptosi"));
Array.from({ length: 9 }).forEach((_, i) => { const a = (i / 9) * Math.PI * 2; fromTo(`#frag${i}`, { opacity: 0, x: 0, y: 0, scale: 0.4 }, { opacity: 1, x: r2(Math.cos(a) * 230), y: r2(Math.sin(a) * 230), scale: 1, duration: 0.7, ease: "power2.out" }, P("l'apoptosi")); });
sfx("impact", P("l'apoptosi") + 0.05, 0.35);
slam("#lApo", P("l'apoptosi") + 0.1, "pop2", 0.25);

// ═════ 9 · el sistema falla (49–52 s) ═════
cam(P("però", 2) - 0.3, SX(9), -20, 0.95, 0.8);
lamp("s9", "G", P("però", 2));
[0, 1, 2, 3, 4].forEach((i) => { lamp("s9", ["R", "Y", "G", "R", "Y"][i], P("falla") - 0.6 + i * 0.12); });
lamp("s9", "none", P("falla") + 0.1);
pop("#spark", P("falla"));
fromTo("#tl9", { rotation: 0 }, { rotation: 4, duration: 0.07, repeat: 7, yoyo: true }, P("falla"));
sfx("impact", P("falla") + 0.05, 0.35);
slam("#lFail", P("falla") + 0.2, "pop2", 0.25);

// ═════ 10 · mutacions (52–58 s) ═════
cam(P("aquí") - 0.3, SX(10), 0, 0.95, 0.8);
seq.forEach((_, i) => { fromTo(`#b${i}`, { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, P("aquí") + 0.3 + i * 0.08); });
[0, 4, 8].forEach((i) => sfx("pop1", P("aquí") + 0.3 + i * 0.08, 0.15));
slam("#lMut", P("mutacions", 1), "pop2", 0.3);
to("#b6", { y: -220, opacity: 0, rotation: -30, duration: 0.5, ease: "power2.in" }, P("canvis") - 0.1);
fromTo("#bMut", { opacity: 0, y: 220 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.8)" }, P("canvis") + 0.3);
sfx("click1", P("canvis") + 0.7, 0.45);
punch(P("canvis") + 0.8, 1.05);

// ═════ 11 · neoplàsia (58–73 s) ═════
cam(P("problema", 2) - 0.3, SX(11), 0, 0.95, 1.0);
lamp("s11", "R", P("problema", 2));
fromTo("#tl11", { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0);
const tN0 = P("deixen"), tN1 = P("neoplàsies") + 0.3;
mass.forEach((c, i) => fromTo(`#n${i}`, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, P("mutacions", 3) + Math.sqrt(i / mass.length) * (tN1 - P("mutacions", 3))));
[0, 1, 2, 3, 4, 5, 6, 7].forEach((k) => sfx("pop2", P("mutacions", 3) + k * ((tN1 - P("mutacions", 3)) / 8), 0.13));
fromTo("#tl11", { rotation: 0 }, { rotation: 3, duration: 0.1, repeat: 5, yoyo: true }, tN0);
cam(P("mutacions", 3), SX(11) + 120, 20, 0.85, tN1 - P("mutacions", 3), "sine.inOut");
slam("#lNeo", P("neoplàsies") - 0.1, "impact", 0.4);

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
// «none» apaga totes les llums del semàfor
for (const o of T) if (typeof o !== "string" && o.vars && o.vars.opacity === 0.18 && false) {}
const bgDots = `<svg class="layer" style="left:-3000px;top:-2000px" width="40000" height="4000" viewBox="-3000 -2000 40000 4000">
  <defs><pattern id="gDots" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="32" cy="32" r="2.8" fill="#BFEBC4"/></pattern></defs>
  <rect x="-3000" y="-2000" width="40000" height="4000" fill="url(#gDots)"/></svg>`;
fs.writeFileSync(path.join(ROOT, "compositions/world.html"), `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="world" data-width="${W_}" data-height="${H_}">
    <div id="bgSoft"></div>
    <div id="punchz"><div id="cam"><div id="zoom">
      <div id="bgpan">${bgDots}</div>
      <div id="pan">${world()}${LBL.join("")}</div>
    </div></div></div>
    <div id="freeze"></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${serialize()}
    window.__timelines["world"] = tl;
  </script>
</template>
`);
if (!UNTIL) fs.writeFileSync(path.join(ROOT, "assets/sfx-cues.json"), JSON.stringify(SFX.filter((s) => s.t < DUR).sort((a, b) => a.t - b.t), null, 1));
const hasMix = fs.existsSync(path.join(ROOT, "assets/mix.wav"));
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
      <audio id="soundtrack" class="clip" src="${hasMix ? "assets/mix.wav" : "assets/voz.wav"}" data-start="0" data-duration="${DUR}" data-track-index="2" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);
console.log(`OK · ${DUR}s · ${T.length} instruccions · ${SFX.length} efectes`);
