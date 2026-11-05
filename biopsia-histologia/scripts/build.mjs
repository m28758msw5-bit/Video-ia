// Generador del vídeo «Biòpsia i estudi histològic» (v2: realista, dinàmic, paraules clau).
// 1920×1080, fons clar, il·lustració mèdica amb volum i fotografies histològiques reals
// (assets/micro, vegeu CREDITS.md). Sense veu, sense música, sense subtítols.
//
//   node scripts/build.mjs             vídeo sencer
//   node scripts/build.mjs --until 20  només fins al segon 20
//
// Els moments són a la taula B (segons). Les paraules clau, a la llista KW.
// (La versió anterior, fosca i de línies, és a scripts/build-v1-neo.mjs.)

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const UNTIL = args.includes("--until") ? parseFloat(args[args.indexOf("--until") + 1]) : null;
const W = 1920, H = 1080;
const r2 = (v) => Math.round(v * 100) / 100;
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const C = {
  bg: "#F3F6FA", ink: "#0F172A", ink2: "#475569", blue: "#2563EB", teal: "#0D9488",
  green: "#16A34A", amber: "#F59E0B", red: "#E11D48",
};

// ───────────────────────── calendari ─────────────────────────
const B = {
  s1: 0,      // exploració
  s2: 3.8,    // però…
  s3: 7.6,    // causa eliminada → no es cura
  s4: 14.2,   // biòpsia
  s5: 20.2,   // mostra al flascó
  s6: 26.2,   // laboratori
  s7: 32.2,   // camp microscòpic
  s8: 38.2,   // normal vs alterades
  s9: 44.2,   // divisió controlada
  s10: 48.4,  // neoplàsia
  s11: 53.4,  // benigna / maligna
  s12: 58.6,  // descartar
  end: 63.5,
};
const DUR = +(UNTIL ?? B.end).toFixed(3);

// Paraules clau: t = entrada, d = durada, pos = on surten.
const KW = [
  { t: B.s1 + 0.4, d: 1.7, text: "EXPLORACIÓ", pos: "tl" },
  { t: B.s1 + 2.1, d: 1.6, text: "DIAGNÒSTIC", pos: "tl", tone: "green", check: true },
  { t: B.s2 + 0.4, d: 3.0, text: "PERÒ…", pos: "tl", tone: "amber", big: true },
  { t: B.s3 + 0.4, d: 2.9, text: "CAUSA ELIMINADA", pos: "tl" },
  { t: B.s3 + 3.6, d: 2.8, text: "NO ES CURA", pos: "tl", tone: "red" },
  { t: B.s4 + 0.5, d: 5.2, text: "BIÒPSIA", pos: "tl", big: true },
  { t: B.s5 + 0.6, d: 5.0, text: "MOSTRA DE TEIXIT", pos: "tl" },
  { t: B.s6 + 0.5, d: 5.2, text: "ESTUDI HISTOLÒGIC", pos: "tl" },
  { t: B.s7 + 0.9, d: 2.4, text: "CÈL·LULES", pos: "tl" },
  { t: B.s7 + 3.3, d: 2.4, text: "ORGANITZACIÓ", pos: "tl" },
  { t: B.s8 + 0.5, d: 5.2, text: "NORMAL", pos: "left", tone: "green" },
  { t: B.s8 + 1.6, d: 4.1, text: "ALTERADES", pos: "right", tone: "red" },
  { t: B.s9 + 0.4, d: 3.6, text: "DIVISIÓ CONTROLADA", pos: "tl", tone: "green" },
  { t: B.s10 + 0.5, d: 4.4, text: "NEOPLÀSIA", pos: "tl", tone: "red", big: true },
  { t: B.s11 + 0.4, d: 4.8, text: "BENIGNA", pos: "left", tone: "teal" },
  { t: B.s11 + 1.9, d: 3.3, text: "MALIGNA", pos: "right", tone: "red" },
  { t: B.s12 + 0.6, d: 4.3, text: "DESCARTAR", pos: "tl", big: true },
];

// ───────────────────────── posicions al món ─────────────────────────
const P = {
  mouth: { x: 0, y: 0 },
  punch: { x: 3000, y: 0 },
  lab: { x: 6000, y: 0 },
  micro: { x: 9000, y: 0 },
  cells: { x: 14600, y: 0 },
  types: { x: 17600, y: 0 },
  end: { x: 20600, y: 0 },
};

// ───────────────────────── art realista ─────────────────────────
const TONGUE = "M-235 40 C-245 -80 -120 -128 0 -128 C120 -128 245 -80 235 40 C225 165 120 255 0 255 C-120 255 -225 165 -235 40Z";
function papillae(seed, n, w = 200, h = 170, cy = 50, avoid = null) {
  const R = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, rr = Math.sqrt(R());
    const x = Math.cos(a) * rr * w, y = cy + Math.sin(a) * rr * h;
    if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < avoid.r) continue;
    out += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(2.5 + R() * 3.5)}" fill="#F9B4BE" opacity="${r2(0.4 + R() * 0.45)}"/>`;
  }
  return out;
}
const LES = { x: 190, y: 100 };
// Lesió nova (no és la imatge dels vídeos anteriors): placa irregular blanquinosa amb halo eritematós.
const lesion = (id) => `<g id="${id}" transform="translate(${LES.x},${LES.y}) rotate(-58)">
  <path d="M-46 -6 Q-40 -30 -8 -30 Q24 -36 44 -14 Q54 6 34 24 Q8 36 -22 28 Q-50 18 -46 -6Z" fill="#D9475A" opacity="0.55"/>
  <path d="M-30 -4 Q-24 -20 -2 -20 Q22 -22 30 -6 Q34 10 16 16 Q-6 22 -22 14 Q-34 8 -30 -4Z" fill="#F1E2C6"/>
  <path d="M-16 -4 Q-6 -12 10 -8 Q16 0 6 6 Q-8 10 -16 -4Z" fill="#FBF4E4"/>
</g>`;

function tongueReal(id) {
  return `<g id="${id}">
    <path d="${TONGUE}" fill="url(#gTongue)"/>
    <path d="${TONGUE}" fill="url(#gTongueShade)"/>
    <path d="M0 -100 Q8 60 0 190" stroke="#B94A5E" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.55"/>
    ${papillae(12, 220, 205, 175, 55, { x: LES.x, y: LES.y, r: 55 })}
    <ellipse cx="-80" cy="-40" rx="90" ry="40" fill="#fff" opacity="0.18" transform="rotate(-18 -80 -40)"/>
    ${lesion(id + "Les")}
  </g>`;
}

