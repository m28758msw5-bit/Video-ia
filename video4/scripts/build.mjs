// Generador del vídeo «Trucs per entendre el llenguatge científic» (terminologia clínica).
// 1920×1080, fons verd menta #DDF7DE (el del vídeo de l'usuària), molt visual i amb poc text.
// Les paraules es construeixen amb blocs: prefix (lila), arrel (blau), sufix (taronja).
// Àudio: la veu de l'usuària + efectes de so (Mixkit) a cada acció (scripts/mix.mjs).
//
//   node scripts/build.mjs             vídeo sencer
//   node scripts/build.mjs --until 30  només fins al segon 30

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const UNTIL = args.includes("--until") ? parseFloat(args[args.indexOf("--until") + 1]) : null;
const W_ = 1920, H_ = 1080;
const DUR = +(UNTIL ?? 144).toFixed(3);
const r2 = (v) => Math.round(v * 100) / 100;
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ───────────────────────── temps de la veu ─────────────────────────
const words = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/transcript.json"), "utf8"));
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
/** Quan es diu la n-èsima vegada `word` (també dins de «amb-itis», «l'arrel»…). */
function P(word, n = 1) {
  const k = norm(word);
  let c = 0;
  for (const w of words) {
    const parts = [w.text, ...w.text.split(/[-'’]/)].map(norm);
    if (parts.includes(k) && ++c === n) return w.start;
  }
  throw new Error(`P(${word},${n})`);
}

const C = {
  bg: "#DDF7DE", ink: "#064E3B", ink2: "#166534",
  pre: "#7C3AED", root: "#2563EB", suf: "#EA580C", red: "#E11D48", green: "#16A34A",
};
const icon = (name, size, color, x = 0, y = 0) =>
  fs.readFileSync(path.join(ROOT, "assets/icons", `${name}.svg`), "utf8").replace("<svg ", `<svg x="${x}" y="${y}" width="${size}" height="${size}" style="color:${color}" `);

// ───────────────────────── il·lustracions ─────────────────────────
const DEFS = `<defs>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#064E3B" flood-opacity="0.18"/></filter>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="gEnamel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#F3EEDF"/><stop offset="1" stop-color="#D8CFB8"/></linearGradient>
  <linearGradient id="gGum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4A7B4"/><stop offset="1" stop-color="#DB6F84"/></linearGradient>
  <linearGradient id="gGumRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F43F5E"/><stop offset="1" stop-color="#BE123C"/></linearGradient>
  <radialGradient id="gTongue" cx="0.45" cy="0.35" r="0.75"><stop offset="0" stop-color="#F3A2AD"/><stop offset="1" stop-color="#C45467"/></radialGradient>
  <radialGradient id="gTongueRed" cx="0.45" cy="0.35" r="0.75"><stop offset="0" stop-color="#FB7185"/><stop offset="1" stop-color="#B91C1C"/></radialGradient>
  <radialGradient id="gHeart" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#F87171"/><stop offset="1" stop-color="#991B1B"/></radialGradient>
  <radialGradient id="gLiver" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#B45309"/><stop offset="1" stop-color="#7C2D12"/></radialGradient>
  <radialGradient id="gDrop" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#BAE6FD"/><stop offset="1" stop-color="#0284C7"/></radialGradient>
  <linearGradient id="gFolder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCD34D"/><stop offset="1" stop-color="#F59E0B"/></linearGradient>
  <linearGradient id="gVessel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F87171"/><stop offset="0.5" stop-color="#FECACA"/><stop offset="1" stop-color="#DC2626"/></linearGradient>
  <linearGradient id="gTube" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9A8D4"/><stop offset="0.5" stop-color="#FCE7F3"/><stop offset="1" stop-color="#EC4899"/></linearGradient>
  <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#64748B"/><stop offset="0.45" stop-color="#F1F5F9"/><stop offset="1" stop-color="#475569"/></linearGradient>
  <radialGradient id="gBrain" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#FBCFE8"/><stop offset="1" stop-color="#DB2777"/></radialGradient>
  <linearGradient id="gSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9BC"/><stop offset="1" stop-color="#E9AE86"/></linearGradient>
</defs>`;

const TONGUE = "M-235 40 C-245 -80 -120 -128 0 -128 C120 -128 245 -80 235 40 C225 165 120 255 0 255 C-120 255 -225 165 -235 40Z";
const art = {
  tooth: () => `<path d="M-70 -60 Q-80 -110 -40 -116 Q-10 -120 0 -100 Q10 -120 40 -116 Q80 -110 70 -60 Q66 -10 50 10 L40 100 Q34 120 22 100 L10 30 Q0 20 -10 30 L-22 100 Q-34 120 -40 100 L-50 10 Q-66 -10 -70 -60Z" fill="url(#gEnamel)" stroke="#CBBF9F" stroke-width="4"/>`,
  gum: (id) => `<g><path id="${id}" d="M-150 10 Q-110 -30 -75 10 Q-38 -30 0 10 Q38 -30 75 10 Q110 -30 150 10 V80 H-150Z" fill="url(#gGum)"/>
    ${[-112, -38, 38, 112].map((x) => `<rect x="${x - 32}" y="-90" width="64" height="92" rx="24" fill="url(#gEnamel)" stroke="#D9D3C2" stroke-width="3"/>`).join("")}
    <path d="M-150 10 Q-110 -30 -75 10 Q-38 -30 0 10 Q38 -30 75 10 Q110 -30 150 10" fill="none" stroke="#fff" stroke-width="4" opacity="0.4"/></g>`,
  tongue: (id) => `<g transform="scale(0.5)"><path id="${id}" d="${TONGUE}" fill="url(#gTongue)"/><path d="M0 -100 Q8 60 0 190" stroke="#9F1239" stroke-width="12" fill="none" opacity="0.4"/></g>`,
  mouth: () => `<path d="M-120 0 Q0 -70 120 0 Q0 90 -120 0Z" fill="#E36B7E"/><path d="M-96 2 Q0 -40 96 2 Q0 60 -96 2Z" fill="#5B1726"/>
    <path d="M-80 -6 H80" stroke="#fff" stroke-width="16" stroke-linecap="round"/><ellipse cx="0" cy="30" rx="50" ry="16" fill="#F3A2AD"/>`,
  drop: () => `<path d="M0 -110 Q70 -10 70 40 Q70 110 0 110 Q-70 110 -70 40 Q-70 -10 0 -110Z" fill="url(#gDrop)"/><ellipse cx="-24" cy="30" rx="14" ry="26" fill="#fff" opacity="0.6"/>`,
  heart: () => `<path d="M0 100 Q-120 20 -110 -50 Q-100 -110 -40 -110 Q-10 -110 0 -70 Q10 -110 40 -110 Q100 -110 110 -50 Q120 20 0 100Z" fill="url(#gHeart)"/>
    <path d="M-20 -110 V-150 M24 -106 Q30 -150 60 -160" stroke="#B91C1C" stroke-width="22" stroke-linecap="round" fill="none"/>`,
  liver: () => `<path d="M-140 -30 Q-120 -100 -20 -96 Q90 -94 140 -60 Q160 -30 120 10 Q40 80 -60 70 Q-130 60 -140 -30Z" fill="url(#gLiver)"/>
    <path d="M-10 -96 Q0 0 -40 66" stroke="#451A03" stroke-width="5" fill="none" opacity="0.5"/>`,
};

// Persones senzilles (dentista i pacient).
const person = (id, coat, hair, mask) => `<g id="${id}">
  <path d="M-110 260 Q-110 100 0 100 Q110 100 110 260Z" fill="${coat}"/>
  <circle cy="0" r="92" fill="url(#gSkin)"/>
  <path d="M-92 -10 Q-96 -100 0 -104 Q96 -100 92 -10 Q60 -60 0 -62 Q-60 -60 -92 -10Z" fill="${hair}"/>
  <circle cx="-32" cy="0" r="10" fill="#1F2937"/><circle cx="32" cy="0" r="10" fill="#1F2937"/>
  ${mask ? `<path d="M-70 26 Q0 16 70 26 L62 70 Q0 92 -62 70Z" fill="#5EEAD4"/>` : `<path d="M-26 46 Q0 34 26 46" stroke="#9A3412" stroke-width="7" fill="none" stroke-linecap="round"/>`}
</g>`;

// Bloc de paraula (HTML al món). id, text, tipus (pre/root/suf), posició i mida.
const BLK = [];
const blk = (id, text, kind, x, y, size = 72) => {
  BLK.push(`<div class="anc" style="left:${x}px;top:${y}px"><div class="ctr"><div class="blk ${kind}" id="${id}" style="font-size:${size}px">${text}</div></div></div>`);
};
// Etiqueta (text clau sense bloc).
const lbl = (id, text, x, y, size = 64, color = C.ink) => {
  BLK.push(`<div class="anc" style="left:${x}px;top:${y}px"><div class="ctr"><div class="lbl" id="${id}" style="font-size:${size}px;color:${color}">${text}</div></div></div>`);
};

const SX = (i) => (i - 1) * 3200; // centre de cada escena
const ROOTS = [
  { k: "odonto", label: "ODONT(O)", mean: "dent", art: "tooth", w: "odonto", m: "dent" },
  { k: "gingiv", label: "GINGIV", mean: "geniva", art: "gum", w: "gingi", m: "geniva" },
  { k: "gloss", label: "GLOSS", mean: "llengua", art: "tongue", w: "glos", m: "llengua" },
  { k: "estomat", label: "ESTOMAT", mean: "boca", art: "mouth", w: "estomat", m: "boca" },
  { k: "sial", label: "SIAL", mean: "saliva", art: "drop", w: "sial", m: "saliva" },
  { k: "cardi", label: "CARDI(O)", mean: "cor", art: "heart", w: "cardio", m: "cor" },
  { k: "hepat", label: "HEPAT(O)", mean: "fetge", art: "liver", w: "hepato", m: "fetge" },
];
const rootPos = (i) => ({ x: SX(5) - 720 + (i % 4) * 480 + (i >= 4 ? 240 : 0), y: i < 4 ? -170 : 250 });

function world() {
  const R = rng(9);
  // Escena 7: partícules de glucosa al vas.
  const glu = Array.from({ length: 40 }, (_, i) => ({ id: `glu${i}`, x: -560 + R() * 1120, y: -40 + R() * 80 }));
  const svg = `<svg class="layer" style="left:-2000px;top:-1500px" width="42000" height="3000" viewBox="-2000 -1500 42000 3000">
  ${DEFS}
  <!-- 1 · cas resolt -->
  <g transform="translate(${SX(1)},40)" filter="url(#shadow)">
    <path d="M-330 -200 H-110 L-80 -240 H120 L150 -200 H330 V230 H-330Z" fill="url(#gFolder)"/>
    <rect x="-300" y="-170" width="600" height="380" rx="10" fill="#FFFBEB"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="-250" y="${-120 + i * 60}" width="${i % 2 ? 380 : 480}" height="18" rx="9" fill="#E7E5E4"/>`).join("")}
  </g>
  <g transform="translate(${SX(1) + 470},-280)"><g id="bulb" opacity="0">${icon("lightbulb", 220, "#F59E0B", -110, -110)}</g></g>

  <!-- 2–3 · dentista, pacient i cadenat -->
  <g transform="translate(${SX(2) - 500},60)" filter="url(#shadow)">${person("dent", "#FFFFFF", "#1F2937", true)}</g>
  <g transform="translate(${SX(2) + 500},80)" filter="url(#shadow)">${person("pat", "#F97316", "#7C2D12", false)}</g>
  ${[[430, -200], [560, -260], [650, -170]].map(([x, y], i) => `<g transform="translate(${SX(2) + x},${y})"><g id="q${i}" opacity="0">${icon("question", 110, C.red, -55, -55)}</g></g>`).join("")}
  <g transform="translate(${SX(2) - 60},-250)"><g id="bubble" opacity="0">
    <path d="M-330 -110 H330 Q370 -110 370 -70 V70 Q370 110 330 110 H-200 L-300 190 L-260 110 H-330 Q-370 110 -370 70 V-70 Q-370 -110 -330 -110Z" fill="#fff" filter="url(#shadow)"/>
    ${["PERIODONTITIS", "SIALOMETRIA", "GLOSSITIS"].map((w, i) => `<text id="bw${i}" x="${-290 + i * 50}" y="${-42 + i * 62}" font-family="Archivo Black, Inter" font-size="46" fill="${[C.pre, C.root, C.suf][i]}" opacity="0" transform="rotate(${[-4, 3, -2][i]})">${w}</text>`).join("")}</g></g>
  <g transform="translate(${SX(2) + 60},-60)"><g id="lock" opacity="0">${icon("lock-simple", 300, C.ink, -150, -150)}</g><g id="lockOpen" opacity="0">${icon("lock-simple-open", 300, C.green, -150, -150)}</g></g>

  <!-- 4 · grec i llatí -->
  <g transform="translate(${SX(4) - 640},-200)"><g id="greek" opacity="0" filter="url(#shadow)">
    <rect x="-130" y="-150" width="260" height="40" rx="6" fill="#F5F5F4"/><path d="M-150 -110 H150 L130 -90 H-130Z" fill="#E7E5E4"/>
    ${[-90, -30, 30, 90].map((x) => `<rect x="${x - 20}" y="-90" width="40" height="220" fill="#FAFAF9" stroke="#D6D3D1" stroke-width="3"/>`).join("")}
    <rect x="-150" y="130" width="300" height="34" rx="6" fill="#E7E5E4"/></g></g>
  <g transform="translate(${SX(4) + 640},-200)"><g id="latin" opacity="0" filter="url(#shadow)">
    <rect x="-150" y="-120" width="300" height="250" rx="10" fill="#FEF3C7"/>
    <ellipse cx="-150" cy="5" rx="26" ry="128" fill="#FDE68A"/><ellipse cx="150" cy="5" rx="26" ry="128" fill="#FDE68A"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="-100" y="${-80 + i * 50}" width="${i % 2 ? 150 : 200}" height="14" rx="7" fill="#D97706" opacity="0.5"/>`).join("")}</g></g>
  ${[["sufFlame", "flame", -120], ["sufVirus", "virus", 0], ["sufCut", "scissors", 120]].map(([id, n, dx]) => `<g transform="translate(${SX(4) + 470 + dx},330)"><g id="${id}" opacity="0">${icon(n, 100, C.suf, -50, -50)}</g></g>`).join("")}
  <g transform="translate(${SX(4)},330)"><g id="rootTarget" opacity="0">${icon("crosshair", 100, C.root, -50, -50)}</g></g>
  <g transform="translate(${SX(4) - 470},330)"><g id="preMod" opacity="0">${icon("arrows-clockwise", 100, C.pre, -50, -50)}</g></g>

  <!-- 5 · arrels -->
  ${ROOTS.map((r, i) => { const p = rootPos(i); return `<g transform="translate(${p.x},${p.y - 40})"><g id="card${i}" opacity="0">
    <rect x="-210" y="-170" width="420" height="380" rx="36" fill="#fff" filter="url(#shadow)"/>
    <g transform="translate(0,-40)">${r.art === "gum" ? art.gum(`gum5`) : r.art === "tongue" ? art.tongue(`tg5`) : art[r.art]()}</g></g></g>`; }).join("")}

  <!-- 6 · -itis -->
  <g transform="translate(${SX(6) + 420},-150)"><g id="flame6" opacity="0" filter="url(#glow)">${icon("flame", 200, C.suf, -100, -100)}</g></g>
  <g transform="translate(${SX(6) - 420},-110) scale(1.4)"><g id="gum6" opacity="0">${art.gum("gum6Path")}</g></g>
  <g transform="translate(${SX(6) - 420},-110) scale(1.4)"><g id="tg6" opacity="0">${art.tongue("tg6Path")}</g></g>

  <!-- 7 · hipo / hiper -->
  <g transform="translate(${SX(7)},0)">
    <rect x="-640" y="-70" width="1280" height="140" rx="70" fill="url(#gVessel)" opacity="0.9"/>
    ${glu.map((g, i) => `<g transform="translate(${r2(g.x)},${r2(g.y)})"><g id="${g.id}" opacity="0"><path d="M0 -16 L14 -8 V8 L0 16 L-14 8 V-8Z" fill="#FDE047" stroke="#CA8A04" stroke-width="3"/></g></g>`).join("")}
    <g transform="translate(0,-330)"><g id="gauge" opacity="0">
      <path d="M-160 0 A160 160 0 0 1 160 0" fill="none" stroke="#E5E7EB" stroke-width="34"/>
      <path d="M-160 0 A160 160 0 0 1 -80 -138" fill="none" stroke="#38BDF8" stroke-width="34"/>
      <path d="M80 -138 A160 160 0 0 1 160 0" fill="none" stroke="${C.red}" stroke-width="34"/>
      <g id="needle"><path d="M0 0 L0 -140" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/><circle r="18" fill="${C.ink}"/></g></g></g>
  </g>

  <!-- 8 · -àlgia i -ectomia -->
  <g transform="translate(${SX(8) - 440},40)"><g id="nerve" opacity="0">
    <path d="M-300 0 C-150 -60 -60 60 60 0 S 220 -40 300 10 M60 0 L140 120 M-60 20 L-120 140 M180 -20 L240 -130" stroke="#FACC15" stroke-width="18" fill="none" stroke-linecap="round"/>
    ${[[-150, -40], [60, -10], [200, 60]].map(([x, y], i) => `<g transform="translate(${x},${y})"><g id="zap${i}" opacity="0">${icon("lightning", 110, C.red, -55, -55)}</g></g>`).join("")}</g></g>
  <g transform="translate(${SX(8) + 460},40)"><g id="organ" opacity="0">
    <path d="M-220 -40 Q-200 -140 -60 -120 Q60 -100 140 -40" stroke="#F9A8D4" stroke-width="80" fill="none" stroke-linecap="round"/>
    <g id="appx"><path d="M140 -40 Q210 10 200 110" stroke="#F472B6" stroke-width="44" fill="none" stroke-linecap="round"/></g>
    <g id="cut" opacity="0"><g transform="translate(150,-10) rotate(30)">${icon("scissors", 160, "#334155", -80, -80)}</g></g></g></g>

  <!-- 9 · -scòpia i -metria -->
  <g transform="translate(${SX(9) - 440},40)"><g id="scope" opacity="0">
    <path d="M-300 -60 Q-100 -120 100 -40 Q260 20 300 140" stroke="url(#gTube)" stroke-width="130" fill="none" stroke-linecap="round"/>
    <g id="cam9"><path d="M-460 -40 H-290" stroke="#1F2937" stroke-width="22" stroke-linecap="round"/><circle cx="-280" cy="-40" r="22" fill="#38BDF8" filter="url(#glow)"/></g></g></g>
  <g transform="translate(${SX(9) + 470},60)"><g id="cyl" opacity="0">
    <rect x="-90" y="-220" width="180" height="420" rx="20" fill="#F0F9FF" stroke="#94A3B8" stroke-width="6"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M-90 ${160 - i * 45} H-50" stroke="#64748B" stroke-width="5"/>`).join("")}
    <clipPath id="cylClip"><rect x="-84" y="-214" width="168" height="408" rx="16"/></clipPath>
    <g clip-path="url(#cylClip)"><rect id="liq" x="-84" y="200" width="168" height="420" fill="url(#gDrop)" opacity="0.8"/></g>
    ${[0, 1, 2].map((i) => `<g transform="translate(0,-320)"><g id="dr${i}" opacity="0"><g transform="scale(0.28)">${art.drop()}</g></g></g>`).join("")}</g></g>

  <!-- 10 · cervell i trencaclosques -->
  <g transform="translate(${SX(10)},40)"><g id="brain" opacity="0">
    <path d="M-260 40 Q-300 -120 -150 -170 Q-80 -260 40 -210 Q180 -250 250 -120 Q320 0 230 90 Q150 170 0 150 Q-150 170 -230 110Z" fill="url(#gBrain)"/>
    <path d="M-160 -100 Q-100 -40 -150 30 M-40 -180 Q0 -100 -40 -20 Q-10 60 40 90 M100 -160 Q80 -80 140 -20 Q200 30 160 100" stroke="#9D174D" stroke-width="8" fill="none" opacity="0.5"/>
    ${[["pz0", -120, -20, C.pre], ["pz1", 20, -60, C.root], ["pz2", 150, 10, C.suf]].map(([id, x, y, c]) => `<g transform="translate(${x},${y})"><g id="${id}" opacity="0"><path d="M-50 -50 H-10 Q-10 -70 10 -70 Q30 -70 30 -50 H50 V-10 Q70 -10 70 10 Q70 30 50 30 V50 H-50Z" fill="${c}" stroke="#fff" stroke-width="5"/></g></g>`).join("")}
    <g transform="translate(330,-230)"><g id="bulb10" opacity="0">${icon("lightbulb", 200, "#F59E0B", -100, -100)}</g></g></g></g>

  <!-- 11 · comprova el significat -->
  <g transform="translate(${SX(11) - 300},40)"><g id="book" opacity="0">${icon("book-open-text", 380, C.ink2, -190, -190)}
    <g transform="translate(150,-150)"><g id="bookOk" opacity="0">${icon("check-circle", 140, C.green, -70, -70)}</g></g></g></g>
  <g transform="translate(${SX(11) + 480},-40)"><g id="warn" opacity="0">${icon("warning", 150, "#F59E0B", -75, -75)}</g></g>

  <!-- 12 · periodontitis? -->
  <g transform="translate(${SX(12)},-250)"><g id="bigQ" opacity="0">${icon("question", 260, C.red, -130, -130)}</g></g>
  </svg>`;
  return { svg, glu };
}

const { svg: WSVG, glu } = world();

// Blocs i etiquetes (HTML al món).
blk("b1pre", "PREFIX", "pre", SX(4) - 470, 120, 70);
blk("b1root", "ARREL", "root", SX(4), 120, 70);
blk("b1suf", "SUFIX", "suf", SX(4) + 470, 120, 70);
lbl("lCas", "CAS RESOLT ✓", SX(1), 30, 110, C.green);
lbl("lDes", "DESXIFRAR", SX(2) + 60, 210, 100, C.ink);
ROOTS.forEach((r, i) => { const p = rootPos(i); blk(`rl${i}`, r.label, "root", p.x, p.y + 110, 52); lbl(`rm${i}`, r.mean, p.x, p.y + 190, 46, C.ink2); });
lbl("lArrels", "ARRELS", SX(5), -490, 90, C.root);
blk("b6itis", "-ITIS", "suf", SX(6) + 420, 120, 90);
lbl("l6inf", "inflamació", SX(6) + 420, 220, 52, C.ink2);
blk("b6ging", "GINGIV", "root", SX(6) - 420, 160, 84);
blk("b6glos", "GLOSS", "root", SX(6) - 420, 160, 84);
lbl("l6w1", "GINGIVITIS", SX(6), 380, 96, C.ink);
lbl("l6w2", "GLOSSITIS", SX(6), 380, 96, C.ink);
blk("b7hipo", "HIPO ↓", "pre", SX(7) - 420, 240, 84);
blk("b7hiper", "HIPER ↑", "pre", SX(7) + 420, 240, 84);
lbl("l7a", "HIPOGLUCÈMIA", SX(7), 390, 84, "#0284C7");
lbl("l7b", "HIPERGLUCÈMIA", SX(7), 390, 84, C.red);
blk("b8alg", "-ÀLGIA", "suf", SX(8) - 440, -330, 84);
lbl("l8neu", "NEURÀLGIA", SX(8) - 440, 330, 80, C.ink);
blk("b8ect", "-ECTOMIA", "suf", SX(8) + 460, -330, 84);
blk("b9sco", "-SCÒPIA", "suf", SX(9) - 440, -330, 84);
lbl("l9endo", "ENDOSCÒPIA", SX(9) - 440, 330, 80, C.ink);
blk("b9met", "-METRIA", "suf", SX(9) + 470, -330, 84);
lbl("l9sial", "SIALOMETRIA", SX(9) + 470, 340, 80, C.ink);
lbl("l11", "COMPROVA EL SIGNIFICAT", SX(11), -380, 90, C.ink);
blk("b12a", "PERI", "pre", SX(12) - 470, 60, 100);
blk("b12b", "ODONT", "root", SX(12) - 10, 60, 100);
blk("b12c", "ITIS", "suf", SX(12) + 420, 60, 100);
lbl("l12", "PERIODONTITIS?", SX(12), 300, 120, C.ink);

const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif}
#bgSoft{position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 45%, #EEFDEF, ${C.bg} 70%)}
#punchz{position:absolute;left:${W_ / 2}px;top:${H_ / 2}px;width:0;height:0}
#cam,#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
.anc{position:absolute;width:0;height:0}
.ctr{position:absolute;left:0;top:0;transform:translate(-50%,-50%)}
.blk{font-family:"Archivo Black",Inter,sans-serif;color:#fff;padding:.18em .55em .1em;border-radius:.28em;white-space:nowrap;opacity:0;box-shadow:0 .14em 0 rgba(0,0,0,.22), 0 18px 34px rgba(6,78,59,.18)}
.blk.pre{background:${C.pre}}.blk.root{background:${C.root}}.blk.suf{background:${C.suf}}
.lbl{font-family:"Archivo Black",Inter,sans-serif;white-space:nowrap;opacity:0;letter-spacing:.01em}
`;

