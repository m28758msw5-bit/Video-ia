// Generador del vídeo «Biòpsia i estudi histològic» (continuació; 1920×1080, sense veu ni música).
// Fons fosc, lletra blanca fina i detalls en turquesa / blau elèctric.
// Escriu index.html, compositions/world.html i assets/sfx-cues.json.
//
//   node scripts/build.mjs             vídeo sencer
//   node scripts/build.mjs --until 20  només fins al segon 20
//
// El calendari surt del text: cada frase es manté el temps de llegir-la
// (1,4 s + 0,3 s per paraula) i cada escena es construeix sobre l'inici de les seves frases.

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
  bg: "#060A13", bg2: "#0B1222", grid: "#14203A",
  ink: "#F1F5F9", dim: "#94A3B8",
  teal: "#2DD4BF", blue: "#3B82F6", cyan: "#22D3EE", violet: "#8B5CF6",
  pink: "#F472B6", red: "#FB7185", blood: "#F43F5E", lymph: "#34D399",
};

// ───────────────────────── text (només les frases indicades) ─────────────────────────
// scene: on és la càmera mentre es llegeix. acc: paraules en turquesa.
const PHRASES = [
  { id: "f1", scene: 1, acc: [], t: "Normalment, l’exploració oral és suficient per fer el diagnòstic, però…" },
  { id: "f2", scene: 1, acc: [], t: "Si no es cura quan eliminem la causa, cal estudiar-la per descartar altres problemes." },
  { id: "f3", scene: 2, acc: ["biòpsia"], t: "En aquest cas, es podria fer una biòpsia." },
  { id: "f4", scene: 2, acc: [], t: "Consisteix a extreure una petita mostra del teixit de la lesió per analitzar-la." },
  { id: "f5", scene: 3, acc: ["estudi", "histològic"], t: "Aquesta mostra s’envia per fer un estudi histològic." },
  { id: "f6", scene: 4, acc: [], t: "Permet observar com són les cèl·lules i com estan organitzades dins del teixit." },
  { id: "f7", scene: 5, acc: [], t: "D’aquesta manera, es poden detectar possibles alteracions cel·lulars, com les que podrien indicar una lesió potencialment maligna." },
  { id: "f8", scene: 5, acc: [], t: "Quan observem les cèl·lules al microscopi, podem comparar les cèl·lules normals amb les que presenten alteracions." },
  { id: "f9", scene: 6, acc: [], t: "En condicions normals, les cèl·lules es divideixen de manera controlada i mantenen una organització determinada dins del teixit." },
  { id: "f10", scene: 7, acc: ["neoplàsia"], t: "En canvi, quan aquest control es perd, les cèl·lules poden començar a multiplicar-se de manera anormal i formar una neoplàsia, és a dir, un creixement nou i anormal de teixit." },
  { id: "f11", scene: 8, acc: [], t: "Les neoplàsies poden ser de dos tipus." },
  { id: "f12", scene: 8, acc: ["benignes"], t: "Les benignes creixen de manera més limitada i no envaeixen altres teixits." },
  { id: "f13", scene: 9, acc: ["malignes", "càncer"], t: "En canvi, les malignes, que són les que coneixem com a càncer, poden envair els teixits del voltant i, en alguns casos, estendre’s a altres parts del cos a través de la sang o del sistema limfàtic." },
  { id: "f14", scene: 10, acc: ["biòpsia"], t: "Per això, la biòpsia és important: permet estudiar les cèl·lules i l’organització del teixit per detectar possibles alteracions i determinar si hi ha signes d’una neoplàsia." },
  { id: "f15", scene: 11, acc: [], t: "Així, si una lesió de la boca no cicatritza després d’eliminar-ne la causa, es pot valorar si cal fer aquest estudi per descartar problemes més importants." },
];
const words = (s) => s.split(/\s+/).length;
const READ = (p) => 1.4 + 0.3 * words(p.t);
const GAP = 0.45, TRAVEL = 1.4;
let clock = 0.6;
let prevScene = 1;
for (const p of PHRASES) {
  if (p.scene !== prevScene) clock += TRAVEL; // la càmera viatja abans de la frase
  p.start = r2(clock);
  p.end = r2(clock + READ(p));
  clock = p.end + GAP;
  prevScene = p.scene;
}
const PH = Object.fromEntries(PHRASES.map((p) => [p.id, p]));
const END = r2(PHRASES.at(-1).end + 1.6);
const DUR = +(UNTIL ?? END).toFixed(3);

// ───────────────────────── posicions al món ─────────────────────────
// Cada escena és un pla de 1920×1080 centrat a (x, y). El text va a baix, en pantalla.
const SC = {
  1: { x: 0, y: 0 },        // llengua: exploració i causa
  2: { x: 2600, y: 0 },     // biòpsia
  3: { x: 5200, y: 0 },     // laboratori: microscopi
  4: { x: 7800, y: 0 },     // camp microscòpic (teixit organitzat)
  5: { x: 10400, y: 0 },    // comparació normal / alterat
  6: { x: 10400, y: 0 },    // divisió controlada (mateix pla, zoom)
  7: { x: 13000, y: 0 },    // neoplàsia
  8: { x: 15600, y: 0 },    // benigna
  9: { x: 15600, y: 0 },    // maligna (mateix pla)
  10: { x: 18200, y: 0 },   // la biòpsia permet detectar
  11: { x: 20800, y: 0 },   // cicle final
};
const VY = -90; // centre vertical de les il·lustracions (deixa lloc al text de baix)

// ───────────────────────── art ─────────────────────────
const TONGUE = "M-235 40 C-245 -80 -120 -128 0 -128 C120 -128 245 -80 235 40 C225 165 120 255 0 255 C-120 255 -225 165 -235 40Z";
const glowLine = (d, color, w = 5, extra = "") => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