const toothPaths = {
  sharp: "M-44 60 L-44 -10 L-34 -40 L-22 -14 L-10 -46 L2 -18 L14 -48 L26 -16 L38 -42 L44 -10 L44 60 Q0 74 -44 60Z",
  smooth: "M-44 60 L-44 -12 Q-42 -46 0 -48 Q42 -46 44 -12 L44 60 Q0 74 -44 60Z",
};

function mirror() {
  return `<g id="mirror"><path d="M30 30 L420 420" stroke="url(#gSteel)" stroke-width="22" stroke-linecap="round"/>
    <path d="M300 300 L420 420" stroke="#64748B" stroke-width="26" stroke-linecap="round" opacity="0.6"/>
    <circle r="58" fill="url(#gMirror)" stroke="#94A3B8" stroke-width="8"/>
    <ellipse cx="-16" cy="-20" rx="22" ry="12" fill="#fff" opacity="0.85" transform="rotate(-35 -16 -20)"/></g>`;
}

function calendarCard(id, rollId) {
  return `<g id="${id}" opacity="0">
    <rect x="-120" y="-130" width="240" height="260" rx="26" fill="#fff" filter="url(#shadow)"/>
    <rect x="-120" y="-130" width="240" height="70" rx="26" fill="${C.red}"/><rect x="-120" y="-90" width="240" height="30" fill="${C.red}"/>
    <circle cx="-60" cy="-130" r="10" fill="#94A3B8"/><circle cx="60" cy="-130" r="10" fill="#94A3B8"/>
    <foreignObject x="-120" y="-56" width="240" height="180"><div xmlns="http://www.w3.org/1999/xhtml" class="calWin" data-layout-allow-overflow="true"><div id="${rollId}" class="calRoll">${Array.from({ length: 15 }, (_, i) => `<div>${i + 1}</div>`).join("")}</div></div></foreignObject>
  </g>`;
}

// Bloc de mucosa realista per a la biòpsia (tall en perspectiva).
function mucosaBlock() {
  const R = rng(5);
  let ves = "";
  for (let i = 0; i < 9; i++) {
    const x = -520 + i * 90 + R() * 40;
    ves += `<path d="M${r2(x)} 70 q${r2(20 + R() * 20)} 40 ${r2(-10 + R() * 20)} 90 q-20 40 10 80" stroke="#C2414F" stroke-width="${r2(4 + R() * 4)}" fill="none" opacity="0.55"/>`;
  }
  return `<g id="block">
    <path d="M-600 -60 L260 -60 L460 -220 L-400 -220Z" fill="url(#gSurface)"/>
    ${papillae(31, 160, 380, 60, -140, { x: -60, y: -140, r: 110 })}
    <g transform="translate(-60,-140) scale(1.55,0.55)">
      <path d="M-46 -6 Q-40 -30 -8 -30 Q24 -36 44 -14 Q54 6 34 24 Q8 36 -22 28 Q-50 18 -46 -6Z" fill="#D9475A" opacity="0.6"/>
      <path d="M-30 -4 Q-24 -20 -2 -20 Q22 -22 30 -6 Q34 10 16 16 Q-6 22 -22 14 Q-34 8 -30 -4Z" fill="#F1E2C6"/>
    </g>
    <ellipse id="hole" cx="-60" cy="-140" rx="34" ry="12" fill="#7F1D2D" opacity="0"/>
    <path d="M-600 -60 V260 H260 V-60Z" fill="url(#gSection)"/>
    <path d="M-600 -60 H260 V20 Q-170 34 -600 18Z" fill="url(#gEpi)"/>
    ${ves}
    <path d="M260 -60 L460 -220 V100 L260 260Z" fill="url(#gSide)"/>
    <path d="M-600 -60 H260 L460 -220" fill="none" stroke="#fff" stroke-width="3" opacity="0.7"/>
  </g>`;
}