// ───────────────────────── línia de temps ─────────────────────────
const T = [], SFX = [];
const sfx = (file, t, vol = 0.4) => SFX.push({ file, t: +Math.max(0, t).toFixed(3), vol });
const tw = (sel, from, vars, t) => { const o = { sel, from, vars, t }; T.push(o); return o; };
const to = (sel, vars, t) => tw(sel, null, vars, t);
const fromTo = (sel, a, b, t) => tw(sel, a, b, t);
const set = (sel, vars, t) => T.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r2(t)});`);
const raw = (s) => T.push(s);
let wk = 0, pk = 0;
const whoosh = () => ["whoosh1", "whoosh2", "whoosh3"][wk++ % 3];
const popS = () => ["pop1", "pop2"][pk++ % 2];
let lastCam = null, camX = 0;
function cam(t, x, y, s, dur = 1.0, ease = "power3.inOut") {
  if (lastCam && t < lastCam.t + lastCam.dur) lastCam.tw.forEach((o) => (o.vars.duration = r2(Math.max(0.15, t - lastCam.t))));
  const tws = [to("#zoom", { scale: s, duration: dur, ease }, t), to("#pan", { x: -x, y: -y, duration: dur, ease }, t), to("#bgpan", { x: -x * 0.5, y: -y * 0.5, duration: dur, ease }, t)];
  lastCam = { t, dur, tw: tws };
  if (Math.abs(x - camX) > 1500) {
    to("#zoom", { filter: "blur(10px)", duration: dur * 0.45, ease: "power2.in" }, t);
    to("#zoom", { filter: "blur(0px)", duration: dur * 0.5, ease: "power2.out" }, t + dur * 0.45);
    sfx(whoosh(), t + dur * 0.5, 0.32);
  }
  camX = x;
}
const punch = (t, s = 1.05) => { to("#punchz", { scale: s, duration: 0.14, ease: "power3.out" }, t); to("#punchz", { scale: 1, duration: 0.5, ease: "power2.inOut" }, t + 0.16); };
const pop = (sel, t, snd = true, extra = {}) => { fromTo(sel, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)", ...extra }, t); if (snd) sfx(popS(), t + 0.05, 0.3); };
const slam = (sel, t, snd = "impact") => { fromTo(sel, { opacity: 0, scale: 1.8, rotation: -4 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "power4.in" }, t); sfx(snd, t + 0.28, 0.4); punch(t + 0.3, 1.04); };
const out = (sel, t, d = 0.35) => to(sel, { opacity: 0, scale: 0.85, duration: d, ease: "power2.in" }, t);

raw(`gsap.set(["#bubble","#bulb","#q0","#q1","#q2","#lock","#lockOpen","#greek","#latin","#sufFlame","#sufVirus","#sufCut","#rootTarget","#preMod","#flame6","#gum6","#tg6","#gauge","#nerve","#organ","#appx","#cut","#scope","#cam9","#cyl","#brain","#pz0","#pz1","#pz2","#bulb10","#book","#bookOk","#warn","#bigQ","#needle","#dent","#pat"], {svgOrigin:"0 0"});`);
ROOTS.forEach((_, i) => raw(`gsap.set("#card${i}", {svgOrigin:"0 0"});`));
raw(`gsap.set("#needle", {rotation:0});`);

// ═════ 1 · cas resolt (0–5 s) ═════
set("#zoom", { scale: 1.3 }, 0); set("#pan", { x: -SX(1), y: 0 }, 0);
cam(0, SX(1), 0, 0.95, 1.4, "power3.out");
slam("#lCas", P("resolt") - 0.15);
pop("#bulb", P("trucs") - 0.05);
fromTo("#bulb", { rotation: -8 }, { rotation: 8, duration: 0.3, repeat: 3, yoyo: true }, P("trucs") + 0.4);

// ═════ 2–3 · dentista i paraules (5–13 s) ═════
cam(P("t'ha") - 0.3, SX(2), 0, 1, 1.0);
fromTo("#dent", { y: 0 }, { y: -10, duration: 0.18, repeat: 9, yoyo: true }, P("dentista"));
pop("#bubble", P("paraules") - 0.3);
[0, 1, 2].forEach((i) => fromTo(`#bw${i}`, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3 }, P("paraules") + i * 0.25));
out("#bubble", P("doncs") + 0.1);
[0, 1, 2].forEach((i) => pop(`#q${i}`, P("entès") + i * 0.35));
fromTo("#pat", { rotation: -4 }, { rotation: 4, duration: 0.25, repeat: 5, yoyo: true }, P("entès"));
// les paraules es tanquen en un cadenat i s'obre
[0, 1, 2].forEach((i) => to(`#q${i}`, { x: -420 + i * -80, y: 120, scale: 0.2, opacity: 0, duration: 0.5, ease: "power2.in" }, P("doncs") + i * 0.08));
pop("#lock", P("doncs") + 0.3);
to("#lock", { opacity: 0, duration: 0.15 }, P("desxifrar-les"));
pop("#lockOpen", P("desxifrar-les"), false);
sfx("click1", P("desxifrar-les") + 0.05, 0.5);
slam("#lDes", P("desxifrar-les") + 0.2, "pop2");