// Epiteli esquemàtic: capes de cèl·lules sobre la membrana basal.
// mode: "normal" | "altered". Retorna { svg, cells:[{x,y,id}] }.
function epithelium(prefix, w, h, mode, seed) {
  const R = rng(seed);
  const memb = (x) => h * 0.7 + Math.sin(x / 70) * 16;
  let out = "", cells = [];
  // teixit conjuntiu
  for (let i = 0; i < 14; i++) {
    const x = R() * w, y = h * 0.8 + R() * h * 0.2;
    out += `<path d="M${r2(x)} ${r2(y)} q${r2(30 + R() * 40)} ${r2(-10 + R() * 20)} ${r2(70 + R() * 50)} ${r2(-6 + R() * 12)}" stroke="${C.blue}" stroke-width="3" opacity="0.35" fill="none"/>`;
  }
  out += `<path d="M0 ${r2(memb(0))} ${Array.from({ length: 41 }, (_, i) => `L${r2((w * i) / 40)} ${r2(memb((w * i) / 40))}`).join(" ")}" stroke="${C.teal}" stroke-width="4" fill="none" opacity="0.9"/>`;
  const layers = 9;
  let k = 0;
  for (let L = 0; L < layers; L++) {
    const cw = 54 + L * 7, ch = Math.max(26, 62 - L * 5);
    for (let x = (L % 2) * cw * 0.5 + 20; x < w - 20; x += cw + 4) {
      const base = memb(x) - 8 - ch / 2 - L * (ch + 4) - (L > 0 ? 10 : 0);
      let cx = x, cy = base, sx = 1, rot = 0, nuc = 0.32, dark = 0.55, multi = false;
      if (mode === "altered") {
        cx += (R() - 0.5) * 26; cy += (R() - 0.5) * 30;
        sx = 0.65 + R() * 0.95; rot = (R() - 0.5) * 60; nuc = 0.38 + R() * 0.3; dark = 0.75 + R() * 0.25;
        multi = R() < 0.12;
        if (L > 5 && R() < 0.5) continue;
      }
      if (cy < 30) continue;
      const id = `${prefix}c${k++}`;
      const rw = (cw / 2) * sx, rh = (ch / 2) * (mode === "altered" ? 0.75 + R() * 0.6 : 1);
      const nr = Math.min(rw, rh) * nuc * 1.4;
      out += `<g id="${id}" transform="translate(${r2(cx)},${r2(cy)}) rotate(${r2(rot)})">
        <rect x="${r2(-rw)}" y="${r2(-rh)}" width="${r2(rw * 2)}" height="${r2(rh * 2)}" rx="${r2(Math.min(rw, rh) * 0.7)}" fill="${C.teal}" fill-opacity="0.08" stroke="${C.teal}" stroke-width="2.5" stroke-opacity="0.85"/>
        <circle r="${r2(nr)}" fill="${C.violet}" fill-opacity="${r2(dark)}" stroke="${C.blue}" stroke-width="2"/>
        ${multi ? `<circle cx="${r2(nr * 1.2)}" cy="${r2(-nr * 0.4)}" r="${r2(nr * 0.7)}" fill="${C.violet}" fill-opacity="${r2(dark)}" stroke="${C.blue}" stroke-width="2"/>` : ""}
      </g>`;
      cells.push({ x: cx, y: cy, id, L, r: Math.max(rw, rh), nr });
    }
  }
  return { svg: out, cells };
}

// Camp circular de microscopi (amb retícula) que conté un epiteli.
function field(prefix, cx, cy, r, mode, seed) {
  const ep = epithelium(prefix, r * 2, r * 2, mode, seed);
  return {
    cells: ep.cells.map((c) => ({ ...c, wx: cx - r + c.x, wy: cy - r + c.y })),
    svg: `<g transform="translate(${cx - r},${cy - r})"><g id="${prefix}">
      <clipPath id="${prefix}Clip"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath>
      <circle cx="${r}" cy="${r}" r="${r}" fill="${C.bg2}"/>
      <g clip-path="url(#${prefix}Clip)">${ep.svg}</g>
      <circle cx="${r}" cy="${r}" r="${r}" fill="none" stroke="${C.cyan}" stroke-width="4" opacity="0.8"/>
      <path d="M${r} 14 V40 M${r} ${2 * r - 40} V${2 * r - 14} M14 ${r} H40 M${2 * r - 40} ${r} H${2 * r - 14}" stroke="${C.cyan}" stroke-width="3" opacity="0.6"/>
    </g></g>`,
  };
}

const S = SC;
// Escena 1 i 2: llengua de línies
const tongueLine = (id, scale, lesionId) => `
  <g id="${id}" transform="scale(${scale})">
    <path id="${id}Out" d="${TONGUE}" fill="${C.teal}" fill-opacity="0.05" stroke="${C.teal}" stroke-width="${r2(5 / scale)}" pathLength="1000" stroke-dasharray="1000 1000"/>
    <path d="M0 -100 Q8 60 0 190" stroke="${C.teal}" stroke-width="${r2(3 / scale)}" opacity="0.5" fill="none"/>
    <g transform="translate(196,108) rotate(-62)" id="${lesionId}">
      <ellipse rx="34" ry="22" fill="${C.cyan}" fill-opacity="0.18" stroke="${C.cyan}" stroke-width="${r2(4 / scale)}"/>
      <ellipse rx="14" ry="8" fill="${C.cyan}" fill-opacity="0.6"/>
    </g>
  </g>`;

// Bloc de teixit en perspectiva (escena 2) amb la lesió a dalt.
function tissueBlock() {
  return `
  <g id="block">
    <path d="M-420 -40 L120 -40 L320 -180 L-220 -180Z" fill="${C.teal}" fill-opacity="0.08" stroke="${C.teal}" stroke-width="4"/>
    <path d="M-420 -40 V200 H120 V-40" fill="${C.blue}" fill-opacity="0.06" stroke="${C.teal}" stroke-width="4"/>
    <path d="M120 200 L320 60 V-180" fill="${C.blue}" fill-opacity="0.04" stroke="${C.teal}" stroke-width="4"/>
    <path d="M-420 10 H120 L320 -130" stroke="${C.cyan}" stroke-width="3" opacity="0.6" fill="none"/>
    <path d="M-420 90 H120 L320 -50" stroke="${C.blue}" stroke-width="3" opacity="0.5" fill="none" stroke-dasharray="10 8"/>
    <ellipse id="bLesion" cx="-50" cy="-110" rx="80" ry="34" fill="${C.cyan}" fill-opacity="0.18" stroke="${C.cyan}" stroke-width="4"/>
    <ellipse id="bHole" cx="-50" cy="-110" rx="30" ry="13" fill="${C.bg}" stroke="${C.cyan}" stroke-width="3" opacity="0"/>
  </g>`;
}