function punchTool() {
  return `<g id="punch">
    <rect x="-34" y="-620" width="68" height="300" rx="18" fill="url(#gGrip)"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="-34" y="${-600 + i * 34}" width="68" height="8" fill="#1E3A8A" opacity="0.35"/>`).join("")}
    <rect x="-22" y="-330" width="44" height="190" rx="8" fill="url(#gSteel)"/>
    <rect id="punchShine" x="-12" y="-320" width="8" height="170" rx="4" fill="#fff" opacity="0.7"/>
    <path d="M-22 -140 L-22 -120 L22 -120 L22 -140Z" fill="#94A3B8"/>
  </g>`;
}

function vial(capId) {
  return `
    <path d="M-110 -160 V170 Q-110 220 -60 220 H60 Q110 220 110 170 V-160Z" fill="#EAF6FB" opacity="0.6"/>
    <path d="M-104 -30 V170 Q-104 214 -60 214 H60 Q104 214 104 170 V-30Z" fill="url(#gFormol)"/>
    <ellipse cx="0" cy="-30" rx="104" ry="12" fill="#D8F0F7" opacity="0.9"/>
    <path d="M-110 -160 V170 Q-110 220 -60 220 H60 Q110 220 110 170 V-160" fill="none" stroke="#B8C6D2" stroke-width="6"/>
    <rect x="-86" y="-140" width="18" height="320" rx="9" fill="#fff" opacity="0.55"/>
    <rect x="-90" y="20" width="180" height="110" rx="10" fill="#fff" opacity="0.92"/>
    <rect x="-70" y="40" width="120" height="12" rx="6" fill="#CBD5E1"/><rect x="-70" y="64" width="90" height="12" rx="6" fill="#CBD5E1"/><rect x="-70" y="88" width="105" height="12" rx="6" fill="#CBD5E1"/>
    <g id="${capId}"><rect x="-124" y="-226" width="248" height="76" rx="16" fill="url(#gCap)"/>
      ${Array.from({ length: 11 }, (_, i) => `<rect x="${-112 + i * 22}" y="-220" width="6" height="64" rx="3" fill="#94A3B8" opacity="0.5"/>`).join("")}</g>`;
}

function microscope() {
  return `<g id="scope">
    <ellipse cx="0" cy="320" rx="300" ry="34" fill="#0F172A" opacity="0.12"/>
    <path d="M-260 260 Q-260 230 -230 230 H230 Q260 230 260 260 V300 H-260Z" fill="url(#gBodyDark)"/>
    <path d="M120 240 Q190 120 170 -60 Q150 -230 40 -300 L0 -260 Q90 -200 100 -60 Q110 100 50 240Z" fill="url(#gBodyLight)"/>
    <rect x="-230" y="40" width="330" height="40" rx="10" fill="url(#gBodyDark)"/>
    <circle cx="140" cy="120" r="44" fill="url(#gKnob)"/><circle cx="140" cy="120" r="20" fill="#475569"/>
    <rect x="-112" y="-170" width="90" height="180" rx="18" fill="url(#gBodyLight)" transform="rotate(-6 -67 -80)"/>
    <rect x="-96" y="-10" width="30" height="56" rx="6" fill="url(#gSteel)"/><rect x="-60" y="-14" width="26" height="60" rx="6" fill="url(#gSteel)"/>
    <rect x="-150" y="-330" width="70" height="200" rx="16" fill="url(#gBodyDark)" transform="rotate(-28 -115 -230)"/>
    <rect x="-175" y="-390" width="74" height="64" rx="14" fill="#1E293B" transform="rotate(-28 -138 -358)"/>
    <ellipse cx="-110" cy="160" rx="60" ry="14" fill="#FDE68A" opacity="0.9"/>
    <path id="beam" d="M-140 160 L-80 160 L-70 60 L-150 60Z" fill="#FEF3C7" opacity="0"/>
  </g>`;
}

function slide(id) {
  return `<g id="${id}">
    <rect x="-200" y="-46" width="400" height="92" rx="6" fill="#E6F4FA" opacity="0.85" stroke="#B6CAD8" stroke-width="3"/>
    <rect x="-200" y="-46" width="110" height="92" rx="6" fill="#fff" opacity="0.9"/>
    <path d="M10 -24 Q70 -40 120 -16 Q150 6 110 24 Q50 40 0 22 Q-30 4 10 -24Z" fill="#D46AA6" opacity="0.8"/>
    <path d="M30 -10 Q70 -20 100 -6 Q110 6 86 12 Q50 20 30 10Z" fill="#8B5CF6" opacity="0.55"/>
    <rect x="-180" y="-40" width="370" height="10" rx="5" fill="#fff" opacity="0.55"/>
  </g>`;
}

// Camp de microscopi amb fotografia real retallada en cercle.
function photoField(id, cx, cy, r, href, { zoom = 1, ox = 0.5, oy = 0.5, iw = 1280, ih = 722 } = {}) {
  const sc = (2 * r * zoom) / Math.min(iw, ih);
  const w = iw * sc, h = ih * sc;
  return `<g transform="translate(${cx},${cy})"><g id="${id}">
    <clipPath id="${id}Clip"><circle r="${r}"/></clipPath>
    <circle r="${r + 16}" fill="#0F172A"/>
    <g clip-path="url(#${id}Clip)">
      <image id="${id}Img" href="${href}" x="${r2(-w * ox)}" y="${r2(-h * oy)}" width="${r2(w)}" height="${r2(h)}" preserveAspectRatio="none"/>
      <circle r="${r}" fill="url(#gVignette)"/>
    </g>
    <circle r="${r + 8}" fill="none" stroke="#1E293B" stroke-width="16"/>
  </g></g>`;
}

// Cèl·lula il·lustrada (paleta H&E, com les fotografies).
const cell = (x, y, r, id = "", extra = "", nuc = "url(#gNuc)") => `<g transform="translate(${r2(x)},${r2(y)})"><g ${id ? `id="${id}"` : ""} ${extra}>
  <circle r="${r2(r)}" fill="url(#gCyto)" stroke="#D07BAA" stroke-width="2"/>
  <circle r="${r2(r * 0.42)}" fill="${nuc}"/>
  <circle cx="${r2(-r * 0.12)}" cy="${r2(-r * 0.14)}" r="${r2(r * 0.1)}" fill="#fff" opacity="0.35"/></g></g>`;
const DARK = "url(#gNucDark)";

const DEFS = `<defs>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.18"/></filter>
  <radialGradient id="gTongue" cx="0.45" cy="0.35" r="0.75"><stop offset="0" stop-color="#F3A2AD"/><stop offset="0.6" stop-color="#E07888"/><stop offset="1" stop-color="#C45467"/></radialGradient>
  <linearGradient id="gTongueShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7F1D2D" stop-opacity="0.25"/><stop offset="0.3" stop-color="#7F1D2D" stop-opacity="0"/><stop offset="0.75" stop-color="#7F1D2D" stop-opacity="0"/><stop offset="1" stop-color="#7F1D2D" stop-opacity="0.3"/></linearGradient>
  <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#64748B"/><stop offset="0.35" stop-color="#E2E8F0"/><stop offset="0.55" stop-color="#F8FAFC"/><stop offset="1" stop-color="#475569"/></linearGradient>
  <radialGradient id="gMirror" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#CBD5E1"/><stop offset="1" stop-color="#64748B"/></radialGradient>
  <linearGradient id="gEnamel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#F3EEDF"/><stop offset="1" stop-color="#D8CFB8"/></linearGradient>
  <linearGradient id="gGum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1A0AC"/><stop offset="1" stop-color="#D86A7E"/></linearGradient>
  <linearGradient id="gSurface" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2A9B4"/><stop offset="1" stop-color="#E58494"/></linearGradient>
  <linearGradient id="gSection" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6C8D2"/><stop offset="1" stop-color="#E9A9B8"/></linearGradient>
  <linearGradient id="gEpi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7859A"/><stop offset="1" stop-color="#C95C78"/></linearGradient>
  <linearGradient id="gSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D98597"/><stop offset="1" stop-color="#B9667A"/></linearGradient>
  <linearGradient id="gGrip" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1D4ED8"/><stop offset="0.45" stop-color="#60A5FA"/><stop offset="1" stop-color="#1E3A8A"/></linearGradient>
  <linearGradient id="gFormol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDF3F7" stop-opacity="0.85"/><stop offset="1" stop-color="#B9E2EC" stop-opacity="0.9"/></linearGradient>
  <linearGradient id="gCap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E2E8F0"/><stop offset="0.5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CBD5E1"/></linearGradient>
  <linearGradient id="gBodyLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E2E8F0"/><stop offset="0.5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CBD5E1"/></linearGradient>
  <linearGradient id="gBodyDark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1E293B"/><stop offset="0.5" stop-color="#475569"/><stop offset="1" stop-color="#0F172A"/></linearGradient>
  <radialGradient id="gKnob" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#94A3B8"/><stop offset="1" stop-color="#1E293B"/></radialGradient>
  <radialGradient id="gVignette" cx="0.5" cy="0.5" r="0.5"><stop offset="0.75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>
  <radialGradient id="gCyto" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FAD3E4"/><stop offset="1" stop-color="#E39AC1"/></radialGradient>
  <radialGradient id="gNuc" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#8B6CC8"/><stop offset="1" stop-color="#3F2479"/></radialGradient>
  <radialGradient id="gNucDark" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#6D4BB0"/><stop offset="1" stop-color="#25124F"/></radialGradient>
  <linearGradient id="gStroma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE3EC"/><stop offset="1" stop-color="#F5CFDD"/></linearGradient>
  <linearGradient id="gVessel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7A1AE"/><stop offset="0.5" stop-color="#FCE1E5"/><stop offset="1" stop-color="#E9808F"/></linearGradient>
  <linearGradient id="gLymph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9F99D"/><stop offset="0.5" stop-color="#F7FEE7"/><stop offset="1" stop-color="#BEF264"/></linearGradient>
  <radialGradient id="gRBC" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#F87171"/><stop offset="0.55" stop-color="#DC2626"/><stop offset="1" stop-color="#B91C1C"/></radialGradient>