// ═════ 4 · grec, llatí i les tres parts (13–30 s) ═════
cam(P("molts") - 0.3, SX(4), 0, 0.95, 1.0);
pop("#greek", P("grec"));
pop("#latin", P("llatí"));
[["#b1pre", -300], ["#b1root", 0], ["#b1suf", 300]].forEach(([s, dx], i) => fromTo(s, { opacity: 0, x: dx, y: 120 }, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "back.out(1.6)" }, P("combinant") + i * 0.18));
[0, 1, 2].forEach((i) => sfx("click1", P("combinant") + 0.45 + i * 0.18, 0.35));
const glow = (sel, t) => { to(sel, { scale: 1.18, duration: 0.25, ease: "back.out(3)" }, t); to(sel, { scale: 1, duration: 0.4 }, t + 1.4); };
glow("#b1root", P("arrels")); pop("#rootTarget", P("indiquen"));
glow("#b1pre", P("prefixos")); pop("#preMod", P("modifiquen"));
fromTo("#preMod", { rotation: 0 }, { rotation: 360, duration: 1.2, ease: "power2.inOut" }, P("modifiquen") + 0.3);
glow("#b1suf", P("sufixos"));
pop("#sufFlame", P("inflamació")); pop("#sufVirus", P("malaltia")); pop("#sufCut", P("procediment"));