// Microscopi de línies (escena 3).
function microscope() {
  return `
  <g id="scope">
    ${glowLine("M-60 300 H200", C.blue, 6)}
    ${glowLine("M120 300 V-150 Q120 -210 60 -230", C.blue, 6)}
    ${glowLine("M-10 -330 L60 -230 M-40 -300 L30 -200", C.blue, 6)}
    <rect x="-70" y="-380" width="60" height="40" rx="8" fill="none" stroke="${C.blue}" stroke-width="6" transform="rotate(-35 -40 -360)"/>
    <rect x="-40" y="-150" width="60" height="70" rx="10" fill="none" stroke="${C.blue}" stroke-width="6"/>
    ${glowLine("M-10 -80 V-50", C.cyan, 6)}
    ${glowLine("M-150 -20 H140", C.blue, 6)}
    ${glowLine("M140 120 a30 30 0 1 0 0.1 0", C.blue, 5)}
    <path id="beam" d="M-10 -20 L-30 -50 H10 Z" fill="${C.cyan}" opacity="0"/>
  </g>`;
}

// ───────────────────────── composició ─────────────────────────
function buildWorld() {
  const s1 = S[1], s2 = S[2], s3 = S[3], s4 = S[4], s5 = S[5], s7 = S[7], s8 = S[8], s10 = S[10], s11 = S[11];
  const f4 = field("fA", s4.x, s4.y + VY, 370, "normal", 21);
  const f5n = field("fN", s5.x - 420, s5.y + VY, 335, "normal", 21);
  const f5a = field("fX", s5.x + 420, s5.y + VY, 335, "altered", 33);
  const f10 = field("fZ", s10.x - 250, s10.y + VY, 335, "altered", 33);
  // cèl·lules alterades a ressaltar (les de nucli més gran)
  const pickHL = (cells, n, seed, cx, cy, r) => {
    const R = rng(seed);
    return [...cells].filter((c) => Math.hypot(c.wx - cx, c.wy - cy) < r - 70).sort((a, b) => b.nr - a.nr).slice(0, 8).sort(() => R() - 0.5).slice(0, n);
  };
  const hl5 = pickHL(f5a.cells, 3, 5, s5.x + 420, s5.y + VY, 335);
  const hl10 = pickHL(f10.cells, 3, 7, s10.x - 250, s10.y + VY, 335);

  // Escena 7: neoplàsia (cèl·lules que es multipliquen)
  const R7 = rng(77);
  const neo = [];
  for (let i = 0; i < 70; i++) {
    const a = R7() * Math.PI * 2, d = Math.sqrt(i / 70) * 260;
    neo.push({ x: Math.cos(a) * d * 1.25, y: Math.sin(a) * d * 0.85 - 40, r: 20 + R7() * 14, i });
  }
  neo.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  // Escena 8/9: benigna (esquerra) i maligna (dreta)
  const R8 = rng(88);
  const benign = Array.from({ length: 26 }, (_, i) => { const a = R8() * Math.PI * 2, d = Math.sqrt(R8()) * 150; return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.8, r: 16 + R8() * 6 }; });
  const malig = Array.from({ length: 34 }, () => { const a = R8() * Math.PI * 2, d = Math.sqrt(R8()) * 160; return { x: Math.cos(a) * d * (1 + R8() * 0.3), y: Math.sin(a) * d * 0.85, r: 14 + R8() * 12 }; });
  const tendrils = [
    "M120 -40 q60 -30 120 -20 q40 10 70 -30", "M100 80 q70 20 110 70 q20 30 70 30", "M-20 140 q10 60 -30 110",
    "M-140 -60 q-60 -40 -90 -100", "M40 -150 q20 -60 80 -90",
  ];
  const cellG = (c, fill, stroke, id = "") => `<g ${id ? `id="${id}"` : ""} transform="translate(${r2(c.x)},${r2(c.y)})"><circle r="${r2(c.r)}" fill="${fill}" fill-opacity="0.16" stroke="${stroke}" stroke-width="3"/><circle r="${r2(c.r * 0.42)}" fill="${C.violet}" fill-opacity="0.8"/></g>`;

  return {
    hl5, hl10, neo, f5n,
    svg: `
<svg class="layer" style="left:-2000px;top:-1600px" width="25600" height="3200" viewBox="-2000 -1600 25600 3200">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="gLiquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cyan}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0.15"/></linearGradient>
    <radialGradient id="gHalo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.blue}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  </defs>

  <!-- fil que uneix les escenes -->
  <path id="thread" d="M${S[1].x - 900} 330 ${[2, 3, 4, 5, 7, 8, 10, 11].map((k) => `L${S[k].x} 330`).join(" ")} L${S[11].x + 900} 330" stroke="${C.blue}" stroke-width="3" stroke-dasharray="2 18" stroke-linecap="round" opacity="0.5" fill="none"/>

  <!-- 1 · llengua, exploració i causa -->
  <g transform="translate(${s1.x - 120},${s1.y + VY - 40})" filter="url(#glow)">
    ${tongueLine("tg1", 1.25, "les1")}
    <g transform="scale(1.25)">
      <g transform="translate(232,182) rotate(-48)">
        <path id="toothSharp" d="M-34 30 V-10 L-24 -34 L-14 -16 L-4 -38 L6 -16 L16 -36 L26 -14 L34 -30 V30Z" fill="none" stroke="${C.red}" stroke-width="4" stroke-linejoin="round"/>
        <path id="toothSmooth" d="M-34 30 V-14 Q-34 -32 0 -34 Q34 -32 34 -14 V30Z" fill="none" stroke="${C.teal}" stroke-width="4" opacity="0"/>
      </g>
    </g>
    <g id="mirror" opacity="0"><circle cx="0" cy="0" r="46" fill="${C.cyan}" fill-opacity="0.12" stroke="${C.cyan}" stroke-width="5"/>${glowLine("M30 34 L300 330", C.cyan, 8)}</g>
    <circle id="okRing" cx="${196 * 1.25}" cy="${108 * 1.25}" r="70" fill="none" stroke="${C.teal}" stroke-width="5" opacity="0"/>
    <circle id="timer" cx="${196 * 1.25}" cy="${108 * 1.25}" r="96" fill="none" stroke="${C.blue}" stroke-width="6" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 ${196 * 1.25} ${108 * 1.25})"/>
    <circle id="scanRing" cx="${196 * 1.25}" cy="${108 * 1.25}" r="130" fill="none" stroke="${C.cyan}" stroke-width="3" stroke-dasharray="6 10" opacity="0"/>
  </g>

  <!-- 2 · biòpsia -->
  <g transform="translate(${s2.x - 160},${s2.y + VY + 40})" filter="url(#glow)">
    ${tissueBlock()}
    <g transform="translate(-50,0)"><g id="punch" opacity="0">
      <rect x="-30" y="-560" width="60" height="320" rx="12" fill="none" stroke="${C.ink}" stroke-width="4" opacity="0.8"/>
      <rect x="-22" y="-240" width="44" height="110" rx="6" fill="none" stroke="${C.cyan}" stroke-width="4"/>
      <path d="M-22 -136 l8 10 l8 -10 l8 10 l8 -10 l8 10" stroke="${C.cyan}" stroke-width="3" fill="none"/>
    </g></g>
    <g id="sample" opacity="0">
      <rect x="-20" y="-40" width="40" height="64" rx="10" fill="${C.cyan}" fill-opacity="0.2" stroke="${C.cyan}" stroke-width="4"/>
      <path d="M-20 -14 H20 M-20 8 H20" stroke="${C.blue}" stroke-width="3"/>
    </g>
    <g id="vial" transform="translate(560,40)" opacity="0">
      <path d="M-80 -150 V140 Q-80 180 -40 180 H40 Q80 180 80 140 V-150" fill="none" stroke="${C.ink}" stroke-width="5" opacity="0.85"/>
      <path d="M-76 -40 V140 Q-76 176 -40 176 H40 Q76 176 76 140 V-40Z" fill="url(#gLiquid)"/>
      <path id="liqTop" d="M-76 -40 Q0 -54 76 -40" stroke="${C.cyan}" stroke-width="3" fill="none"/>
      <g id="lid"><rect x="-96" y="-200" width="192" height="52" rx="14" fill="${C.blue}" fill-opacity="0.25" stroke="${C.blue}" stroke-width="5"/></g>
      <circle id="bub1" cx="-20" cy="100" r="7" fill="none" stroke="${C.cyan}" stroke-width="3" opacity="0"/>
      <circle id="bub2" cx="24" cy="130" r="5" fill="none" stroke="${C.cyan}" stroke-width="3" opacity="0"/>
    </g>
  </g>

  <!-- 3 · laboratori -->
  <g transform="translate(${s3.x - 80},${s3.y + VY + 40})" filter="url(#glow)">
    ${microscope()}
    <g transform="translate(-480,-20)"><g id="slide" opacity="0">
      <rect x="-150" y="-36" width="300" height="72" rx="8" fill="${C.cyan}" fill-opacity="0.08" stroke="${C.ink}" stroke-width="4" opacity="0.9"/>
      <ellipse cx="20" cy="0" rx="60" ry="20" fill="${C.pink}" fill-opacity="0.45" stroke="${C.pink}" stroke-width="3"/>
      <ellipse cx="20" cy="0" rx="30" ry="9" fill="${C.violet}" fill-opacity="0.6"/>
    </g></g>
    <g transform="translate(-560,170) scale(0.5)"><g id="vial3" opacity="0">
      <path d="M-80 -150 V140 Q-80 180 -40 180 H40 Q80 180 80 140 V-150" fill="none" stroke="${C.ink}" stroke-width="8" opacity="0.85"/>
      <path d="M-76 -40 V140 Q-76 176 -40 176 H40 Q76 176 76 140 V-40Z" fill="url(#gLiquid)"/>
      <rect x="-96" y="-200" width="192" height="52" rx="14" fill="${C.blue}" fill-opacity="0.25" stroke="${C.blue}" stroke-width="8"/>
    </g></g>
  </g>

  <!-- 4 · camp microscòpic -->
  <circle cx="${s4.x}" cy="${s4.y + VY}" r="520" fill="url(#gHalo)"/>
  ${f4.svg}

  <!-- 5/6 · normal vs alterat -->
  ${f5n.svg}
  ${f5a.svg}
  ${hl5.map((c, i) => `<circle id="hl5_${i}" cx="${r2(c.wx)}" cy="${r2(c.wy)}" r="${r2(c.r + 18)}" fill="none" stroke="${C.cyan}" stroke-width="4" stroke-dasharray="8 7" opacity="0"/>`).join("")}
  <g id="mitosis" transform="translate(${s5.x - 420},${s5.y + VY - 40})" opacity="0">
    <circle r="96" fill="${C.bg2}" opacity="0.9"/>
    <g id="mitA"><circle r="34" fill="#0F2A36" stroke="${C.cyan}" stroke-width="4"/><circle r="14" fill="${C.violet}"/></g>
    <g id="mitB"><circle r="34" fill="#0F2A36" stroke="${C.cyan}" stroke-width="4"/><circle r="14" fill="${C.violet}"/></g>
  </g>

  <!-- 7 · neoplàsia -->
  <g transform="translate(${s7.x},${s7.y + VY + 60})" filter="url(#glow)">
    <path d="M-900 180 Q-450 150 0 180 T900 180" stroke="${C.teal}" stroke-width="5" fill="none" opacity="0.8"/>
    ${Array.from({ length: 16 }, (_, i) => `<g transform="translate(${-840 + i * 112},${150 + Math.sin(i) * 6})"><rect x="-44" y="-26" width="88" height="52" rx="22" fill="${C.teal}" fill-opacity="0.07" stroke="${C.teal}" stroke-width="3" opacity="0.7"/><circle r="12" fill="${C.violet}" fill-opacity="0.6"/></g>`).join("")}
    <ellipse id="neoHalo" cx="0" cy="-40" rx="380" ry="260" fill="url(#gHalo)" opacity="0"/>
    ${neo.map((c, i) => cellG(c, C.cyan, i < 4 ? C.cyan : C.blue, `neo${i}`)).join("")}
    <path id="neoOutline" d="M-330 120 Q-360 -150 -60 -260 Q260 -320 340 -60 Q390 120 300 160" stroke="${C.cyan}" stroke-width="4" stroke-dasharray="10 10" fill="none" opacity="0"/>
  </g>

  <!-- 8/9 · benigna i maligna -->
  <g transform="translate(${s8.x - 470},${s8.y + VY})" filter="url(#glow)">
    <g id="benign">
      ${benign.map((c) => cellG(c, C.teal, C.teal)).join("")}
      <ellipse id="capsule" cx="0" cy="0" rx="190" ry="160" fill="none" stroke="${C.teal}" stroke-width="7" pathLength="100" stroke-dasharray="0 100"/>
    </g>
    <path d="M-330 240 H330" stroke="${C.teal}" stroke-width="3" opacity="0.4"/>
  </g>
  <g transform="translate(${s8.x + 420},${s8.y + VY})" filter="url(#glow)">
    <path id="vBlood" d="M-460 230 C -200 200, 200 260, 520 220" stroke="${C.blood}" stroke-width="34" stroke-opacity="0.22" fill="none" stroke-linecap="round"/>
    <path d="M-460 230 C -200 200, 200 260, 520 220" stroke="${C.blood}" stroke-width="4" fill="none" opacity="0.8"/>
    <path id="vLymph" d="M-460 -250 C -150 -220, 220 -280, 520 -240" stroke="${C.lymph}" stroke-width="30" stroke-opacity="0.2" fill="none" stroke-linecap="round"/>
    <path d="M-460 -250 C -150 -220, 220 -280, 520 -240" stroke="${C.lymph}" stroke-width="4" fill="none" opacity="0.8"/>
    <g id="malig" opacity="0">
      ${tendrils.map((d, i) => `<path id="tend${i}" d="${d}" stroke="${C.red}" stroke-width="10" stroke-linecap="round" fill="none" pathLength="100" stroke-dasharray="0 100" opacity="0.8"/>`).join("")}
      ${malig.map((c) => cellG(c, C.red, C.red)).join("")}
    </g>
    <g id="metB" opacity="0">${cellG({ x: 0, y: 0, r: 14 }, C.red, C.red)}</g>
    <g id="metL" opacity="0">${cellG({ x: 0, y: 0, r: 14 }, C.red, C.red)}</g>
  </g>

  <!-- 10 · la biòpsia permet detectar -->
  ${f10.svg}
  ${hl10.map((c, i) => `<circle id="hl10_${i}" cx="${r2(c.wx)}" cy="${r2(c.wy)}" r="${r2(c.r + 18)}" fill="none" stroke="${C.cyan}" stroke-width="4" stroke-dasharray="8 7" opacity="0"/>`).join("")}
  <g transform="translate(${s10.x - 250},${s10.y + VY})"><g id="reticle" opacity="0">
    <circle r="80" fill="none" stroke="${C.cyan}" stroke-width="4"/>
    ${glowLine("M-110 0 H-60 M60 0 H110 M0 -110 V-60 M0 60 V110", C.cyan, 4)}
  </g></g>
  <g transform="translate(${s10.x + 420},${s10.y + VY - 40})" filter="url(#glow)" id="slide10" opacity="0">
    <rect x="-190" y="-46" width="380" height="92" rx="10" fill="${C.cyan}" fill-opacity="0.08" stroke="${C.ink}" stroke-width="4" opacity="0.9"/>
    <ellipse cx="20" cy="0" rx="80" ry="26" fill="${C.pink}" fill-opacity="0.45" stroke="${C.pink}" stroke-width="3"/>
  </g>

  <!-- 11 · cicle final: lesió → no cicatritza → estudi -->
  <g transform="translate(${s11.x},${s11.y + VY})" filter="url(#glow)">
    <g id="cy1" transform="translate(-560,0)" opacity="0">${tongueLine("tg11", 0.62, "les11")}</g>
    <g id="cy2" transform="translate(0,0)" opacity="0">
      <circle r="120" fill="none" stroke="${C.blue}" stroke-width="6"/>
      <circle id="cyArc" r="120" fill="none" stroke="${C.cyan}" stroke-width="10" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90)"/>
      ${glowLine("M0 0 V-70 M0 0 L50 30", C.ink, 7)}
    </g>
    <g id="cy3" transform="translate(560,40) scale(0.62)" opacity="0">${microscope().replace('id="scope"', 'id="scope11"').replace('id="beam"', 'id="beam11"')}</g>
    <path id="arr1" d="M-330 0 H-170 M-196 -22 L-170 0 L-196 22" stroke="${C.cyan}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>
    <path id="arr2" d="M170 0 H330 M304 -22 L330 0 L304 22" stroke="${C.cyan}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>
  </g>
</svg>`,
  };
}