</defs>`;

// ───────────────────────── construcció del món ─────────────────────────
const ROW = Array.from({ length: 13 }, (_, i) => ({ x: -720 + i * 120, y: 130 }));
const R10 = rng(101);
const NEO = Array.from({ length: 80 }, (_, i) => {
  const a = R10() * Math.PI, d = Math.sqrt(i / 80) * 300;
  return { x: Math.cos(a) * d * 1.3, y: 90 - Math.sin(a) * d * 0.95, r: 26 + R10() * 18 };
}).sort((a, b) => Math.hypot(a.x, a.y - 90) - Math.hypot(b.x, b.y - 90));
const R11 = rng(111);
const BEN = Array.from({ length: 30 }, () => { const a = R11() * Math.PI * 2, d = Math.sqrt(R11()) * 150; return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8, r: 22 + R11() * 6 }; });
const MAL = Array.from({ length: 40 }, () => { const a = R11() * Math.PI * 2, d = Math.sqrt(R11()) * 170; return { x: Math.cos(a) * d * 1.1, y: Math.sin(a) * d * 0.85, r: 18 + R11() * 16 }; });
const INV = [[190, -60], [230, 30], [150, 140], [-40, 190], [-190, 80], [40, -180]].map(([x, y], i) => ({ x, y, r: 20 + (i % 3) * 4 }));
// Cèl·lules alterades ressaltades a la fotografia (fraccions de la imatge).
const HL = [[0.745, 0.643], [0.448, 0.415], [0.823, 0.346]];

function world() {
  const m = P.mouth, pu = P.punch, la = P.lab, mi = P.micro, ce = P.cells, ty = P.types, en = P.end;
  const cmp = { x: mi.x + 2600, y: 40 };
  const altR = 310, altCx = cmp.x + 430, altCy = cmp.y, nrmCx = cmp.x - 430;
  const sc = (2 * altR) / 964, iw = 1280 * sc, ih = 964 * sc;
  const hl = HL.map(([fx, fy]) => ({ x: altCx - iw / 2 + fx * iw, y: altCy - ih / 2 + fy * ih })).filter((p) => Math.hypot(p.x - altCx, p.y - altCy) < altR - 30);
  return {
    hl, cmp, altCx, altCy,
    svg: `
