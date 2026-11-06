// Generador del vídeo «Exemple: el nen i la pizza» (etiologia, patogènia, anatomia patològica,
// fisiopatologia i semiologia). 1920×1080, fons clar, il·lustració realista 2D pròpia.
// Àudio: la veu de l'usuària amb els seus efectes (assets/audio.wav, −14 LUFS).
// Cada animació cau sobre la paraula (P) o sobre el glockenspiel de cada concepte (FX).
//
//   node scripts/build.mjs             vídeo sencer
//   node scripts/build.mjs --until 10  només fins al segon 10

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const UNTIL = args.includes("--until") ? parseFloat(args[args.indexOf("--until") + 1]) : null;
const W_ = 1920, H_ = 1080;
const DUR = +(UNTIL ?? 27.3).toFixed(3);
const r2 = (v) => Math.round(v * 100) / 100;

const words = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/transcript.json"), "utf8"));
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
function P(word, n = 1) {
  const k = norm(word);
  let c = 0;
  for (const w of words) if ((norm(w.text) === k || norm(w.text.split(/['’]/).pop()) === k) && ++c === n) return w.start;
  throw new Error(`P(${word},${n})`);
}
// Glockenspiel de cada concepte (detectat a l'àudio, banda aguda).
const FX = { etio: 6.2, pato: 10.05, anat: 13.95, fisio: 18.55, semio: 22.75 };
const C = { bg: "#F3F6FA", yellow: "#FFD21F", red: "#E11D48", blue: "#2563EB" };
const icon = (name, size, color, x = 0, y = 0) =>
  fs.readFileSync(path.join(ROOT, "assets/icons", `${name}.svg`), "utf8").replace("<svg ", `<svg x="${x}" y="${y}" width="${size}" height="${size}" style="color:${color}" `);

// ───────────────────────── art ─────────────────────────
const DEFS = `<defs>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#0F172A" flood-opacity="0.2"/></filter>
  <radialGradient id="gSkin" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stop-color="#FFD9BC"/><stop offset="1" stop-color="#E9AE86"/></radialGradient>
  <linearGradient id="gHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B5A2B"/><stop offset="1" stop-color="#5C3A1A"/></linearGradient>
  <linearGradient id="gShirt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2563EB"/><stop offset="0.5" stop-color="#3B82F6"/><stop offset="1" stop-color="#1D4ED8"/></linearGradient>
  <radialGradient id="gBelly" cx="0.45" cy="0.35" r="0.7"><stop offset="0" stop-color="#60A5FA"/><stop offset="1" stop-color="#1D4ED8"/></radialGradient>
  <linearGradient id="gTable" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6A26A"/><stop offset="1" stop-color="#A86F3A"/></linearGradient>
  <radialGradient id="gCrust" cx="0.5" cy="0.5" r="0.5"><stop offset="0.82" stop-color="#F2C46B"/><stop offset="1" stop-color="#C98B34"/></radialGradient>
  <radialGradient id="gCheese" cx="0.45" cy="0.4" r="0.6"><stop offset="0" stop-color="#FFE7A0"/><stop offset="1" stop-color="#F7C948"/></radialGradient>
  <radialGradient id="gPep" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#E5484D"/><stop offset="1" stop-color="#9F1D24"/></radialGradient>
  <linearGradient id="gStom" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4A3AE"/><stop offset="0.6" stop-color="#E07888"/><stop offset="1" stop-color="#B9506A"/></linearGradient>
  <linearGradient id="gFood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5B455"/><stop offset="1" stop-color="#D9822B"/></linearGradient>
  <linearGradient id="gMuc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F09AAA"/><stop offset="1" stop-color="#D86A80"/></linearGradient>
  <linearGradient id="gMus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2475E"/><stop offset="1" stop-color="#9B2F47"/></linearGradient>
</defs>`;

function pizza(id) {
  const pep = [[-50, -40], [40, -55], [-10, 10], [60, 30], [-60, 50], [10, 70]];
  return `<g id="${id}"><circle r="120" fill="url(#gCrust)"/><circle r="100" fill="#D2452E"/><circle r="94" fill="url(#gCheese)"/>
    ${pep.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="url(#gPep)"/>`).join("")}
    <path d="M-80 -20 Q-60 -30 -40 -18 M20 -10 Q40 -20 60 -6" stroke="#FFF3C4" stroke-width="5" fill="none" opacity="0.7"/></g>`;
}

// Nen (vista frontal), pit a (0,0).
function kid() {
  return `<g id="kid">
    <!-- cos -->
    <path d="M-170 -120 Q-170 -170 -110 -170 H110 Q170 -170 170 -120 V260 H-170Z" fill="url(#gShirt)"/>
    <g transform="translate(0,150)"><g id="belly"><ellipse rx="120" ry="86" fill="url(#gBelly)"/><ellipse cx="-34" cy="-30" rx="40" ry="20" fill="#fff" opacity="0.18"/></g></g>
    <rect x="-34" y="-200" width="68" height="50" rx="18" fill="url(#gSkin)"/>
    <!-- braç esquerre (a la panxa) -->
    <g transform="translate(150,-120)"><g id="armL"><rect x="-30" y="0" width="60" height="190" rx="30" fill="#1D4ED8"/>
      <g transform="translate(0,180)"><g id="foreL"><rect x="-26" y="0" width="52" height="150" rx="26" fill="url(#gSkin)"/><circle cy="150" r="36" fill="url(#gSkin)"/></g></g></g></g>
    <!-- cap -->
    <g transform="translate(0,-330)"><g id="head">
      <ellipse cx="-150" cy="10" rx="28" ry="40" fill="url(#gSkin)"/><ellipse cx="150" cy="10" rx="28" ry="40" fill="url(#gSkin)"/>
      <circle r="155" fill="url(#gSkin)"/>
      <path d="M-158 -10 Q-170 -150 -40 -170 Q120 -190 160 -40 Q130 -110 40 -116 Q-60 -120 -110 -60 Q-130 -40 -158 -10Z" fill="url(#gHair)"/>
      <g id="cheeks"><circle cx="-92" cy="40" r="28" fill="#F59E9E" opacity="0.55"/><circle cx="92" cy="40" r="28" fill="#F59E9E" opacity="0.55"/></g>
      <g id="eyes"><ellipse cx="-55" cy="-20" rx="26" ry="30" fill="#fff"/><ellipse cx="55" cy="-20" rx="26" ry="30" fill="#fff"/>
        <circle cx="-50" cy="-14" r="15" fill="#6B3E1F"/><circle cx="60" cy="-14" r="15" fill="#6B3E1F"/>
        <circle cx="-50" cy="-14" r="7" fill="#111"/><circle cx="60" cy="-14" r="7" fill="#111"/>
        <circle cx="-45" cy="-20" r="4" fill="#fff"/><circle cx="65" cy="-20" r="4" fill="#fff"/></g>
      <path id="browsN" d="M-85 -66 Q-55 -78 -28 -66 M28 -66 Q55 -78 85 -66" stroke="#5C3A1A" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path id="browsP" d="M-85 -62 Q-55 -70 -26 -82 M26 -82 Q55 -70 85 -62" stroke="#5C3A1A" stroke-width="9" fill="none" stroke-linecap="round" opacity="0"/>
      <path d="M-6 10 Q0 30 10 34" stroke="#C9845C" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path id="mSmile" d="M-50 66 Q0 104 50 66" stroke="#8B2E2E" stroke-width="9" fill="none" stroke-linecap="round"/>
      <g transform="translate(0,78)"><g id="mOpen" opacity="0"><ellipse rx="62" ry="50" fill="#5B1A1A"/><rect x="-44" y="-50" width="88" height="18" rx="6" fill="#fff"/><ellipse cy="30" rx="34" ry="14" fill="#E57C8A"/></g></g>
      <g id="mFull" opacity="0"><ellipse cx="-92" cy="52" rx="44" ry="38" fill="url(#gSkin)"/><ellipse cx="92" cy="52" rx="44" ry="38" fill="url(#gSkin)"/>
        <path d="M-30 80 Q0 70 30 80" stroke="#8B2E2E" stroke-width="9" fill="none" stroke-linecap="round"/></g>
      <path id="mPain" d="M-50 84 Q-30 66 -10 84 Q10 100 30 82 Q44 70 54 80" stroke="#8B2E2E" stroke-width="9" fill="none" stroke-linecap="round" opacity="0"/>
      <g id="sweat" opacity="0"><path d="M120 -60 Q132 -36 120 -24 Q108 -36 120 -60Z" fill="#7DD3FC"/></g>
    </g></g>
    <!-- braç dret (amb la pizza) -->
    <g transform="translate(-150,-120)"><g id="armR"><rect x="-30" y="0" width="60" height="190" rx="30" fill="#1D4ED8"/>
      <g transform="translate(0,180)"><g id="foreR"><rect x="-26" y="0" width="52" height="150" rx="26" fill="url(#gSkin)"/><circle cy="150" r="36" fill="url(#gSkin)"/></g></g></g></g>
  </g>`;
}

// Estómac anatòmic (forma de J), centrat a (0,0).
const STOM = "M-70 -430 L-26 -430 L-18 -230 C70 -270 230 -240 270 -120 C310 -10 270 120 180 160 L240 196 L300 186 L310 240 L210 262 C120 286 0 266 -100 226 C-240 166 -270 0 -210 -120 C-170 -196 -120 -222 -70 -230 Z";
function stomach(id, withFood) {
  return `<g id="${id}">
    <clipPath id="${id}Clip"><path d="${STOM}"/></clipPath>
    <path d="${STOM}" fill="url(#gStom)" stroke="#9B2F47" stroke-width="10"/>
    <g clip-path="url(#${id}Clip)">
      ${withFood ? `<g id="${id}Food"><rect x="-320" y="0" width="660" height="400" fill="url(#gFood)"/>
        ${Array.from({ length: 14 }, (_, i) => `<circle cx="${-240 + (i % 7) * 80}" cy="${30 + Math.floor(i / 7) * 60 + (i % 2) * 20}" r="${14 + (i % 3) * 6}" fill="${i % 3 ? "#E5484D" : "#FFE7A0"}" opacity="0.85"/>`).join("")}</g>` : ""}
      ${Array.from({ length: 6 }, (_, i) => `<path d="M${-200 + i * 70} -150 q20 60 -6 120 q-24 60 6 130" stroke="#C2475E" stroke-width="6" fill="none" opacity="0.45"/>`).join("")}
    </g>
    <path d="${STOM}" fill="none" stroke="#fff" stroke-width="4" opacity="0.4" transform="translate(-6,-6)"/>
  </g>`;
}

// Paret de l'estómac en tall: plegada (normal) o estirada (plana i més prima).
const wall = (id, folded) => {
  let top = "";
  for (let x = -760; x <= 760; x += 20) {
    const y = folded ? -60 - Math.abs(Math.sin(x / 70)) * 90 : -60 - Math.sin(x / 60) * 6;
    top += `${x === -760 ? "M" : "L"}${x} ${r2(y)} `;
  }
  const t = folded ? 1 : 0.7;
  return `<g id="${id}">
    <path d="${top} L760 ${r2(60 * t)} L-760 ${r2(60 * t)}Z" fill="url(#gMuc)"/>
    <rect x="-760" y="${r2(60 * t)}" width="1520" height="${r2(80 * t)}" fill="#F6C8D2"/>
    <rect x="-760" y="${r2(140 * t)}" width="1520" height="${r2(130 * t)}" fill="url(#gMus)"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M-760 ${r2((150 + i * 20) * t)} H760" stroke="#7F1D2D" stroke-width="3" opacity="0.4"/>`).join("")}
  </g>`;
};

const gear = (id, r) => `<g id="${id}">${Array.from({ length: 10 }, (_, i) => `<rect x="${-r * 0.16}" y="${-r * 1.18}" width="${r * 0.32}" height="${r * 0.4}" rx="${r * 0.06}" fill="#64748B" transform="rotate(${i * 36})"/>`).join("")}<circle r="${r}" fill="#94A3B8"/><circle r="${r * 0.4}" fill="#E2E8F0"/></g>`;

const S = { kid: { x: 0, y: 0 }, stom: { x: 2800, y: 0 }, wall: { x: 5600, y: 0 }, func: { x: 8400, y: 0 } };
function world() {
  const k = S.kid, st = S.stom, wa = S.wall, fu = S.func;
  return `<svg class="layer" style="left:-2000px;top:-1500px" width="13000" height="3000" viewBox="-2000 -1500 13000 3000">
    ${DEFS}
    <!-- nen i taula -->
    <g transform="translate(${k.x},${k.y + 60}) scale(0.95)" filter="url(#shadow)">${kid()}</g>
    <g transform="translate(${k.x},${k.y})"><rect x="-700" y="320" width="1400" height="80" rx="20" fill="url(#gTable)"/><rect x="-700" y="390" width="1400" height="300" fill="#C08A55"/>
      <ellipse cx="300" cy="330" rx="190" ry="34" fill="#fff" opacity="0.95"/></g>
    <g transform="translate(${k.x + 300},${k.y + 250})"><g id="pizzaWrap" opacity="1"><g transform="scale(1,0.9)">${pizza("pizza")}</g></g></g>
    <g transform="translate(${k.x + 290},${k.y + 120})"><g id="belly2" opacity="0">${icon("lightning", 90, C.red, -45, -45)}</g></g>
    <g transform="translate(${k.x + 230},${k.y - 330})"><g id="qm" opacity="0">${icon("question", 130, C.blue, -65, -65)}</g></g>
    ${[[-260, 100, -20], [250, 40, 18], [-230, 230, 10]].map(([x, y, r], i) => `<g transform="translate(${k.x + x},${k.y + y}) rotate(${r})"><g id="bolt${i}" opacity="0">${icon("lightning", 90, C.red, -45, -45)}</g></g>`).join("")}
    <g transform="translate(${k.x - 520},${k.y - 160})"><g id="rew" opacity="0">${icon("rewind", 150, C.blue, -75, -75)}</g></g>
    <g transform="translate(${k.x + 520},${k.y - 160})"><g id="timer" opacity="0">${icon("timer", 150, C.red, -75, -75)}</g></g>
    <g transform="translate(${k.x + 30},${k.y + 200})"><g id="lensK" opacity="0"><circle r="120" fill="#fff" fill-opacity="0.15" stroke="#334155" stroke-width="14"/><path d="M84 84 L170 170" stroke="#334155" stroke-width="26" stroke-linecap="round"/></g></g>

    <!-- estómac -->
    <g transform="translate(${st.x},${st.y + 40})"><g id="stomWrap">${stomach("stA", true)}</g></g>
    <g transform="translate(${st.x - 48},${st.y - 560})"><g id="pour" opacity="0">
      ${Array.from({ length: 6 }, (_, i) => `<circle id="fd${i}" cx="0" cy="${-i * 60}" r="${16 + (i % 3) * 5}" fill="${i % 2 ? "#E5484D" : "#F5B455"}"/>`).join("")}</g></g>
    ${[[-330, 0, 180], [380, -40, 0], [60, -330, -90], [80, 360, 90]].map(([x, y, r], i) => `<g transform="translate(${st.x + 30 + x},${st.y + 40 + y}) rotate(${r})"><g id="arr${i}" opacity="0"><path d="M0 0 H80 M56 -24 L84 0 L56 24" stroke="${C.red}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`).join("")}

    <!-- paret en tall -->
    <g transform="translate(${wa.x},${wa.y + 60})" filter="url(#shadow)">${wall("wFold", true)}<g id="wFlatWrap" opacity="0">${wall("wFlat", false)}</g></g>
    <g transform="translate(${wa.x},${wa.y - 220})"><g id="stretch" opacity="0"><path d="M-520 0 H-200 M-490 -30 L-520 0 L-490 30 M520 0 H200 M490 -30 L520 0 L490 30" stroke="${C.red}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>
    <g transform="translate(${wa.x + 560},${wa.y - 330})"><g id="clockW" opacity="0">${icon("clock", 150, C.blue, -75, -75)}</g></g>
    ${[-420, -140, 140, 420].map((x, i) => `<g transform="translate(${wa.x + x},${wa.y - 330})"><g id="press${i}" opacity="0"><path d="M0 -60 V30 M-26 6 L0 32 L26 6" stroke="#D9822B" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`).join("")}

    <!-- funció: l'estómac treballa més -->
    <g transform="translate(${fu.x - 180},${fu.y + 40}) scale(1.1)"><g id="stomB">${stomach("stB", true)}
      ${[0, 1, 2].map((i) => `<ellipse id="wave${i}" cx="0" cy="0" rx="30" ry="150" fill="none" stroke="#7F1D2D" stroke-width="16" opacity="0"/>`).join("")}</g></g>
    <g transform="translate(${fu.x + 460},${fu.y - 140})">${gear("g1", 110)}</g>
    <g transform="translate(${fu.x + 610},${fu.y + 40})">${gear("g2", 70)}</g>
    ${[0, 1, 2].map((i) => `<g transform="translate(${fu.x + 120 + i * 90},${fu.y - 360})"><g id="drop${i}" opacity="0">${icon("drop", 70, "#38BDF8", -35, -35)}</g></g>`).join("")}
  </svg>`;
}

// ───────────────────────── títols ─────────────────────────
function outline(col, w, drop) {
  const sh = Array.from({ length: 16 }, (_, a) => `${r2(Math.cos((a * Math.PI) / 8) * w)}px ${r2(Math.sin((a * Math.PI) / 8) * w)}px 0 ${col}`);
  return [...sh, `0 ${drop}px 0 ${col}`].join(",");
}
const TITLES = [
  ["tEx", "EXEMPLE", ""],
  ["tEtio", "ETIOLOGIA:", "QUÈ HA PASSAT?"],
  ["tPato", "PATOGÈNIA:", "COM S'HA DESENVOLUPAT?"],
  ["tAnat", "ANATOMIA PATOLÒGICA:", "CANVIS ALS TEIXITS"],
  ["tFisio", "FISIOPATOLOGIA:", "COM S'HA ALTERAT LA FUNCIÓ?"],
  ["tSemio", "SEMIOLOGIA:", "COM SABEM QUÈ LI PASSA?"],
];
const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif}
#bgSoft{position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 45%, #FFFFFF, ${C.bg} 72%)}
#punchz{position:absolute;left:${W_ / 2}px;top:${H_ / 2}px;width:0;height:0}
#cam,#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
.t{position:absolute;left:0;right:0;bottom:70px;text-align:center;font-family:"Archivo Black",Inter,sans-serif;font-size:72px;line-height:1.08;text-transform:uppercase;color:#fff;white-space:nowrap;opacity:0;text-shadow:${outline("#111827", 6, 10)}}
.t .k{color:${C.yellow}}
#tEx{top:70px;bottom:auto;font-size:110px}
#tEx .k{color:#fff;background:${C.red};padding:6px 30px 0;border-radius:14px;text-shadow:none;box-shadow:0 10px 0 rgba(120,10,40,.35)}
`;
const titleHTML = TITLES.map(([id, k, rest]) => `<div class="t" id="${id}"><span class="k">${k}</span>${rest ? "<br>" + rest : ""}</div>`).join("");

// ───────────────────────── línia de temps ─────────────────────────
const T = [];
const tw = (sel, from, vars, t) => { const o = { sel, from, vars, t }; T.push(o); return o; };
const to = (sel, vars, t) => tw(sel, null, vars, t);
const fromTo = (sel, a, b, t) => tw(sel, a, b, t);
const set = (sel, vars, t) => T.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r2(t)});`);
const raw = (s) => T.push(s);
let lastCam = null;
function cam(t, x, y, s, dur = 1.0, ease = "power2.inOut", blur = false) {
  if (lastCam && t < lastCam.t + lastCam.dur) lastCam.tw.forEach((o) => (o.vars.duration = r2(Math.max(0.15, t - lastCam.t))));
  const tws = [to("#zoom", { scale: s, duration: dur, ease }, t), to("#pan", { x: -x, y: -y, duration: dur, ease }, t), to("#bgpan", { x: -x * 0.5, y: -y * 0.5, duration: dur, ease }, t)];
  lastCam = { t, dur, tw: tws };
  if (blur) { to("#zoom", { filter: "blur(10px)", duration: dur * 0.45, ease: "power2.in" }, t); to("#zoom", { filter: "blur(0px)", duration: dur * 0.5, ease: "power2.out" }, t + dur * 0.45); }
}
const punch = (t, s = 1.05) => { to("#punchz", { scale: s, duration: 0.14, ease: "power3.out" }, t); to("#punchz", { scale: 1, duration: 0.5, ease: "power2.inOut" }, t + 0.16); };
const slam = (sel, t, until) => {
  fromTo(sel, { opacity: 0, scale: 1.5, rotation: -2 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.32, ease: "back.out(2.2)" }, t);
  if (until) to(sel, { opacity: 0, y: 20, duration: 0.3, ease: "power2.in" }, until - 0.3);
};
const pop = (sel, t, extra = {}) => fromTo(sel, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)", ...extra }, t);
const mouth = (t, which) => {
  ["#mSmile", "#mOpen", "#mFull", "#mPain"].forEach((m) => to(m, { opacity: m === which ? 1 : 0, duration: 0.12 }, t));
};

raw(`gsap.set(["#head","#armR","#foreR","#armL","#foreL","#belly","#pizzaWrap","#stomWrap","#stB","#g1","#g2","#lensK","#rew","#timer","#qm","#bolt0","#bolt1","#bolt2","#clockW","#arr0","#arr1","#arr2","#arr3","#stomB"], {svgOrigin:"0 0"});`);
raw(`gsap.set("#armR", {rotation:8}); gsap.set("#foreR", {rotation:-16}); gsap.set("#armL", {rotation:-8}); gsap.set("#foreL", {rotation:16});`);
raw(`gsap.set("#stAFood", {y:260}); gsap.set("#stBFood", {y:90});`);

// ═════ 0–5 s · el nen i la pizza ═════
set("#zoom", { scale: 1.2 }, 0); set("#pan", { x: -60, y: 40 }, 0); set("#bgpan", { x: -30, y: 20 }, 0);
cam(0, 60, 0, 0.82, 1.6, "power3.out");
slam("#tEx", 0.05, 2.6);
// agafa la pizza i se la menja d'una mossegada
to("#pizzaWrap", { x: -300, y: -420, scale: 0.55, duration: 0.7, ease: "power2.inOut" }, P("pizza") - 0.4);
to("#armR", { rotation: -30, duration: 0.5, ease: "power2.inOut" }, P("pizza") - 0.4);
to("#foreR", { rotation: -150, duration: 0.5, ease: "power2.inOut" }, P("pizza") - 0.4);
mouth(P("pizza") - 0.1, "#mOpen");
fromTo("#mOpen", { scaleY: 1 }, { scaleY: 1.35, duration: 0.2, svgOrigin: "0 0" }, P("pizza"));
to("#pizzaWrap", { scale: 0.05, y: -425, opacity: 0, duration: 0.35, ease: "power3.in" }, P("mossegada"));
mouth(P("mossegada") + 0.3, "#mFull");
fromTo("#head", { rotation: 0 }, { rotation: 4, duration: 0.12, repeat: 5, yoyo: true }, P("mossegada") + 0.3);
to("#armR", { rotation: 8, duration: 0.6 }, P("mossegada") + 0.4);
to("#foreR", { rotation: -16, duration: 0.6 }, P("mossegada") + 0.4);
punch(P("mossegada") + 0.3, 1.06);
pop("#qm", P("què") - 0.05);
to("#qm", { opacity: 0, duration: 0.3 }, P("que") + 0.3);
// li fa mal la panxa
to("#belly", { scale: 1.4, duration: 0.8, ease: "back.out(1.6)" }, P("mal") - 0.3);
to("#armL", { rotation: 22, duration: 0.6, ease: "power2.inOut" }, P("mal") - 0.3);
to("#foreL", { rotation: 52, duration: 0.6, ease: "power2.inOut" }, P("mal") - 0.3);
mouth(P("mal"), "#mPain");
to("#browsN", { opacity: 0, duration: 0.15 }, P("mal"));
to("#browsP", { opacity: 1, duration: 0.15 }, P("mal"));
[0, 1, 2].forEach((i) => { pop(`#bolt${i}`, P("panxa") + i * 0.12); to(`#bolt${i}`, { opacity: 0, duration: 0.3 }, FX.etio - 0.4); });

// ═════ 5–9 s · etiologia ═════
slam("#tEtio", FX.etio, P("patogènia") - 0.4);
punch(FX.etio);
pop("#rew", FX.etio + 0.2);
fromTo("#rew", { x: 0 }, { x: -20, duration: 0.15, repeat: 5, yoyo: true }, FX.etio + 0.6);
// rebobinat: la pizza torna, sencera i enorme
fromTo("#pizzaWrap", { opacity: 0, x: 0, y: -40, scale: 1.4 }, { opacity: 1, x: 0, y: -40, scale: 1.6, duration: 0.5, ease: "back.out(1.6)", immediateRender: false }, P("massa", 1) - 0.1);
pop("#timer", P("ràpid") - 0.05);
fromTo("#timer", { rotation: 0 }, { rotation: 360, duration: 0.6, repeat: 1, ease: "none" }, P("ràpid"));
cam(P("massa", 1) - 0.2, 60, -40, 0.9, 1.6, "sine.inOut");

// ═════ 9–13 s · patogènia: l'estómac s'omple i es dilata ═════
["#rew", "#timer", "#pizzaWrap"].forEach((x) => to(x, { opacity: 0, duration: 0.3 }, P("patogènia") - 0.3));
cam(P("patogènia") - 0.5, S.stom.x, S.stom.y - 40, 0.92, 1.0, "power3.inOut", true);
slam("#tPato", FX.pato, P("l'anatomia") - 0.4);
fadeInPour();
function fadeInPour() {
  const t0 = P("omplert") - 0.6;
  fromTo("#pour", { opacity: 0 }, { opacity: 1, duration: 0.2 }, t0);
  fromTo("#pour", { y: -200 }, { y: 520, duration: 1.4, ease: "power1.in" }, t0);
  to("#pour", { opacity: 0, duration: 0.2 }, t0 + 1.3);
  to("#stAFood", { y: -40, duration: 1.4, ease: "power2.out" }, t0 + 0.3);
}
to("#stomWrap", { scale: 1.22, duration: 0.8, ease: "back.out(1.4)" }, P("dilatat") - 0.1);
[0, 1, 2, 3].forEach((i) => { pop(`#arr${i}`, P("dilatat") + i * 0.08); fromTo(`#arr${i}`, { x: 0 }, { x: 18, duration: 0.25, repeat: 3, yoyo: true }, P("dilatat") + 0.5); });
punch(P("dilatat"), 1.04);

// ═════ 14–18 s · anatomia patològica: la paret s'estira ═════
cam(P("l'anatomia") - 0.2, S.wall.x, S.wall.y - 60, 0.95, 1.0, "power3.inOut", true);
slam("#tAnat", FX.anat, P("fisiopatologia") - 0.4);
[0, 1, 2, 3].forEach((i) => pop(`#press${i}`, P("estómac", 2) + i * 0.1));
to("#wFold", { opacity: 0, duration: 0.9 }, P("inflat") - 0.1);
to("#wFlatWrap", { opacity: 1, duration: 0.9 }, P("inflat") - 0.1);
pop("#stretch", P("inflat"));
fromTo("#stretch", { scaleX: 0.9 }, { scaleX: 1.08, duration: 0.4, repeat: 3, yoyo: true, svgOrigin: "0 0" }, P("inflat") + 0.4);
pop("#clockW", P("temporalment") - 0.05);
fromTo("#clockW", { rotation: -10 }, { rotation: 10, duration: 0.2, repeat: 5, yoyo: true }, P("temporalment") + 0.4);
[0, 1, 2, 3].forEach((i) => fromTo(`#press${i}`, { y: 0 }, { y: 24, duration: 0.25, repeat: 3, yoyo: true }, P("excés") + i * 0.05));

// ═════ 18–22 s · fisiopatologia: l'estómac treballa més ═════
cam(P("fisiopatologia") - 0.4, S.func.x + 120, S.func.y - 40, 0.95, 1.0, "power3.inOut", true);
slam("#tFisio", FX.fisio, P("semiologia") - 0.4);
const tW = P("feina") - 0.3;
fromTo("#g1", { rotation: 0 }, { rotation: 90, duration: 2, ease: "none" }, P("fisiopatologia"));
fromTo("#g1", { rotation: 90 }, { rotation: 900, duration: 2.6, ease: "power1.in" }, tW);
fromTo("#g2", { rotation: 0 }, { rotation: -1400, duration: 4.6, ease: "power1.in" }, P("fisiopatologia"));
[0, 1, 2].forEach((i) => {
  fromTo(`#wave${i}`, { opacity: 0, x: -180, y: -60 }, { opacity: 0.6, x: 200, y: 80, duration: 1.0, repeat: 2, ease: "sine.inOut" }, P("estómac", 3) + i * 0.33);
});
fromTo("#stB", { scale: 1 }, { scale: 1.05, duration: 0.18, repeat: 9, yoyo: true }, tW);
fromTo("#stBFood", { x: -10 }, { x: 10, duration: 0.15, repeat: 11, yoyo: true }, tW);
[0, 1, 2].forEach((i) => { fromTo(`#drop${i}`, { opacity: 0, y: -40 }, { opacity: 1, y: 40, duration: 0.6, ease: "power2.in" }, P("digerir") - 0.2 + i * 0.2); });

// ═════ 22–27 s · semiologia: com sabem què li passa ═════
cam(P("semiologia") - 0.5, 60, -20, 0.85, 1.0, "power3.inOut", true);
slam("#tSemio", FX.semio, DUR + 0.5);
pop("#lensK", P("panxa", 2) - 0.1);
fromTo("#belly", { scale: 1.4 }, { scale: 1.48, duration: 0.3, repeat: 3, yoyo: true }, P("panxa", 2));
to("#lensK", { x: -30, y: -470, duration: 0.6, ease: "power2.inOut" }, P("veu") - 0.2);
to("#sweat", { opacity: 1, duration: 0.2 }, P("veu"));
fromTo("#sweat", { y: 0 }, { y: 40, duration: 0.8, repeat: 1 }, P("veu"));
[0, 1, 2].forEach((i) => pop(`#bolt${i}`, P("dolor") - 0.05 + i * 0.1));
fromTo("#head", { rotation: -3 }, { rotation: 3, duration: 0.16, repeat: 5, yoyo: true }, P("dolor"));
cam(P("panxa", 2), 60, -60, 0.95, 3.0, "sine.inOut");

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
const bgDots = `<svg class="layer" style="left:-3000px;top:-2000px" width="15000" height="4000" viewBox="-3000 -2000 15000 4000">
  <defs><pattern id="gDots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="2.6" fill="#DCE3EC"/></pattern></defs>
  <rect x="-3000" y="-2000" width="15000" height="4000" fill="url(#gDots)"/></svg>`;
fs.writeFileSync(path.join(ROOT, "compositions/world.html"), `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="world" data-width="${W_}" data-height="${H_}">
    <div id="bgSoft"></div>
    <div id="punchz"><div id="cam"><div id="zoom">
      <div id="bgpan">${bgDots}</div>
      <div id="pan">${world()}</div>
    </div></div></div>
    <div id="ui">${titleHTML}</div>
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
console.log(`OK · ${DUR}s · ${T.length} instruccions`);