const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif;color:${C.ink}}
#bgGlow{position:absolute;inset:0;background:radial-gradient(60% 55% at 50% 40%, rgba(59,130,246,.10), rgba(6,10,19,0) 70%),radial-gradient(80% 50% at 50% 115%, rgba(45,212,191,.14), rgba(6,10,19,0) 70%)}
#cam{position:absolute;left:${W / 2}px;top:${H / 2}px;width:0;height:0}
#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
#txt{position:absolute;left:0;right:0;bottom:0;height:300px}
.ph{position:absolute;left:220px;right:220px;bottom:96px;text-align:center;font-weight:300;font-size:46px;line-height:1.38;letter-spacing:.005em;color:${C.ink};opacity:0}
.ph .a{color:${C.teal};font-weight:400}
.ph .w{display:inline-block;white-space:pre}
#scrim{position:absolute;left:0;right:0;bottom:0;height:340px;background:linear-gradient(to top, rgba(6,10,19,.92), rgba(6,10,19,.75) 55%, rgba(6,10,19,0))}
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
function cam(t, x, y, s, dur = TRAVEL, ease = "power2.inOut", opts = {}) {
  if (lastCam && t < lastCam.t + lastCam.dur) lastCam.tw.forEach((o) => (o.vars.duration = r2(Math.max(0.2, t - lastCam.t))));
  const tws = [
    to("#zoom", { scale: s, duration: dur, ease }, t),
    to("#pan", { x: -x, y: -y, duration: dur, ease }, t),
    to("#bgpan", { x: -x * 0.6, y: -y * 0.6, duration: dur, ease }, t),
  ];
  lastCam = { t, dur, tw: tws };
  if (opts.blur || Math.hypot(x - camState.x, y - camState.y) > 1200) {
    to("#zoom", { filter: "blur(6px)", duration: dur * 0.45, ease: "power2.in" }, t);
    to("#zoom", { filter: "blur(0px)", duration: dur * 0.5, ease: "power2.out" }, t + dur * 0.45);
    sfx(whoosh(), t + dur * 0.5, 0.3);
  }
  camState = { x, y, s };
}
const fadeIn = (sel, t, d = 0.8, extra = {}) => fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d, ease: "power2.out", ...extra }, t);
const draw = (sel, t, d = 1.2) => fromTo(sel, { attr: { "stroke-dashoffset": 1000 } }, { attr: { "stroke-dashoffset": 0 }, duration: d, ease: "power2.inOut" }, t);