<svg class="layer" style="left:-2000px;top:-1600px" width="26000" height="3200" viewBox="-2000 -1600 26000 3200">
  ${DEFS}

  <!-- 1–3 · llengua, dent i calendari -->
  <g transform="translate(${m.x + 120},${m.y - 10}) scale(1.35)" filter="url(#shadow)">${tongueReal("tg")}</g>
  <g transform="translate(${r2(m.x + 120 + LES.x * 1.35)},${r2(m.y - 10 + LES.y * 1.35)})">
    <circle id="okRing" r="100" fill="none" stroke="${C.green}" stroke-width="8" opacity="0"/>
    <circle id="alertRing" r="110" fill="none" stroke="${C.red}" stroke-width="8" stroke-dasharray="20 12" opacity="0"/>
  </g>
  <g transform="translate(${r2(m.x + 120 + 330 * 1.35)},${r2(m.y - 10 + 250 * 1.35)}) rotate(-38) scale(1.3)">
    <g id="toothG" opacity="0">
      <path d="M-60 40 Q0 90 60 40 L60 110 H-60Z" fill="url(#gGum)"/>
      <path id="toothSharp" d="${toothPaths.sharp}" fill="url(#gEnamel)" stroke="#CBBF9F" stroke-width="3"/>
      <path id="toothSmooth" d="${toothPaths.smooth}" fill="url(#gEnamel)" stroke="#CBBF9F" stroke-width="3" opacity="0"/>
      <g id="bur" opacity="0"><rect x="-10" y="-170" width="20" height="110" rx="6" fill="url(#gSteel)"/><rect x="-18" y="-300" width="36" height="140" rx="12" fill="#CBD5E1"/>
        <circle cy="-56" r="13" fill="#A8A29E"/></g>
      <g id="sparks" opacity="0"><path d="M-30 -60 l-20 -14 M0 -66 v-24 M30 -60 l20 -14" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/></g>
    </g>
  </g>
  <g transform="translate(${m.x - 560},${m.y + 40})">${calendarCard("calCard", "calRoll")}</g>
  <g transform="translate(${m.x + 120},${m.y - 10})"><g id="mirrorWrap" opacity="0">${mirror()}</g></g>

  <!-- 4–5 · biòpsia -->
  <g transform="translate(${pu.x - 120},${pu.y + 80})" filter="url(#shadow)">${mucosaBlock()}</g>
  <g transform="translate(${pu.x - 180},${pu.y - 60})"><g id="punchWrap" opacity="0">${punchTool()}</g></g>
  <g transform="translate(${pu.x - 180},${pu.y - 60})"><g id="sample" opacity="0">
    <rect x="-20" y="-60" width="40" height="78" rx="12" fill="#E58494"/><rect x="-20" y="-60" width="40" height="22" rx="10" fill="#C95C78"/>
    <ellipse cx="0" cy="-60" rx="20" ry="7" fill="#F2A9B4"/><rect x="-14" y="-50" width="6" height="60" rx="3" fill="#fff" opacity="0.4"/></g></g>
  <g transform="translate(${pu.x + 640},${pu.y + 60})"><g id="vialWrap" opacity="0"><g filter="url(#shadow)">${vial("cap")}</g></g></g>

  <!-- 6 · laboratori -->
  <rect x="${la.x - 1200}" y="${la.y + 330}" width="2400" height="500" fill="#E4EAF1"/>
  <rect x="${la.x - 1200}" y="${la.y + 320}" width="2400" height="16" fill="#CBD5E1"/>
  <g transform="translate(${la.x + 260},${la.y + 30})" filter="url(#shadow)">${microscope()}</g>
  <g transform="translate(${la.x - 600},${la.y + 200}) scale(0.55)"><g id="vial2" opacity="0"><g filter="url(#shadow)">${vial("cap2")}</g></g></g>
  <g transform="translate(${la.x - 260},${la.y + 290})"><g id="slideWrap" opacity="0"><g filter="url(#shadow)">${slide("slideA")}</g></g></g>

  <!-- 7 · camp microscòpic (fotografies reals) -->
  ${photoField("fLow", mi.x, mi.y + 30, 370, "assets/micro/normal-baix.jpg")}
  ${photoField("fHigh", mi.x, mi.y + 30, 370, "assets/micro/normal-alt.jpg")}

  <!-- 8 · normal vs alterades -->
  ${photoField("fN", nrmCx, altCy, altR, "assets/micro/normal-alt.jpg")}
  ${photoField("fX", altCx, altCy, altR, "assets/micro/alterat.jpg", { iw: 1280, ih: 964 })}
  ${hl.map((p, i) => `<circle id="hl${i}" cx="${r2(p.x)}" cy="${r2(p.y)}" r="34" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="7 6" opacity="0"/>`).join("")}

  <!-- 9–10 · divisió controlada i neoplàsia (il·lustració H&E) -->
  <g transform="translate(${ce.x},${ce.y})">
    <rect x="-1100" y="170" width="2200" height="500" fill="url(#gStroma)"/>
    <path d="M-1100 172 Q-550 158 0 172 T1100 172" stroke="#C26A97" stroke-width="6" fill="none"/>
    ${ROW.map((c, i) => cell(c.x, c.y, 50, `row${i}`)).join("")}
    <g id="divA" opacity="0">${cell(0, 0, 50)}</g>
    <g id="divB" opacity="0">${cell(0, 0, 50)}</g>
    ${NEO.map((c, i) => cell(c.x, c.y - 20, c.r, `neo${i}`, 'opacity="0"')).join("")}
  </g>

  <!-- 11 · benigna i maligna -->
  <g transform="translate(${ty.x},${ty.y})">
    <rect x="-1100" y="-600" width="2200" height="1200" fill="url(#gStroma)" opacity="0.7"/>
    <path d="M0 -600 V600" stroke="#fff" stroke-width="10"/>
    <g transform="translate(-470,-30)"><g id="ben">
      <ellipse id="capsule" rx="200" ry="170" fill="#F9D7E6" stroke="#B85C8E" stroke-width="10" opacity="0"/>
      ${BEN.map((c) => cell(c.x, c.y, c.r)).join("")}
    </g></g>
    <g transform="translate(470,-30)">
      <path d="M-420 260 C-200 230, 200 290, 440 250" stroke="url(#gVessel)" stroke-width="70" fill="none" stroke-linecap="round"/>
      ${Array.from({ length: 7 }, (_, i) => `<ellipse id="rbc${i}" cx="${-380 + i * 120}" cy="${r2(258 + Math.sin(i) * 10)}" rx="16" ry="11" fill="url(#gRBC)"/>`).join("")}
      <path d="M-420 -300 C-160 -270, 220 -330, 440 -290" stroke="url(#gLymph)" stroke-width="60" fill="none" stroke-linecap="round"/>
      <g id="mal" opacity="0">
        ${MAL.map((c) => cell(c.x, c.y, c.r, "", "", DARK)).join("")}
        ${INV.map((c, i) => `<g id="inv${i}" opacity="0">${cell(c.x, c.y, c.r, "", "", DARK)}</g>`).join("")}
      </g>
      <g id="metB" opacity="0">${cell(0, 0, 16, "", "", DARK)}</g>
      <g id="metL" opacity="0">${cell(0, 0, 16, "", "", DARK)}</g>
    </g>
  </g>

  <!-- 12 · descartar -->
  <g transform="translate(${en.x - 560},${en.y - 20}) scale(0.62)"><g id="e1" opacity="0"><g filter="url(#shadow)">${tongueReal("tgE")}</g></g></g>
  <g transform="translate(${en.x},${en.y - 20})">${calendarCard("e2", "calRoll2")}</g>
  ${photoField("fE", en.x + 560, en.y - 20, 240, "assets/micro/alterat.jpg", { iw: 1280, ih: 964 })}
  <g transform="translate(${en.x + 560},${en.y - 20})"><g id="ret" opacity="0">
    <circle r="70" fill="none" stroke="#fff" stroke-width="5"/>
    <path d="M-100 0 H-50 M50 0 H100 M0 -100 V-50 M0 50 V100" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g></g>
  <path id="ea1" d="M${en.x - 360} -20 H${en.x - 170} M${en.x - 200} -48 L${en.x - 170} -20 L${en.x - 200} 8" stroke="${C.blue}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0"/>
  <path id="ea2" d="M${en.x + 160} -20 H${en.x + 290} M${en.x + 260} -48 L${en.x + 290} -20 L${en.x + 260} 8" stroke="${C.blue}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0"/>
</svg>`,
  };
}

const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif;color:${C.ink}}
#bgSoft{position:absolute;inset:0;background:radial-gradient(70% 60% at 60% 45%, #FFFFFF, ${C.bg} 70%)}
#cam{position:absolute;left:${W / 2}px;top:${H / 2}px;width:0;height:0}
#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
.calWin{width:240px;height:180px;overflow:hidden}
.calRoll div{height:180px;line-height:180px;text-align:center;font:900 120px Inter,sans-serif;color:${C.ink}}
.kw{position:absolute;font-weight:900;font-size:96px;letter-spacing:-0.02em;line-height:1;white-space:nowrap;opacity:0;display:flex;align-items:center;gap:22px;text-shadow:0 2px 24px rgba(255,255,255,.9)}
.kw.big{font-size:150px}
.kw .bar{display:block;width:16px;height:1em;border-radius:8px;background:${C.blue}}
.kw.tl,.kw.left{left:110px;top:90px}
.kw.right{right:110px;top:90px;flex-direction:row-reverse}
.kw.green{color:${C.green}}.kw.green .bar{background:${C.green}}
.kw.red{color:${C.red}}.kw.red .bar{background:${C.red}}
.kw.amber{color:#D97706}.kw.amber .bar{background:${C.amber}}
.kw.teal{color:${C.teal}}.kw.teal .bar{background:${C.teal}}
.kw .chk{display:grid;place-items:center;width:96px;height:96px;border-radius:50%;background:${C.green};color:#fff;font-size:60px}
#flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
`;