// ═════ 5 · arrels (31–54 s) ═════
cam(P("comencem") - 0.3, SX(5), 30, 0.8, 1.0);
slam("#lArrels", P("arrels", 2) - 0.1, "pop1");
ROOTS.forEach((r, i) => {
  const tR = P(r.w), tM = P(r.m);
  pop(`#card${i}`, tR - 0.1, true);
  fromTo(`#rl${i}`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(2)" }, tR);
  fromTo(`#rm${i}`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, tM);
  fromTo(`#card${i}`, { rotation: 0 }, { rotation: 3, duration: 0.15, yoyo: true, repeat: 1 }, tM);
});
// la càmera segueix les targetes
cam(P("odonto") - 0.3, SX(5) - 60, 0, 0.84, 6.0, "sine.inOut");
cam(P("sial") - 0.6, SX(5) + 60, 40, 0.84, 6.0, "sine.inOut");

// ═════ 6 · -itis (55–78 s) ═════
cam(P("ara") - 0.2, SX(6), 0, 0.95, 1.0);
const tItis = P("itis", 1);
fromTo("#b6itis", { opacity: 0, x: 300 }, { opacity: 1, x: 0, duration: 0.5, ease: "back.out(1.6)" }, tItis - 0.1);
sfx("click1", tItis + 0.3, 0.35);
pop("#flame6", P("inflamació", 2) - 0.1);
fromTo("#flame6", { scale: 1 }, { scale: 1.15, duration: 0.3, repeat: 5, yoyo: true }, P("inflamació", 2) + 0.4);
pop("#l6inf", P("inflamació", 2), false);
// GINGIV + ITIS
pop("#gum6", P("gingivitis") - 0.2);
fromTo("#b6ging", { opacity: 0, x: -200 }, { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.6)" }, P("gingivitis") - 0.1);
to("#b6ging", { x: 420 - 240, duration: 0.4, ease: "power3.in" }, P("gingivitis") + 0.6);
to("#b6itis", { x: 160, duration: 0.4, ease: "power3.in" }, P("gingivitis") + 0.6);
sfx("click1", P("gingivitis") + 1.0, 0.5);
punch(P("gingivitis") + 1.0, 1.04);
pop("#l6w1", P("gingivitis") + 1.0, false);
to("#gum6Path", { fill: "url(#gGumRed)", duration: 0.01 }, P("genives") - 0.05);
fromTo("#gum6", { scale: 1 }, { scale: 1.08, duration: 0.25, repeat: 5, yoyo: true }, P("genives"));
sfx("rub", P("genives"), 0.25);
// GLOSS + ITIS
out("#gum6", P("mateix") - 0.2); out("#b6ging", P("mateix") - 0.2); out("#l6w1", P("mateix") - 0.2);
to("#b6itis", { x: 0, duration: 0.4 }, P("mateix"));
pop("#tg6", P("glositis") - 0.3);
fromTo("#b6glos", { opacity: 0, x: -200 }, { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.6)" }, P("glositis") - 0.2);
to("#b6glos", { x: 420 - 240, duration: 0.4, ease: "power3.in" }, P("glositis") + 0.5);
to("#b6itis", { x: 160, duration: 0.4, ease: "power3.in" }, P("glositis") + 0.5);
sfx("click1", P("glositis") + 0.9, 0.5);
pop("#l6w2", P("glositis") + 0.9, false);
to("#tg6Path", { fill: "url(#gTongueRed)", duration: 0.01 }, P("llengua", 2) - 0.05);
fromTo("#tg6", { scale: 1 }, { scale: 1.08, duration: 0.25, repeat: 3, yoyo: true }, P("llengua", 2));

// ═════ 7 · hipo / hiper (78–96 s) ═════
cam(P("prefixos", 2) - 0.3, SX(7), 0, 0.95, 1.0);
pop("#b7hipo", P("hipo"));
fromTo("#b7hipo", { y: 0 }, { y: 24, duration: 0.3, repeat: 3, yoyo: true }, P("disminució"));
pop("#b7hiper", P("hiper"));
fromTo("#b7hiper", { y: 0 }, { y: -24, duration: 0.3, repeat: 3, yoyo: true }, P("augment"));
pop("#gauge", P("hipoglucèmia") - 0.3);
const fewG = glu.slice(0, 6);
fewG.forEach((g, i) => fromTo(`#${g.id}`, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3 }, P("hipoglucèmia") + i * 0.1));
to("#needle", { rotation: -60, duration: 0.8, ease: "back.out(1.4)" }, P("baixa") - 0.1);
pop("#l7a", P("hipoglucèmia"), false);
out("#l7a", P("hiperglucèmia") - 0.3);
glu.slice(6).forEach((g, i) => fromTo(`#${g.id}`, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.25 }, P("hiperglucèmia") + i * 0.04));
[0, 1, 2, 3].forEach((i) => sfx("pop2", P("hiperglucèmia") + i * 0.3, 0.15));
to("#needle", { rotation: 60, duration: 0.8, ease: "back.out(1.4)" }, P("elevada") - 0.2);
pop("#l7b", P("hiperglucèmia"), false);
glu.forEach((g, i) => fromTo(`#${g.id}`, { x: 0 }, { x: 40, duration: 1.6, repeat: 3, yoyo: true, ease: "sine.inOut" }, P("hipoglucèmia") + (i % 5) * 0.1));

// ═════ 8 · -àlgia i -ectomia (96–106 s) ═════
cam(P("altre") - 0.3, SX(8), 0, 0.95, 1.0);
pop("#b8alg", P("algia"));
pop("#nerve", P("algia") + 0.3, false);
[0, 1, 2].forEach((i) => { pop(`#zap${i}`, P("dolor") + i * 0.15); fromTo(`#zap${i}`, { scale: 1 }, { scale: 1.25, duration: 0.2, repeat: 5, yoyo: true }, P("dolor") + 0.5); });
pop("#l8neu", P("neuràlgia"), false);
pop("#b8ect", P("ectomia"));
pop("#organ", P("ectomia") + 0.3, false);
pop("#cut", P("extirpació") - 0.3);
sfx("click1", P("quirúrgica"), 0.5);
to("#appx", { x: 160, y: 140, rotation: 25, opacity: 0, duration: 0.9, ease: "power2.in" }, P("quirúrgica") + 0.1);
to("#cut", { opacity: 0, duration: 0.3 }, P("estructura") + 0.4);

// ═════ 9 · -scòpia i -metria (106–122 s) ═════
cam(P("procediments") - 0.6, SX(9), 0, 0.95, 1.0);
pop("#b9sco", P("escòpia"));
pop("#scope", P("escòpia") + 0.3, false);
fromTo("#cam9", { x: 0, y: 0 }, { x: 380, y: -20, duration: 2.5, ease: "power1.inOut" }, P("visual") - 0.6);
pop("#l9endo", P("endoscòpia"), false);
pop("#b9met", P("metria"));
pop("#cyl", P("metria") + 0.3, false);
[0, 1, 2].forEach((i) => {
  const t = P("sialometria") + i * 0.7;
  fromTo(`#dr${i}`, { opacity: 0, y: 0 }, { opacity: 1, y: 380, duration: 0.6, ease: "power2.in" }, t);
  to(`#dr${i}`, { opacity: 0, duration: 0.1 }, t + 0.6);
  sfx("pop1", t + 0.6, 0.2);
});
to("#liq", { y: -260, duration: 2.8, ease: "power1.inOut" }, P("sialometria") + 0.5);
pop("#l9sial", P("sialometria"), false);

// ═════ 10 · deduir (122–130 s) ═════
cam(P("tant") - 0.4, SX(10), 0, 0.95, 1.0);
pop("#brain", P("tant"));
[["#pz0", -260, 0], ["#pz1", 0, -260], ["#pz2", 260, 0]].forEach(([s, dx, dy], i) => {
  fromTo(s, { opacity: 0, x: dx, y: dy, rotation: 40 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.6, ease: "back.out(1.6)" }, P("identificar") + i * 0.35);
  sfx("click1", P("identificar") + 0.55 + i * 0.35, 0.4);
});
pop("#bulb10", P("deduir"));
fromTo("#bulb10", { scale: 1 }, { scale: 1.15, duration: 0.3, repeat: 5, yoyo: true }, P("deduir") + 0.4);

// ═════ 11 · comprova (130–138 s) ═════
cam(P("això", 2) - 0.4, SX(11), 0, 0.95, 1.0);
pop("#book", P("comprovar-ne") - 0.2);
slam("#l11", P("comprovar-ne"), "pop2");
pop("#bookOk", P("clínic"));
pop("#warn", P("normes") - 0.3);
fromTo("#warn", { rotation: -10 }, { rotation: 10, duration: 0.12, repeat: 5, yoyo: true }, P("normes"));

// ═════ 12 · periodontitis? (138–144 s) ═════
cam(P("bé") - 0.4, SX(12), 0, 0.95, 1.0);
[["#b12c", -380], ["#b12a", 0], ["#b12b", 380]].forEach(([s, dx], i) => fromTo(s, { opacity: 0, x: dx, y: -40 + i * 40 }, { opacity: 1, x: dx, y: -40 + i * 40, duration: 0.4, ease: "back.out(2)" }, P("sabries") + i * 0.2));
["#b12a", "#b12b", "#b12c"].forEach((s, i) => fromTo(s, { rotation: -4 }, { rotation: 4, duration: 0.15, repeat: 9, yoyo: true }, P("desxifrar") + i * 0.05));
// s'ordenen sols: PERI + ODONT + ITIS
["#b12a", "#b12b", "#b12c"].forEach((s) => to(s, { x: 0, y: 0, duration: 0.6, ease: "power3.inOut" }, P("periodontitis") - 0.4));
sfx("click1", P("periodontitis") + 0.2, 0.5);
pop("#bigQ", P("periodontitis"));
slam("#l12", P("periodontitis") + 0.2, "impact");

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
const bgDots = `<svg class="layer" style="left:-3000px;top:-2000px" width="44000" height="4000" viewBox="-3000 -2000 44000 4000">
  <defs><pattern id="gDots" width="64" height="64" patternUnits="userSpaceOnUse"><circle cx="32" cy="32" r="2.8" fill="#BFEBC4"/></pattern></defs>
  <rect x="-3000" y="-2000" width="44000" height="4000" fill="url(#gDots)"/></svg>`;
fs.writeFileSync(path.join(ROOT, "compositions/world.html"), `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="world" data-width="${W_}" data-height="${H_}">
    <div id="bgSoft"></div>
    <div id="punchz"><div id="cam"><div id="zoom">
      <div id="bgpan">${bgDots}</div>
      <div id="pan">${WSVG}${BLK.join("")}</div>
    </div></div></div>
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