const { svg: WSVG, hl5, hl10, neo } = buildWorld();

raw(`gsap.set(["#lid","#punch","#sample","#mitA","#mitB","#capsule","#cyArc","#scope11"], {svgOrigin:"0 0"});`);
raw(`gsap.set(["#okRing","#scanRing","#neoHalo","#reticle"], {transformOrigin:"50% 50%"});`);

// Text: cada frase entra amb un desenfocament suau paraula a paraula i surt amb una fosa.
let txtHTML = "";
PHRASES.forEach((p) => {
  const ws = p.t.split(/\s+/).map((w, i) => {
    const clean = w.toLowerCase().replace(/[.,:…’']/g, "");
    const acc = p.acc.some((a) => clean.includes(a.toLowerCase()));
    return `<span class="w${acc ? " a" : ""}" id="${p.id}w${i}">${w}</span>`;
  });
  txtHTML += `<div class="ph" id="${p.id}">${ws.join(" ")}</div>`;
  set(`#${p.id}`, { opacity: 1 }, p.start);
  ws.forEach((_, i) => fromTo(`#${p.id}w${i}`, { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, p.start + i * 0.045));
  to(`#${p.id}`, { opacity: 0, duration: 0.4, ease: "power2.in" }, p.end - 0.4);
  set(`#${p.id}`, { opacity: 0 }, p.end);
});

// Vida contínua: el fons i el fil es mouen lentament tot el vídeo.
fromTo("#thread", { attr: { "stroke-dashoffset": 0 } }, { attr: { "stroke-dashoffset": -400 }, duration: DUR, ease: "none" }, 0);
fromTo("#bgGlow", { opacity: 0.8 }, { opacity: 1, duration: 4, yoyo: true, repeat: Math.ceil(DUR / 4), ease: "sine.inOut" }, 0);

// ═════ 1 · exploració i causa ═════
{
  const p1 = PH.f1, p2 = PH.f2;
  set("#zoom", { scale: 1.08 }, 0);
  cam(0, S[1].x, S[1].y, 1, 3, "power1.out");
  draw("#tg1Out", 0.1, 1.6);
  fadeIn("#les1", 0.9, 0.6);
  // exploració: el mirall recorre la llengua
  fromTo("#mirror", { opacity: 0, x: 420, y: 240 }, { opacity: 1, x: 120, y: 40, duration: 0.9, ease: "power3.out" }, p1.start + 0.4);
  to("#mirror", { x: 230, y: 120, duration: 1.4, ease: "sine.inOut" }, p1.start + 1.5);
  fromTo("#okRing", { opacity: 0, scale: 0.6 }, { opacity: 0.9, scale: 1, duration: 0.6, ease: "power3.out" }, p1.start + 2.6);
  sfx("pop1", p1.start + 2.65, 0.25);
  // «però…»: l'anell s'apaga
  to("#okRing", { opacity: 0.15, duration: 0.8 }, p1.end - 1.4);
  to("#mirror", { opacity: 0, x: 420, y: 240, duration: 0.7, ease: "power2.in" }, p1.end - 1.0);
  // f2: s'elimina la causa (la vora afilada es fa llisa), passa el temps i la lesió no es cura
  to("#toothSharp", { opacity: 0, duration: 0.6 }, p2.start + 0.6);
  fromTo("#toothSmooth", { opacity: 0 }, { opacity: 1, duration: 0.6 }, p2.start + 0.6);
  sfx("click1", p2.start + 0.7, 0.25);
  to("#okRing", { opacity: 0, duration: 0.3 }, p2.start);
  fromTo("#timer", { attr: { "stroke-dasharray": "0 100" } }, { attr: { "stroke-dasharray": "100 0" }, duration: 3.0, ease: "none" }, p2.start + 1.4);
  fromTo("#les1", { scale: 1 }, { scale: 1.15, duration: 0.5, yoyo: true, repeat: 5, ease: "sine.inOut", svgOrigin: "0 0" }, p2.start + 1.6);
  fromTo("#scanRing", { opacity: 0, scale: 0.7, rotation: 0 }, { opacity: 1, scale: 1, rotation: 90, duration: 1.2, ease: "power2.out" }, p2.start + 4.8);
  sfx("pop2", p2.start + 4.9, 0.25);
}

// ═════ 2 · biòpsia ═════
{
  const p3 = PH.f3, p4 = PH.f4;
  cam(p3.start - TRAVEL, S[2].x, S[2].y, 1);
  fadeIn("#block", p3.start - 0.4, 0.8);
  // el punxó baixa, gira i extreu una mostra cilíndrica
  fromTo("#punch", { opacity: 0, y: -260 }, { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }, p3.start + 0.6);
  to("#punch", { y: 70, duration: 0.7, ease: "power2.inOut" }, p3.start + 1.8);
  to("#punch", { y: -200, duration: 0.9, ease: "power2.inOut" }, p4.start + 0.3);
  fromTo("#bHole", { opacity: 0 }, { opacity: 1, duration: 0.3 }, p4.start + 0.4);
  fromTo("#sample", { opacity: 0, x: -50, y: -110 }, { opacity: 1, x: -50, y: -210, duration: 0.9, ease: "power2.inOut" }, p4.start + 0.4);
  sfx("click1", p4.start + 0.4, 0.3);
  // la mostra va al recipient de laboratori
  fadeIn("#vial", p4.start + 0.2, 0.7);
  to("#punch", { opacity: 0, duration: 0.5 }, p4.start + 1.5);
  to("#sample", { x: 560, y: -340, duration: 1.1, ease: "power2.inOut" }, p4.start + 1.5);
  to("#sample", { x: 560, y: 70, duration: 0.8, ease: "power2.in" }, p4.start + 2.7);
  fromTo(["#bub1", "#bub2"], { opacity: 0, y: 0 }, { opacity: 1, y: -100, duration: 1.1, ease: "power1.out" }, p4.start + 3.4);
  sfx("pop1", p4.start + 3.45, 0.3);
  fromTo("#lid", { y: -120, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)" }, p4.start + 4.2);
  set("#lid", { y: -120 }, 0);
  sfx("click1", p4.start + 4.75, 0.3);
}

// ═════ 3 · laboratori ═════
{
  const p5 = PH.f5;
  cam(p5.start - TRAVEL, S[3].x, S[3].y, 1);
  fadeIn("#scope", p5.start - 0.5, 0.9);
  fromTo("#vial3", { opacity: 0, x: -200 }, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }, p5.start - 0.2);
  // de la mostra al portaobjectes, i a sota del microscopi
  fromTo("#slide", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, p5.start + 1.0);
  to("#slide", { x: 480, y: -10, duration: 1.3, ease: "power2.inOut" }, p5.start + 2.0);
  fromTo("#beam", { opacity: 0 }, { opacity: 0.8, duration: 0.5 }, p5.start + 3.4);
  sfx("click1", p5.start + 3.4, 0.25);
}

// ═════ 4 · camp microscòpic ═════
{
  const p6 = PH.f6;
  // zoom progressiu cap a la mostra i, a través seu, al camp microscòpic
  const s3 = S[3];
  cam(p6.start - TRAVEL - 0.6, s3.x - 80 + 20, s3.y + VY + 40 - 30, 5.5, 1.0, "power3.in");
  cam(p6.start - TRAVEL + 0.4, S[4].x, S[4].y + VY, 1.0, 1.6, "power3.out", { blur: true });
  fromTo("#fA", { opacity: 0, scale: 0.7, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 1.4, ease: "power3.out" }, p6.start - 1.0);
  // les capes s'il·luminen de baix a dalt (organització)
  fromTo("#fA g[id^=fAc]", { opacity: 0.25 }, { opacity: 1, duration: 0.5, stagger: { each: 0.02, from: "end" } }, p6.start + 0.6);
  cam(p6.start + 2.6, S[4].x, S[4].y + VY + 120, 1.45, 3.5, "sine.inOut");
}

// ═════ 5 · normal vs alterat ═════
{
  const p7 = PH.f7, p8 = PH.f8;
  cam(p7.start - TRAVEL, S[5].x, S[5].y, 1);
  fromTo("#fN", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1.0, ease: "power3.out" }, p7.start - 0.4);
  fromTo("#fX", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1.0, ease: "power3.out" }, p7.start - 0.1);
  hl5.forEach((_, i) => {
    fromTo(`#hl5_${i}`, { opacity: 0, scale: 1.5, transformOrigin: "50% 50%" }, { opacity: 0.9, scale: 1, duration: 0.6, ease: "power3.out" }, p7.start + 2.2 + i * 0.7);
    sfx("pop2", p7.start + 2.25 + i * 0.7, 0.18);
  });
  fromTo("#hl5_0", { rotation: 0 }, { rotation: 60, duration: p8.end - p7.start, ease: "none", transformOrigin: "50% 50%" }, p7.start + 2.8);
  // f8: comparació (els dos camps s'alternen el focus)
  to("#fX", { opacity: 0.45, duration: 0.6 }, p8.start + 0.4);
  to("#fX", { opacity: 1, duration: 0.6 }, p8.start + 2.4);
  to("#fN", { opacity: 0.45, duration: 0.6 }, p8.start + 2.4);
  to("#fN", { opacity: 1, duration: 0.6 }, p8.end - 0.8);
}

// ═════ 6 · divisió controlada ═════
{
  const p9 = PH.f9;
  hl5.forEach((_, i) => to(`#hl5_${i}`, { opacity: 0, duration: 0.4 }, p9.start - 0.2));
  to("#fX", { opacity: 0.2, duration: 0.8 }, p9.start);
  cam(p9.start, S[5].x - 420, S[5].y + VY + 40, 1.5, 1.4, "power2.inOut");
  fadeIn("#mitosis", p9.start + 0.8, 0.5);
  // una cèl·lula es divideix en dues, ordenadament
  fromTo("#mitA", { x: 0, scaleX: 1 }, { x: -40, scaleX: 0.9, duration: 1.4, ease: "power2.inOut" }, p9.start + 1.6);
  fromTo("#mitB", { x: 0, scaleX: 1 }, { x: 40, scaleX: 0.9, duration: 1.4, ease: "power2.inOut" }, p9.start + 1.6);
  to(["#mitA", "#mitB"], { scaleX: 1, duration: 0.6 }, p9.start + 3.0);
  sfx("pop1", p9.start + 3.0, 0.2);
  to("#mitosis", { opacity: 0, duration: 0.6 }, p9.end - 0.4);
}

// ═════ 7 · neoplàsia ═════
{
  const p10 = PH.f10;
  cam(p10.start - TRAVEL, S[7].x, S[7].y, 1);
  // multiplicació descontrolada: cada vegada en surten més i més de pressa
  neo.forEach((c, i) => {
    const t = p10.start + 0.6 + Math.sqrt(i / neo.length) * 5.5;
    fromTo(`#neo${i}`, { opacity: 0, scale: 0.2, svgOrigin: `${r2(c.x)} ${r2(c.y)}` }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, t);
  });
  [0, 1.6, 3.0, 4.2, 5.2].forEach((d) => sfx("pop2", p10.start + 0.6 + d, 0.15));
  fromTo("#neoHalo", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 5.5, ease: "power1.in" }, p10.start + 0.8);
  fromTo("#neoOutline", { opacity: 0 }, { opacity: 1, duration: 0.8 }, p10.start + 6.6);
  cam(p10.start + 1.0, S[7].x, S[7].y + 20, 1.18, 6, "sine.inOut");
}