// ───────────────────────── línia de temps ─────────────────────────
const T = [];
const SFX = [];
const sfx = (file, t, vol = 0.4) => SFX.push({ file, t: +Math.max(0, t).toFixed(3), vol });
const tw = (sel, from, vars, t) => { const o = { sel, from, vars, t }; T.push(o); return o; };
const to = (sel, vars, t) => tw(sel, null, vars, t);
const fromTo = (sel, a, b, t) => tw(sel, a, b, t);
const set = (sel, vars, t) => T.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r2(t)});`);
const raw = (s) => T.push(s);
let wk = 0;
const whoosh = () => ["whoosh1", "whoosh2", "whoosh3"][wk++ % 3];
let camState = { x: 0, y: 0, s: 1 };
let lastCam = null;
function cam(t, x, y, s, dur = 0.9, ease = "power3.inOut", opts = {}) {
  if (lastCam && t < lastCam.t + lastCam.dur) lastCam.tw.forEach((o) => (o.vars.duration = r2(Math.max(0.15, t - lastCam.t))));
  const tws = [
    to("#zoom", { scale: s, duration: dur, ease }, t),
    to("#pan", { x: -x, y: -y, duration: dur, ease }, t),
    to("#bgpan", { x: -x * 0.5, y: -y * 0.5, duration: dur, ease }, t),
  ];
  lastCam = { t, dur, tw: tws };
  if (opts.blur || Math.hypot(x - camState.x, y - camState.y) > 1500) {
    to("#zoom", { filter: "blur(10px)", duration: dur * 0.45, ease: "power2.in" }, t);
    to("#zoom", { filter: "blur(0px)", duration: dur * 0.5, ease: "power2.out" }, t + dur * 0.45);
    sfx(whoosh(), t + dur * 0.5, 0.35);
  }
  camState = { x, y, s };
}
// Cop de zoom curt (punch-in) sobre la càmera; es fa en un embolcall propi per no barallar-se amb cam().
const punch = (t, s = 1.06) => {
  to("#punchz", { scale: s, duration: 0.16, ease: "power3.out" }, t);
  to("#punchz", { scale: 1, duration: 0.5, ease: "power2.inOut" }, t + 0.18);
};
const fadeIn = (sel, t, d = 0.5, extra = {}) => fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d, ease: "power2.out", ...extra }, t);
const pop = (sel, t, extra = {}) => fromTo(sel, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)", ...extra }, t);

const { svg: WSVG, hl, cmp, altCx, altCy } = world();

raw(`gsap.set(["#mirror","#punch","#cap","#cap2","#divA","#divB","#ben","#mal","#okRing","#alertRing","#ret","#e1","#e2","#calCard","#toothG"], {svgOrigin:"0 0"});`);
raw(`gsap.set(["#fE"], {svgOrigin:"0 0"});`);

// Paraules clau: entren amb un cop (de gran a mida, amb desenfocament) i surten cap amunt.
let kwHTML = "";
KW.forEach((k, i) => {
  const cls = `kw ${k.pos}${k.big ? " big" : ""}${k.tone ? " " + k.tone : ""}`;
  kwHTML += `<div class="${cls}" id="kw${i}"><span class="bar"></span><span>${k.text}</span>${k.check ? `<span class="chk">✓</span>` : ""}</div>`;
  fromTo(`#kw${i}`, { opacity: 0, scale: 1.25, y: 30, filter: "blur(12px)" }, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.38, ease: "power4.out", transformOrigin: k.pos === "right" ? "100% 50%" : "0% 50%" }, k.t);
  to(`#kw${i}`, { opacity: 0, y: -26, filter: "blur(6px)", duration: 0.26, ease: "power2.in" }, k.t + k.d - 0.26);
  sfx(i % 2 ? "pop2" : "pop1", k.t + 0.05, 0.3);
});

// ═════ 1 · EXPLORACIÓ → DIAGNÒSTIC ═════
set("#zoom", { scale: 1.35 }, 0);
set("#pan", { x: -260, y: 60 }, 0);
set("#bgpan", { x: -130, y: 30 }, 0);
camState = { x: 260, y: -60, s: 1.35 };
cam(0, 120, 30, 1.0, 1.6, "power3.out");
fromTo("#mirrorWrap", { opacity: 0, x: 520, y: 360 }, { opacity: 1, x: 120, y: 60, duration: 0.8, ease: "power3.out" }, B.s1 + 0.5);
to("#mirrorWrap", { x: -60, y: -40, duration: 0.7, ease: "sine.inOut" }, B.s1 + 1.3);
to("#mirrorWrap", { x: r2(LES.x * 1.35 + 30), y: r2(LES.y * 1.35 - 20), duration: 0.6, ease: "sine.inOut" }, B.s1 + 2.0);
fromTo("#okRing", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: "expo.out" }, B.s1 + 2.15);
punch(B.s1 + 2.15);

// ═════ 2 · PERÒ… ═════
to("#mirrorWrap", { opacity: 0, x: 520, y: 360, duration: 0.5, ease: "power2.in" }, B.s2);
fromTo("#okRing", { x: 0 }, { x: 8, duration: 0.06, repeat: 7, yoyo: true }, B.s2 + 0.4);
to("#okRing", { stroke: C.amber, duration: 0.3 }, B.s2 + 0.5);
cam(B.s2 + 0.3, r2(120 + LES.x * 1.35 - 200), r2(-10 + LES.y * 1.35 - 90), 1.35, 1.4, "power2.inOut");

// ═════ 3 · CAUSA ELIMINADA → NO ES CURA ═════
cam(B.s3, 40, 60, 0.92, 0.8, "power3.inOut");
to("#okRing", { opacity: 0, duration: 0.3 }, B.s3);
pop("#toothG", B.s3 + 0.2);
fromTo("#bur", { opacity: 0, y: -120 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, B.s3 + 0.7);
fromTo("#bur", { x: -4 }, { x: 4, duration: 0.05, repeat: 19, yoyo: true }, B.s3 + 1.1);
fromTo("#sparks", { opacity: 0 }, { opacity: 1, duration: 0.08, repeat: 9, yoyo: true }, B.s3 + 1.1);
to("#toothSharp", { opacity: 0, duration: 0.6 }, B.s3 + 1.5);
fromTo("#toothSmooth", { opacity: 0 }, { opacity: 1, duration: 0.6 }, B.s3 + 1.5);
to("#bur", { opacity: 0, y: -140, duration: 0.35, ease: "power2.in" }, B.s3 + 2.2);
sfx("rub", B.s3 + 1.1, 0.25);
pop("#calCard", B.s3 + 2.7);
fromTo("#calRoll", { y: 0 }, { y: -180 * 14, duration: 2.2, ease: "steps(14)" }, B.s3 + 2.9);
fromTo("#tgLes", { scale: 1 }, { scale: 1.12, duration: 0.3, yoyo: true, repeat: 5, svgOrigin: "0 0" }, B.s3 + 3.6);
fromTo("#alertRing", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: "expo.out" }, B.s3 + 3.6);
fromTo("#alertRing", { rotation: 0 }, { rotation: 120, duration: 2.6, ease: "none" }, B.s3 + 4.1);
punch(B.s3 + 3.6, 1.08);

// ═════ 4 · BIÒPSIA ═════
cam(B.s4 - 0.3, P.punch.x - 60, P.punch.y - 60, 1.0, 1.0, "power3.inOut", { blur: true });
fromTo("#punchWrap", { opacity: 0, y: -300 }, { opacity: 1, y: -60, duration: 0.8, ease: "power3.out" }, B.s4 + 1.0);
to("#punchWrap", { y: 40, duration: 0.6, ease: "power2.inOut" }, B.s4 + 2.0);
fromTo("#punchShine", { x: -8 }, { x: 22, duration: 0.25, repeat: 7, yoyo: true, ease: "sine.inOut" }, B.s4 + 2.6);
sfx("rub", B.s4 + 2.6, 0.25);
cam(B.s4 + 2.4, P.punch.x - 160, P.punch.y - 160, 1.45, 2.4, "sine.inOut");

// ═════ 5 · MOSTRA DE TEIXIT → flascó ═════
to("#punchWrap", { y: -380, duration: 0.8, ease: "power2.inOut" }, B.s5);
fadeIn("#hole", B.s5 + 0.15, 0.3);
fromTo("#sample", { opacity: 0, y: 0 }, { opacity: 1, y: -300, duration: 0.8, ease: "power2.inOut" }, B.s5 + 0.15);
sfx("click1", B.s5 + 0.2, 0.3);
to("#punchWrap", { opacity: 0, duration: 0.4 }, B.s5 + 0.9);
cam(B.s5 + 0.8, P.punch.x + 240, P.punch.y - 40, 0.95, 1.0, "power3.inOut");
fadeIn("#vialWrap", B.s5 + 0.9, 0.5);
set("#cap", { y: -170 }, 0);
to("#sample", { x: 820, y: -440, duration: 1.0, ease: "power2.inOut" }, B.s5 + 1.3);
to("#sample", { x: 820, y: 230, duration: 0.7, ease: "power2.in" }, B.s5 + 2.3);
sfx("pop1", B.s5 + 3.0, 0.3);
to("#cap", { y: 0, duration: 0.5, ease: "power3.out" }, B.s5 + 3.4);
sfx("click1", B.s5 + 3.9, 0.35);
punch(B.s5 + 3.9);