// ═════ 8/9 · benigna i maligna ═════
{
  const p11 = PH.f11, p12 = PH.f12, p13 = PH.f13;
  cam(p11.start - TRAVEL, S[8].x, S[8].y, 1);
  fromTo("#benign", { opacity: 0, scale: 0.5, svgOrigin: "0 0" }, { opacity: 1, scale: 0.8, duration: 0.9, ease: "power3.out" }, p11.start + 0.2);
  fromTo("#malig", { opacity: 0, scale: 0.5, svgOrigin: "0 0" }, { opacity: 1, scale: 0.8, duration: 0.9, ease: "power3.out" }, p11.start + 0.5);
  sfx("pop1", p11.start + 0.3, 0.2);
  sfx("pop2", p11.start + 0.6, 0.2);
  // benigna: creix una mica i s'atura dins la càpsula
  to("#malig", { opacity: 0.25, duration: 0.6 }, p12.start);
  to("#benign", { scale: 1, duration: 2.2, ease: "power2.out" }, p12.start + 0.4);
  to("#capsule", { attr: { "stroke-dasharray": "100 0" }, duration: 1.6, ease: "power2.inOut" }, p12.start + 1.4);
  fromTo("#capsule", { scale: 1.03 }, { scale: 1, duration: 0.3, yoyo: true, repeat: 3 }, p12.start + 3.2);
  // maligna: envaeix el voltant i passa a la sang i a la limfa
  to("#benign", { opacity: 0.3, duration: 0.6 }, p13.start);
  to("#malig", { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, p13.start + 0.2);
  [0, 1, 2, 3, 4].forEach((i) => to(`#tend${i}`, { attr: { "stroke-dasharray": "100 0" }, duration: 1.6, ease: "power2.out" }, p13.start + 1.2 + i * 0.35));
  fromTo("#metB", { opacity: 0 }, { opacity: 1, duration: 0.3 }, p13.start + 4.4);
  fromTo("#metB", { x: 40, y: 230 }, { x: 560, y: 220, duration: 3.6, ease: "power1.in" }, p13.start + 4.4);
  fromTo("#metL", { opacity: 0 }, { opacity: 1, duration: 0.3 }, p13.start + 5.4);
  fromTo("#metL", { x: 20, y: -250 }, { x: 560, y: -240, duration: 3.4, ease: "power1.in" }, p13.start + 5.4);
  to(["#metB", "#metL"], { opacity: 0, duration: 0.4 }, p13.end - 0.6);
  sfx("whoosh3", p13.start + 6.5, 0.15);
  cam(p13.start + 0.2, S[8].x + 260, S[8].y + VY / 2, 1.1, 2.0, "power2.inOut");
}

// ═════ 10 · la biòpsia permet detectar ═════
{
  const p14 = PH.f14;
  cam(p14.start - TRAVEL, S[10].x, S[10].y, 1);
  fadeIn("#slide10", p14.start - 0.3, 0.8);
  fadeIn("#fZ", p14.start + 0.4, 1.0);
  fadeIn("#reticle", p14.start + 1.4, 0.5);
  hl10.forEach((c, i) => {
    const t = p14.start + 2.2 + i * 1.5;
    to("#reticle", { x: r2(c.wx - (S[10].x - 250)), y: r2(c.wy - (S[10].y + VY)), duration: 0.9, ease: "power2.inOut" }, t);
    fromTo(`#hl10_${i}`, { opacity: 0, scale: 1.5, transformOrigin: "50% 50%" }, { opacity: 0.9, scale: 1, duration: 0.5, ease: "power3.out" }, t + 0.8);
    sfx("pop2", t + 0.85, 0.18);
  });
}

// ═════ 11 · cicle final ═════
{
  const p15 = PH.f15;
  cam(p15.start - TRAVEL, S[11].x, S[11].y, 1);
  fadeIn("#cy1", p15.start + 0.2, 0.8);
  draw("#tg11Out", p15.start + 0.2, 1.2);
  fadeIn("#arr1", p15.start + 1.8, 0.5);
  fadeIn("#cy2", p15.start + 2.2, 0.6);
  fromTo("#cyArc", { attr: { "stroke-dasharray": "0 100" } }, { attr: { "stroke-dasharray": "100 0" }, duration: 2.4, ease: "none" }, p15.start + 2.6);
  fromTo("#les11", { scale: 1 }, { scale: 1.2, duration: 0.5, yoyo: true, repeat: 3, svgOrigin: "0 0" }, p15.start + 3.0);
  fadeIn("#arr2", p15.start + 5.2, 0.5);
  fadeIn("#cy3", p15.start + 5.6, 0.8);
  fromTo("#beam11", { opacity: 0 }, { opacity: 0.8, duration: 0.5 }, p15.start + 6.6);
  sfx("pop1", p15.start + 6.6, 0.2);
  cam(p15.start + 0.4, S[11].x, S[11].y + 20, 1.06, p15.end - p15.start + 1.6, "sine.inOut");
}

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

const bgDots = `<svg class="layer" style="left:-3000px;top:-2000px" width="28000" height="4000" viewBox="-3000 -2000 28000 4000">
  <defs><pattern id="gDots" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="32" cy="32" r="2.4" fill="${C.grid}"/></pattern></defs>
  <rect x="-3000" y="-2000" width="28000" height="4000" fill="url(#gDots)"/></svg>`;

fs.writeFileSync(path.join(ROOT, "compositions/world.html"), `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="world" data-width="${W}" data-height="${H}">
    <div id="bgGlow"></div>
    <div id="cam"><div id="zoom">
      <div id="bgpan">${bgDots}</div>
      <div id="pan">${WSVG}</div>
    </div></div>
    <div id="scrim"></div>
    <div id="txt">${txtHTML}</div>
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
console.log(PHRASES.map((p) => `${p.id} ${p.start}-${p.end}`).join(" | "));