// ═════ 6 · LABORATORI ═════
cam(B.s6 - 0.4, P.lab.x, P.lab.y + 40, 0.95, 1.0, "power3.inOut", { blur: true });
fromTo("#vial2", { opacity: 0, x: -200 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, B.s6 + 0.2);
fromTo("#slideWrap", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, B.s6 + 1.2);
to("#slideWrap", { x: 410, y: -205, duration: 1.2, ease: "power2.inOut" }, B.s6 + 2.0);
fromTo("#beam", { opacity: 0 }, { opacity: 0.9, duration: 0.4 }, B.s6 + 3.3);
sfx("click1", B.s6 + 3.3, 0.3);
cam(B.s6 + 3.4, P.lab.x + 120, P.lab.y - 20, 1.2, 2.0, "sine.inOut");

// ═════ 7 · ZOOM AL CAMP MICROSCÒPIC ═════
cam(B.s7 - 0.6, P.lab.x + 150, P.lab.y + 85, 6, 0.7, "power3.in");
fromTo("#flash", { opacity: 0 }, { opacity: 0.9, duration: 0.16 }, B.s7 - 0.05);
to("#flash", { opacity: 0, duration: 0.45 }, B.s7 + 0.15);
set("#zoom", { scale: 0.75 }, B.s7 + 0.12);
set("#pan", { x: -P.micro.x, y: -(P.micro.y + 30) }, B.s7 + 0.12);
set("#bgpan", { x: -P.micro.x * 0.5, y: -(P.micro.y + 30) * 0.5 }, B.s7 + 0.12);
camState = { x: P.micro.x, y: P.micro.y + 30, s: 0.75 };
lastCam = null;
cam(B.s7 + 0.12, P.micro.x, P.micro.y - 20, 1.0, 1.6, "power3.out");
set("#fHigh", { opacity: 0 }, 0);
fromTo("#fLowImg", { scale: 1, svgOrigin: "0 0" }, { scale: 2.4, duration: 3.0, ease: "power1.in", svgOrigin: "0 0" }, B.s7 + 0.8);
fromTo("#fHigh", { opacity: 0 }, { opacity: 1, duration: 0.9 }, B.s7 + 3.2);
fromTo("#fHighImg", { scale: 1.3, svgOrigin: "0 0" }, { scale: 1.0, duration: 2.6, ease: "power2.out", svgOrigin: "0 0" }, B.s7 + 3.2);

// ═════ 8 · NORMAL vs ALTERADES ═════
cam(B.s8 - 0.3, cmp.x, cmp.y, 1.0, 0.9, "power3.inOut", { blur: true });
fromTo("#fN", { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, B.s8 + 0.3);
fromTo("#fX", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, B.s8 + 1.4);
hl.forEach((_, i) => {
  fromTo(`#hl${i}`, { opacity: 0, scale: 1.8, transformOrigin: "50% 50%" }, { opacity: 0.95, scale: 1, duration: 0.45, ease: "power3.out" }, B.s8 + 2.6 + i * 0.6);
  sfx("pop2", B.s8 + 2.65 + i * 0.6, 0.18);
});
cam(B.s8 + 2.4, altCx - 60, altCy - 60, 1.25, 2.6, "sine.inOut");

// ═════ 9 · DIVISIÓ CONTROLADA ═════
cam(B.s9 - 0.3, P.cells.x, P.cells.y + 40, 1.15, 0.9, "power3.inOut", { blur: true });
set("#row6", { opacity: 0 }, B.s9 + 0.8);
set(["#divA", "#divB"], { opacity: 1, x: ROW[6].x, y: ROW[6].y }, B.s9 + 0.8);
to("#divA", { x: ROW[6].x - 32, scaleX: 0.72, duration: 1.2, ease: "power2.inOut" }, B.s9 + 1.0);
to("#divB", { x: ROW[6].x + 32, scaleX: 0.72, duration: 1.2, ease: "power2.inOut" }, B.s9 + 1.0);
ROW.forEach((c, i) => { if (i !== 6) to(`#row${i}`, { x: (i < 6 ? -1 : 1) * 30, duration: 1.2, ease: "power2.inOut" }, B.s9 + 1.0); });
sfx("pop1", B.s9 + 2.2, 0.2);

// ═════ 10 · NEOPLÀSIA ═════
NEO.forEach((c, i) => {
  const t = B.s10 + 0.4 + Math.sqrt(i / NEO.length) * 3.6;
  fromTo(`#neo${i}`, { opacity: 0, scale: 0.15, svgOrigin: "0 0" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, t);
});
[0, 1, 1.8, 2.5, 3.0, 3.4].forEach((d) => sfx("pop2", B.s10 + 0.4 + d, 0.14));
cam(B.s10 + 0.3, P.cells.x, P.cells.y - 60, 1.0, 4.2, "sine.inOut");
punch(B.s10 + 4.0, 1.07);

// ═════ 11 · BENIGNA / MALIGNA ═════
cam(B.s11 - 0.3, P.types.x, P.types.y, 0.92, 0.9, "power3.inOut", { blur: true });
fromTo("#ben", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 0.85, duration: 0.7, ease: "power3.out" }, B.s11 + 0.3);
to("#ben", { scale: 1, duration: 1.6, ease: "power2.out" }, B.s11 + 1.0);
fromTo("#capsule", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power3.out" }, B.s11 + 1.2);
fromTo("#mal", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }, B.s11 + 1.8);
INV.forEach((c, i) => fromTo(`#inv${i}`, { opacity: 0, x: r2(-c.x * 0.6), y: r2(-c.y * 0.6) }, { opacity: 1, x: r2(c.x * 0.5), y: r2(c.y * 0.5), duration: 1.4, ease: "power2.out" }, B.s11 + 2.4 + i * 0.12));
for (let i = 0; i < 7; i++) fromTo(`#rbc${i}`, { x: 0 }, { x: 120, duration: 1.6, ease: "none", repeat: 2 }, B.s11 + 0.2);
fromTo("#metB", { opacity: 0, x: 60, y: 200 }, { opacity: 1, x: 120, y: 256, duration: 0.6, ease: "power2.in" }, B.s11 + 3.2);
to("#metB", { x: 460, y: 250, duration: 1.4, ease: "power1.in" }, B.s11 + 3.8);
fromTo("#metL", { opacity: 0, x: 40, y: -180 }, { opacity: 1, x: 100, y: -296, duration: 0.6, ease: "power2.in" }, B.s11 + 3.5);
to("#metL", { x: 460, y: -290, duration: 1.3, ease: "power1.in" }, B.s11 + 4.1);
cam(B.s11 + 2.0, P.types.x + 300, P.types.y, 1.05, 3.0, "sine.inOut");

// ═════ 12 · DESCARTAR ═════
cam(B.s12 - 0.3, P.end.x, P.end.y - 20, 1.0, 0.9, "power3.inOut", { blur: true });
pop("#e1", B.s12 + 0.2);
fadeIn("#ea1", B.s12 + 0.9, 0.3);
pop("#e2", B.s12 + 1.1);
fromTo("#calRoll2", { y: 0 }, { y: -180 * 14, duration: 1.2, ease: "steps(14)" }, B.s12 + 1.3);
fadeIn("#ea2", B.s12 + 2.0, 0.3);
pop("#fE", B.s12 + 2.2);
fromTo("#ret", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, B.s12 + 2.9);
to("#ret", { x: 60, y: 40, duration: 0.7, ease: "power2.inOut" }, B.s12 + 3.4);
punch(B.s12 + 2.9, 1.05);
cam(B.s12 + 1.0, P.end.x + 40, P.end.y - 20, 1.06, 3.5, "sine.inOut");

// ───────────────────────── escriptura ─────────────────────────
function serialize() {
  const META = new Set(["duration", "ease", "repeat", "yoyo", "repeatDelay", "svgOrigin", "transformOrigin", "stagger"]);
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

const bgDots = `<svg class="layer" style="left:-3000px;top:-2000px" width="30000" height="4000" viewBox="-3000 -2000 30000 4000">
  <defs><pattern id="gDots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="2.6" fill="#DCE3EC"/></pattern></defs>
  <rect x="-3000" y="-2000" width="30000" height="4000" fill="url(#gDots)"/></svg>`;

fs.writeFileSync(path.join(ROOT, "compositions/world.html"), `<template>
  <style>${CSS}
#punchz{position:absolute;left:${W / 2}px;top:${H / 2}px;width:0;height:0}
#punchz>#cam{left:0;top:0}
  </style>
  <div id="root" data-composition-id="world" data-width="${W}" data-height="${H}">
    <div id="bgSoft"></div>
    <div id="punchz"><div id="cam"><div id="zoom">
      <div id="bgpan">${bgDots}</div>
      <div id="pan">${WSVG}</div>
    </div></div></div>
    <div id="kws">${kwHTML}</div>
    <div id="flash"></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${serialize()}
    window.__timelines["world"] = tl;
  </script>
</template>
`);
if (!UNTIL) fs.writeFileSync(path.join(ROOT, "assets/sfx-cues.json"), JSON.stringify(SFX.filter((s) => s.t < DUR).sort((a, b) => a.t - b.t), null, 1));
const hasSfx = fs.existsSync(path.join(ROOT, "assets/sfx-mix.wav"));
fs.writeFileSync(path.join(ROOT, "index.html"), `<!doctype html>
<html lang="ca">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.bg}; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}" data-fps="30">
      <div id="world" data-composition-id="world" data-composition-src="compositions/world.html"
        data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="graphics"
        data-width="${W}" data-height="${H}" style="z-index:1"></div>
      ${hasSfx ? `<audio id="sfx" class="clip" src="assets/sfx-mix.wav" data-start="0" data-duration="${DUR}" data-track-index="2" data-volume="1"></audio>` : ""}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);
console.log(`OK · ${DUR}s · ${T.length} instruccions · ${SFX.length} efectes`);
