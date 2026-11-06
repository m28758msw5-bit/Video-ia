// Generador del vídeo «Nucli 8 · Recursos terapèutics: tractament de l'úlcera traumàtica».
// 1920×1080, fons clar, il·lustració realista. Sense veu, sense música, sense subtítols.
// Cada escena: primer la frase teòrica, després la targeta amb les paraules clau
// i l'exemple aplicat al cas, mentre a la dreta es veu l'acció.
//
//   node scripts/build.mjs             vídeo sencer
//   node scripts/build.mjs --until 15  només fins al segon 15

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
const icon = (name, size, color) =>
  fs.readFileSync(path.join(ROOT, "assets/icons", `${name}.svg`), "utf8").replace("<svg ", `<svg width="${size}" height="${size}" style="color:${color};display:block" `);

const C = {
  bg: "#F3F6FA", ink: "#0F172A", ink2: "#475569", line: "#E2E8F0",
  blue: "#2563EB", teal: "#0D9488", green: "#16A34A", amber: "#D97706", red: "#E11D48", violet: "#7C3AED",
};

// ───────────────────────── guió (la taula) ─────────────────────────
const S = [
  { id: 1, t: 0, end: 5 },
  { id: 2, t: 5, end: 14, theory: "Elimina o controla la causa de la malaltia.", title: "TRACTAMENT ETIOLÒGIC", sub: "Elimina la causa", ex: "polir la vora afilada de la dent.", color: C.blue },
  { id: 3, t: 14, end: 23, theory: "Alleuja els símptomes, però no elimina la causa.", title: "TRACTAMENT SIMPTOMÀTIC", sub: "Redueix les molèsties", ex: "ibuprofèn per alleujar el dolor i la inflamació, si està indicat.", color: C.violet },
  { id: 4, t: 23, end: 34, theory: "Ajuda a la recuperació i evita factors que poden empitjorar la lesió.", title: "MESURES NO FARMACOLÒGIQUES", sub: "Afavoreixen la recuperació", ex: "bona higiene i evitar aliments irritants.", color: C.teal },
  { id: 5, t: 34, end: 40, title: "EVITAR EL TABAC", sub: "Pot dificultar la cicatrització.", color: C.red },
  { id: 6, t: 40, end: 49, theory: "Comprova la resposta al tractament i permet detectar si cal modificar-lo.", title: "SEGUIMENT", sub: "Controlar l’evolució", ex: "visites de revisió per comprovar la cicatrització.", color: C.green },
  { id: 7, t: 49, end: 55 },
];
const DUR = +(UNTIL ?? 55).toFixed(3);
const SC = Object.fromEntries(S.map((s) => [s.id, s]));
const WX = (id) => (id - 1) * 3200; // centre de cada escena al món
const VX = 430; // les il·lustracions van a la meitat dreta (el text, a l'esquerra)

// ───────────────────────── art ─────────────────────────
const TONGUE = "M-235 40 C-245 -80 -120 -128 0 -128 C120 -128 245 -80 235 40 C225 165 120 255 0 255 C-120 255 -225 165 -235 40Z";
const LES = { x: 190, y: 100 };
function papillae(seed, n, w = 205, h = 175, cy = 55, avoid = { x: LES.x, y: LES.y, r: 60 }) {
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
// Úlcera: halo eritematós, fons fibrinós groguenc i vora vermella.
const ulcer = (id) => `<g transform="translate(${LES.x},${LES.y}) rotate(-58)"><g id="${id}">
  <ellipse id="${id}Halo" rx="58" ry="40" fill="#E0444F" opacity="0.45"/>
  <ellipse rx="40" ry="26" fill="#D23B4E"/>
  <ellipse rx="30" ry="18" fill="#F1E2C6"/>
  <ellipse cx="-4" cy="-3" rx="15" ry="8" fill="#FBF4E4"/>
</g></g>`;
const tongueReal = (id) => `<g id="${id}">
  <path d="${TONGUE}" fill="url(#gTongue)"/>
  <path d="${TONGUE}" fill="url(#gTongueShade)"/>
  <path d="M0 -100 Q8 60 0 190" stroke="#B94A5E" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.55"/>
  ${papillae(12, 220)}
  <ellipse cx="-80" cy="-40" rx="90" ry="40" fill="#fff" opacity="0.18" transform="rotate(-18 -80 -40)"/>
  ${ulcer(id + "U")}
</g>`;
const toothPaths = {
  sharp: "M-44 60 L-44 -10 L-34 -40 L-22 -14 L-10 -46 L2 -18 L14 -48 L26 -16 L38 -42 L44 -10 L44 60 Q0 74 -44 60Z",
  smooth: "M-44 60 L-44 -12 Q-42 -46 0 -48 Q42 -46 44 -12 L44 60 Q0 74 -44 60Z",
};
const tooth = (sharpId, smoothId) => `
  <path d="M-62 40 Q0 92 62 40 L62 112 H-62Z" fill="url(#gGum)"/>
  <path id="${sharpId}" d="${toothPaths.sharp}" fill="url(#gEnamel)" stroke="#CBBF9F" stroke-width="3"/>
  <path id="${smoothId}" d="${toothPaths.smooth}" fill="url(#gEnamel)" stroke="#CBBF9F" stroke-width="3" opacity="0"/>`;

// Turbina dental amb fresa de poliment.
const handpiece = () => `<g id="hp">
  <path d="M-16 -60 L16 -60 L22 -150 L-22 -150Z" fill="url(#gSteel)"/>
  <rect x="-40" y="-230" width="80" height="84" rx="30" fill="url(#gSteel)"/>
  <path d="M-30 -226 L-40 -620 Q-40 -650 -10 -650 H10 Q40 -650 40 -620 L30 -226Z" fill="url(#gSteel)"/>
  ${Array.from({ length: 6 }, (_, i) => `<rect x="-38" y="${-560 + i * 30}" width="76" height="8" rx="4" fill="#64748B" opacity="0.4"/>`).join("")}
  <rect x="-8" y="-62" width="16" height="40" rx="4" fill="#94A3B8"/>
  <g id="bur"><ellipse cx="0" cy="-14" rx="16" ry="20" fill="url(#gBur)"/>
    <path d="M-12 -24 L12 -4 M-14 -12 L8 6 M-8 -32 L14 -14" stroke="#fff" stroke-width="3" opacity="0.6"/></g>
</g>`;

// Comprimit i blíster d'ibuprofèn.
const blister = () => `<g id="blister">
  <rect x="-220" y="-130" width="440" height="260" rx="26" fill="url(#gFoil)" stroke="#CBD5E1" stroke-width="4"/>
  ${[[-130, -55], [0, -55], [130, -55], [-130, 55], [0, 55]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="52" ry="36" fill="#fff" opacity="0.6" stroke="#E2E8F0" stroke-width="3"/><ellipse cx="${x}" cy="${y}" rx="40" ry="26" fill="url(#gPill)"/><path d="M${x - 26} ${y} H${x + 26}" stroke="#E2E8F0" stroke-width="3"/>`).join("")}
  <ellipse cx="130" cy="55" rx="52" ry="36" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3"/>
</g>
<g id="pillOut" opacity="0"><ellipse rx="40" ry="26" fill="url(#gPill)" filter="url(#shadow)"/><path d="M-26 0 H26" stroke="#E2E8F0" stroke-width="3"/></g>`;

// Aliments irritants.
const chili = () => `<g id="chili">
  <path d="M-110 -10 Q-60 -70 40 -50 Q120 -36 150 30 Q110 6 50 10 Q-40 20 -110 -10Z" fill="url(#gChili)"/>
  <path d="M-100 -14 Q-40 -54 40 -40" stroke="#fff" stroke-width="6" fill="none" opacity="0.35" stroke-linecap="round"/>
  <path d="M-110 -10 Q-140 -20 -150 -50 Q-160 -70 -136 -76" stroke="#15803D" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M-118 -12 Q-104 -36 -86 -26 Q-94 -6 -118 -12Z" fill="#16A34A"/>
</g>`;
const lemon = () => `<g id="lemon">
  <circle r="110" fill="#FACC15"/><circle r="96" fill="#FEF3C7"/>
  ${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<path d="M0 0 L${r2(Math.cos(a - 0.33) * 86)} ${r2(Math.sin(a - 0.33) * 86)} A86 86 0 0 1 ${r2(Math.cos(a + 0.33) * 86)} ${r2(Math.sin(a + 0.33) * 86)}Z" fill="#FDE047" stroke="#FEF9C3" stroke-width="4"/>`; }).join("")}
  <circle r="12" fill="#FEF9C3"/>
</g>`;
const hotCup = () => `<g id="cup">
  <path d="M-90 -40 H90 L74 110 Q70 130 50 130 H-50 Q-70 130 -74 110Z" fill="url(#gCup)"/>
  <path d="M90 -10 Q150 -10 146 40 Q142 86 82 80" stroke="#E2E8F0" stroke-width="18" fill="none"/>
  <ellipse cx="0" cy="-40" rx="90" ry="18" fill="#7C2D12"/>
  <g id="steam">${[-40, 0, 40].map((x, i) => `<path id="st${i}" d="M${x} -70 q-20 -30 0 -60 q20 -30 0 -60" stroke="#94A3B8" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.6"/>`).join("")}</g>
</g>`;
const xMark = (id) => `<g id="${id}" opacity="0"><circle r="70" fill="${C.red}"/><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#fff" stroke-width="16" stroke-linecap="round"/></g>`;

// Raspall de dents i arcada neta.
const teethRow = (id) => `<g id="${id}">
  <path d="M-330 40 Q0 -40 330 40 L330 120 Q0 60 -330 120Z" fill="url(#gGum)"/>
  ${Array.from({ length: 8 }, (_, i) => { const x = -280 + i * 80; const y = 40 - Math.cos(((i - 3.5) / 3.5) * 1.1) * 40; return `<rect x="${x - 34}" y="${r2(y - 70)}" width="68" height="${i === 3 || i === 4 ? 104 : 92}" rx="26" fill="url(#gEnamel)" stroke="#D9D3C2" stroke-width="3"/>`; }).join("")}
</g>`;
const toothbrush = () => `<g id="brush">
  <rect x="-40" y="-26" width="560" height="52" rx="26" fill="url(#gBrush)"/>
  <rect x="-140" y="-34" width="130" height="30" rx="8" fill="#E0F2FE"/>
  ${Array.from({ length: 9 }, (_, i) => `<rect x="${-136 + i * 14}" y="-80" width="9" height="48" rx="4" fill="${i % 2 ? "#38BDF8" : "#F8FAFC"}"/>`).join("")}
</g>`;
const sparkle = (id, x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><g id="${id}" opacity="0"><path d="M0 -40 Q6 -6 40 0 Q6 6 0 40 Q-6 6 -40 0 Q-6 -6 0 -40Z" fill="#38BDF8"/></g></g>`;

// Cigarreta.
const cigarette = () => `<g id="cig">
  <rect x="-260" y="-26" width="380" height="52" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="3"/>
  <rect x="120" y="-26" width="130" height="52" rx="10" fill="#F59E0B"/>
  ${Array.from({ length: 8 }, (_, i) => `<circle cx="${135 + (i % 4) * 30}" cy="${i < 4 ? -8 : 10}" r="3" fill="#B45309" opacity="0.5"/>`).join("")}
  <rect x="-280" y="-26" width="30" height="52" rx="8" fill="#78716C"/><rect x="-286" y="-20" width="14" height="40" rx="6" fill="#EF4444"/>
  ${[0, 1, 2].map((i) => `<path id="smk${i}" d="M${-300 - i * 6} -30 q-30 -40 0 -80 q30 -40 0 -80" stroke="#CBD5E1" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.6"/>`).join("")}
</g>`;
// Mucosa (vista de superfície): irritada o sana.
function mucosaPatch(id, irritated) {
  const R = rng(irritated ? 3 : 4);
  let dots = "";
  for (let i = 0; i < 70; i++) dots += `<circle cx="${r2(-200 + R() * 400)}" cy="${r2(-150 + R() * 300)}" r="${r2(3 + R() * 5)}" fill="${irritated ? "#B91C1C" : "#F9B4BE"}" opacity="${r2(0.3 + R() * 0.4)}"/>`;
  return `<g id="${id}">
    <rect x="-220" y="-170" width="440" height="340" rx="40" fill="${irritated ? "url(#gIrrit)" : "url(#gHealthy)"}"/>
    ${dots}
    ${irritated ? `<ellipse cx="40" cy="20" rx="70" ry="44" fill="#F1E2C6" stroke="#B91C1C" stroke-width="10"/><ellipse cx="-90" cy="-70" rx="30" ry="20" fill="#DC2626" opacity="0.5"/>` : `<ellipse cx="40" cy="20" rx="40" ry="24" fill="#F3A2AD" opacity="0.7"/>`}
    <rect x="-220" y="-170" width="440" height="340" rx="40" fill="none" stroke="#fff" stroke-width="10"/>
  </g>`;
}

// Calendari mensual amb visites.
function calendarMonth() {
  let cells = "";
  const visits = { 3: "v1", 10: "v2", 17: "v3", 24: "v4" };
  for (let d = 0; d < 28; d++) {
    const x = -255 + (d % 7) * 85, y = -60 + Math.floor(d / 7) * 72;
    cells += `<g transform="translate(${x},${y})"><rect x="-36" y="-30" width="72" height="60" rx="12" fill="${visits[d] ? "#fff" : "#F1F5F9"}"/>${visits[d] ? `<g id="${visits[d]}" opacity="0"><rect x="-36" y="-30" width="72" height="60" rx="12" fill="${C.green}"/><g transform="translate(-18,-18)">${icon("tooth", 36, "#fff").replace("<svg ", '<svg x="0" y="0" ')}</g></g>` : ""}</g>`;
  }
  return `<g id="month">
    <rect x="-320" y="-200" width="640" height="420" rx="34" fill="#fff" filter="url(#shadow)"/>
    <rect x="-320" y="-200" width="640" height="84" rx="34" fill="${C.green}"/><rect x="-320" y="-150" width="640" height="34" fill="${C.green}"/>
    <circle cx="-160" cy="-200" r="14" fill="#94A3B8"/><circle cx="160" cy="-200" r="14" fill="#94A3B8"/>
    ${cells}
  </g>`;
}
// Miniatura d'úlcera en un estadi de cicatrització (1 = sencera, 0 = curada).
const ulcerThumb = (id, k) => `<g id="${id}" opacity="0">
  <circle r="70" fill="url(#gHealthy)" stroke="#fff" stroke-width="8" filter="url(#shadow)"/>
  ${k > 0 ? `<g transform="rotate(-30) scale(${k})"><ellipse rx="44" ry="30" fill="#E0444F" opacity="0.45"/><ellipse rx="32" ry="20" fill="#D23B4E"/><ellipse rx="24" ry="14" fill="#F1E2C6"/></g>` : `<path d="M-24 2 L-6 20 L28 -16" stroke="${C.green}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`}
</g>`;

const DEFS = `<defs>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.18"/></filter>
  <radialGradient id="gTongue" cx="0.45" cy="0.35" r="0.75"><stop offset="0" stop-color="#F3A2AD"/><stop offset="0.6" stop-color="#E07888"/><stop offset="1" stop-color="#C45467"/></radialGradient>
  <linearGradient id="gTongueShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7F1D2D" stop-opacity="0.25"/><stop offset="0.3" stop-color="#7F1D2D" stop-opacity="0"/><stop offset="0.75" stop-color="#7F1D2D" stop-opacity="0"/><stop offset="1" stop-color="#7F1D2D" stop-opacity="0.3"/></linearGradient>
  <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#64748B"/><stop offset="0.35" stop-color="#E2E8F0"/><stop offset="0.55" stop-color="#F8FAFC"/><stop offset="1" stop-color="#475569"/></linearGradient>
  <radialGradient id="gBur" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#E7E5E4"/><stop offset="1" stop-color="#78716C"/></radialGradient>
  <linearGradient id="gEnamel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#F3EEDF"/><stop offset="1" stop-color="#D8CFB8"/></linearGradient>
  <linearGradient id="gGum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1A0AC"/><stop offset="1" stop-color="#D86A7E"/></linearGradient>
  <linearGradient id="gFoil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8FAFC"/><stop offset="0.5" stop-color="#E2E8F0"/><stop offset="1" stop-color="#CBD5E1"/></linearGradient>
  <radialGradient id="gPill" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E2E8F0"/></radialGradient>
  <linearGradient id="gChili" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F87171"/><stop offset="1" stop-color="#B91C1C"/></linearGradient>
  <linearGradient id="gCup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E2E8F0"/><stop offset="0.5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CBD5E1"/></linearGradient>
  <linearGradient id="gBrush" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DD3FC"/><stop offset="1" stop-color="#0284C7"/></linearGradient>
  <radialGradient id="gIrrit" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stop-color="#EF4444"/><stop offset="1" stop-color="#B91C1C"/></radialGradient>
  <radialGradient id="gHealthy" cx="0.45" cy="0.4" r="0.75"><stop offset="0" stop-color="#F7B6C0"/><stop offset="1" stop-color="#E58494"/></radialGradient>
  <radialGradient id="gPain" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#EF4444" stop-opacity="0.55"/><stop offset="1" stop-color="#EF4444" stop-opacity="0"/></radialGradient>
</defs>`;

// ───────────────────────── món ─────────────────────────
function world() {
  const x = (id) => WX(id) + VX;
  const s1 = WX(1);
  return `
<svg class="layer" style="left:-2000px;top:-1600px" width="24000" height="3200" viewBox="-2000 -1600 24000 3200">
  ${DEFS}
  <!-- 1 · títol -->
  <g transform="translate(${s1},120) scale(1.5)" filter="url(#shadow)">${tongueReal("tg1")}</g>

  <!-- 2 · etiològic: la turbina poleix la vora -->
  <g transform="translate(${x(2) - 40},-20) scale(0.95)" filter="url(#shadow)">${tongueReal("tg2")}</g>
  <g transform="translate(${x(2) + 150},250) rotate(-30) scale(1.4)"><g id="t2">${tooth("t2Sharp", "t2Smooth")}</g>
    <g id="t2Spark" opacity="0"><path d="M-36 -70 l-22 -16 M0 -78 v-26 M36 -70 l22 -16" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/></g></g>
  <g transform="translate(${x(2) + 165},190) rotate(28)"><g id="hpWrap" opacity="0">${handpiece()}</g></g>

  <!-- 3 · simptomàtic: ibuprofèn i menys dolor -->
  <g transform="translate(${x(3) + 60},10) scale(1.15)" filter="url(#shadow)">${tongueReal("tg3")}</g>
  <g transform="translate(${r2(x(3) + 60 + LES.x * 1.15)},${r2(10 + LES.y * 1.15)})">
    <circle id="pain" r="190" fill="url(#gPain)"/>
    ${[[-150, -110, -20], [90, -150, 18], [110, 120, 30]].map(([px, py, rot], i) => `<g transform="translate(${px},${py}) rotate(${rot})"><g id="bolt${i}">${icon("lightning", 80, C.red).replace("<svg ", '<svg x="-40" y="-40" ')}</g></g>`).join("")}
  </g>
  <g transform="translate(${x(3) - 140},360) scale(0.7)"><g id="blWrap" opacity="0" filter="url(#shadow)">${blister()}</g></g>

  <!-- 4 · mesures no farmacològiques -->
  <g transform="translate(${x(4) - 260},-170)"><g id="food1" opacity="0">${chili()}</g></g>
  <g transform="translate(${x(4) + 40},-170) scale(0.85)"><g id="food2" opacity="0">${lemon()}</g></g>
  <g transform="translate(${x(4) + 320},-150) scale(0.9)"><g id="food3" opacity="0">${hotCup()}</g></g>
  <g transform="translate(${x(4) - 260},-170)">${xMark("x1")}</g>
  <g transform="translate(${x(4) + 40},-170)">${xMark("x2")}</g>
  <g transform="translate(${x(4) + 320},-150)">${xMark("x3")}</g>
  <g transform="translate(${x(4) + 30},270)"><g id="teeth4" opacity="0">${teethRow("tr4")}</g></g>
  <g transform="translate(${x(4) + 30},230)"><g id="brushWrap" opacity="0">${toothbrush()}</g></g>
  ${sparkle("sp1", x(4) - 200, 150, 1)}${sparkle("sp2", x(4) + 260, 140, 0.8)}${sparkle("sp3", x(4) + 40, 120, 0.6)}

  <!-- 5 · tabac -->
  <g transform="translate(${x(5) + 20},-230)"><g id="cigWrap" opacity="0">${cigarette()}</g></g>
  <g transform="translate(${x(5) + 20},-230)"><g id="cigX" opacity="0"><circle r="150" fill="none" stroke="${C.red}" stroke-width="22"/><path d="M-106 106 L106 -106" stroke="${C.red}" stroke-width="22" stroke-linecap="round"/></g></g>
  <g transform="translate(${x(5) - 240},210) scale(0.72)"><g id="mucI" opacity="0" filter="url(#shadow)">${mucosaPatch("mI", true)}</g></g>
  <g transform="translate(${x(5) + 280},210) scale(0.72)"><g id="mucH" opacity="0" filter="url(#shadow)">${mucosaPatch("mH", false)}</g></g>
  <path id="arr5" d="M${x(5) - 50} 210 H${x(5) + 90} M${x(5) + 60} 180 L${x(5) + 90} 210 L${x(5) + 60} 240" stroke="${C.green}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0"/>

  <!-- 6 · seguiment -->
  <g transform="translate(${x(6) + 20},-90) scale(0.95)"><g id="monthWrap" opacity="0">${calendarMonth()}</g></g>
  ${[1, 0.65, 0.3, 0].map((k, i) => `<g transform="translate(${x(6) - 330 + i * 230},330)">${ulcerThumb(`ut${i}`, k)}</g>`).join("")}
  ${[0, 1, 2].map((i) => `<path id="tha${i}" d="M${x(6) - 330 + i * 230 + 84} 330 H${x(6) - 330 + i * 230 + 146}" stroke="#94A3B8" stroke-width="8" stroke-linecap="round" opacity="0"/>`).join("")}

  <!-- 7 · si no millora -->
  <rect x="${WX(7) - 1000}" y="-600" width="1000" height="1200" fill="#ECFDF5"/>
  <rect x="${WX(7)}" y="-600" width="1000" height="1200" fill="#FFF1F2"/>
  <path d="M${WX(7)} -600 V600" stroke="#fff" stroke-width="12"/>
  <g transform="translate(${WX(7) - 470},60) scale(1.0)" filter="url(#shadow)">${tongueReal("tgL")}</g>
  <g transform="translate(${WX(7) + 470},60) scale(1.0)" filter="url(#shadow)">${tongueReal("tgR")}</g>
  <g transform="translate(${r2(WX(7) - 470 + LES.x)},${60 + LES.y})"><g id="okL" opacity="0">${icon("check-circle", 140, C.green).replace("<svg ", '<svg x="-70" y="-70" ')}</g></g>
  <g transform="translate(${r2(WX(7) + 470 + LES.x)},${60 + LES.y - 150})"><g id="warnR" opacity="0">${icon("warning", 150, C.red).replace("<svg ", '<svg x="-75" y="-75" ')}</g></g>
</svg>`;
}

const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif;color:${C.ink}}
#bgSoft{position:absolute;inset:0;background:radial-gradient(70% 60% at 65% 45%, #FFFFFF, ${C.bg} 70%)}
#punchz{position:absolute;left:${W / 2}px;top:${H / 2}px;width:0;height:0}
#cam,#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
#title{position:absolute;left:0;right:0;top:120px;text-align:center;font-weight:900;font-size:110px;letter-spacing:-0.02em;opacity:0}
#title small{display:block;font-size:34px;font-weight:700;letter-spacing:.24em;color:${C.blue};margin-bottom:10px}
.panel{position:absolute;left:110px;top:150px;width:720px;opacity:0}
.theory{font-size:40px;font-weight:500;line-height:1.3;color:${C.ink2};padding-left:26px;border-left:8px solid var(--c);margin-bottom:46px}
.card{background:#fff;border-radius:34px;padding:34px 40px;box-shadow:0 18px 50px rgba(15,23,42,.12);border:3px solid ${C.line}}
.card h2{font-size:60px;font-weight:900;line-height:1.02;letter-spacing:-0.01em;color:var(--c)}
.card .sub{font-size:44px;font-weight:800;margin-top:14px}
.card .ex{font-size:34px;font-weight:500;line-height:1.3;color:${C.ink2};margin-top:20px;padding-top:20px;border-top:3px solid ${C.line}}
.card .ex b{color:var(--c);font-weight:800}
.card>*{opacity:0}
#final{position:absolute;left:0;right:0;top:90px;display:flex;justify-content:center;opacity:0}
#final div{font-weight:900;font-size:76px;letter-spacing:-0.01em;padding:18px 44px;border-radius:30px;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,.14);border:3px solid ${C.line};white-space:nowrap}
#final span{color:${C.red}}
`;

// ───────────────────────── línia de temps ─────────────────────────
const T = [], SFX = [];
const sfx = (file, t, vol = 0.4) => SFX.push({ file, t: +Math.max(0, t).toFixed(3), vol });
const tw = (sel, from, vars, t) => { const o = { sel, from, vars, t }; T.push(o); return o; };
const to = (sel, vars, t) => tw(sel, null, vars, t);
const fromTo = (sel, a, b, t) => tw(sel, a, b, t);
const set = (sel, vars, t) => T.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r2(t)});`);
const raw = (s) => T.push(s);
let wk = 0;
const whoosh = () => ["whoosh1", "whoosh2", "whoosh3"][wk++ % 3];
let camState = { x: 0, y: 0, s: 1 }, lastCam = null;
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
    sfx(whoosh(), t + dur * 0.5, 0.3);
  }
  camState = { x, y, s };
}
const punch = (t, s = 1.05) => {
  to("#punchz", { scale: s, duration: 0.16, ease: "power3.out" }, t);
  to("#punchz", { scale: 1, duration: 0.5, ease: "power2.inOut" }, t + 0.18);
};
const fadeIn = (sel, t, d = 0.5) => fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d, ease: "power2.out" }, t);
const pop = (sel, t, extra = {}) => fromTo(sel, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", ...extra }, t);

raw(`gsap.set(["#hp","#bur","#blister","#pillOut","#food1","#food2","#food3","#x1","#x2","#x3","#brush","#cigWrap","#cigX","#mucI","#mucH","#monthWrap","#okL","#warnR","#v1","#v2","#v3","#v4","#ut0","#ut1","#ut2","#ut3","#bolt0","#bolt1","#bolt2","#sp1","#sp2","#sp3","#tg1U","#tg2U","#tg3U","#tgLU","#tgRU","#t2"], {svgOrigin:"0 0"});`);

// Panells de text (teoria + targeta) per a les escenes 2–6.
let html = `<div id="title"><small>NUCLI 8 · RECURSOS TERAPÈUTICS</small>TRACTAMENT DE L’ÚLCERA</div>`;
S.filter((s) => s.title).forEach((s) => {
  const top = s.theory ? 150 : 300;
  html += `<div class="panel" id="p${s.id}" style="--c:${s.color};top:${top}px">
    ${s.theory ? `<div class="theory" id="th${s.id}">«${s.theory}»</div>` : ""}
    <div class="card"><h2 id="h${s.id}">${s.title}</h2><div class="sub" id="sb${s.id}">${s.sub}</div>${s.ex ? `<div class="ex" id="ex${s.id}"><b>Exemple:</b> ${s.ex}</div>` : ""}</div>
  </div>`;
  const t0 = s.t;
  set(`#p${s.id}`, { opacity: 1 }, t0 + 0.2);
  if (s.theory) fromTo(`#th${s.id}`, { opacity: 0, x: -30, filter: "blur(8px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }, t0 + 0.3);
  const tc = s.theory ? t0 + 2.0 : t0 + 0.5;
  fromTo(`#p${s.id} .card`, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, tc);
  fromTo(`#h${s.id}`, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, tc + 0.1);
  fromTo(`#sb${s.id}`, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, tc + 0.5);
  if (s.ex) fromTo(`#ex${s.id}`, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, tc + 1.2);
  sfx("pop1", tc + 0.1, 0.3);
  to(`#p${s.id}`, { opacity: 0, x: -60, duration: 0.35, ease: "power2.in" }, s.end - 0.45);
});
html += `<div id="final"><div>SI NO MILLORA → <span>REVALORAR LA LESIÓ</span></div></div>`;

// ═════ 1 · títol ═════
set("#zoom", { scale: 1.6 }, 0);
set("#pan", { x: -(WX(1) + LES.x * 1.5), y: -(120 + LES.y * 1.5) }, 0);
set("#bgpan", { x: -(WX(1) + LES.x * 1.5) * 0.5, y: -(120 + LES.y * 1.5) * 0.5 }, 0);
camState = { x: WX(1) + LES.x * 1.5, y: 120 + LES.y * 1.5, s: 1.6 };
cam(0.6, WX(1), 120, 0.9, 1.8, "power3.inOut");
fromTo("#tg1U", { scale: 1 }, { scale: 1.12, duration: 0.4, yoyo: true, repeat: 3 }, 0.2);
fromTo("#title", { opacity: 0, y: 30, filter: "blur(12px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, 1.4);
sfx("impact", 1.5, 0.4);
to("#title", { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" }, 4.5);

// ═════ 2 · etiològic ═════
{
  const t0 = SC[2].t;
  cam(t0 - 0.2, WX(2), 0, 1, 1.0, "power3.inOut", { blur: true });
  fromTo("#hpWrap", { opacity: 0, x: 260, y: -260 }, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: "power3.out" }, t0 + 3.2);
  fromTo("#bur", { rotation: 0 }, { rotation: 1800, duration: 3.2, ease: "none" }, t0 + 4.0);
  fromTo("#hp", { x: -5 }, { x: 5, duration: 0.05, repeat: 47, yoyo: true }, t0 + 4.0);
  fromTo("#t2Spark", { opacity: 0 }, { opacity: 1, duration: 0.08, repeat: 31, yoyo: true }, t0 + 4.2);
  sfx("rub", t0 + 4.0, 0.3); sfx("rub", t0 + 5.0, 0.25);
  to("#t2Sharp", { opacity: 0, duration: 1.4 }, t0 + 4.8);
  fromTo("#t2Smooth", { opacity: 0 }, { opacity: 1, duration: 1.4 }, t0 + 4.8);
  to("#hpWrap", { opacity: 0, x: 260, y: -260, duration: 0.5, ease: "power2.in" }, t0 + 7.4);
  fromTo("#t2", { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1 }, t0 + 7.8);
  sfx("pop2", t0 + 7.85, 0.3);
  cam(t0 + 3.0, WX(2) + 140, 60, 1.18, 3.0, "sine.inOut");
}

// ═════ 3 · simptomàtic ═════
{
  const t0 = SC[3].t;
  cam(t0 - 0.2, WX(3), 0, 1, 1.0, "power3.inOut", { blur: true });
  fromTo("#pain", { scale: 0.9, opacity: 0.8 }, { scale: 1.1, opacity: 1, duration: 0.5, yoyo: true, repeat: 7, transformOrigin: "50% 50%" }, t0 + 0.3);
  [0, 1, 2].forEach((i) => fromTo(`#bolt${i}`, { scale: 0.9 }, { scale: 1.15, duration: 0.3, yoyo: true, repeat: 9 }, t0 + 0.3 + i * 0.1));
  fromTo("#blWrap", { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, t0 + 3.3);
  // el comprimit surt del blíster
  fromTo("#pillOut", { opacity: 0, x: 130, y: 55 }, { opacity: 1, x: 130, y: 55, duration: 0.3 }, t0 + 4.3);
  to("#pillOut", { x: 360, y: -330, duration: 0.7, ease: "power2.out" }, t0 + 4.6);
  to("#pillOut", { opacity: 0, scale: 0.5, duration: 0.4 }, t0 + 5.2);
  sfx("click1", t0 + 4.3, 0.3);
  // menys dolor i menys inflamació
  to("#pain", { scale: 0.45, opacity: 0.25, duration: 2.0, ease: "power2.out" }, t0 + 5.4);
  [0, 1, 2].forEach((i) => to(`#bolt${i}`, { scale: 0.2, opacity: 0, duration: 0.8, ease: "power2.in" }, t0 + 5.6 + i * 0.25));
  to("#tg3UHalo", { opacity: 0.18, duration: 2.0 }, t0 + 5.6);
  sfx("whoosh3", t0 + 5.6, 0.18);
  cam(t0 + 3.0, WX(3) + 80, 40, 1.08, 4.0, "sine.inOut");
}

// ═════ 4 · mesures no farmacològiques ═════
{
  const t0 = SC[4].t;
  cam(t0 - 0.2, WX(4), 0, 1, 1.0, "power3.inOut", { blur: true });
  pop("#food1", t0 + 2.8); pop("#food2", t0 + 3.2); pop("#food3", t0 + 3.6);
  [0, 1, 2].forEach((i) => fromTo(`#st${i}`, { y: 0, opacity: 0.6 }, { y: -30, opacity: 0, duration: 1.2, repeat: 3, ease: "sine.out" }, t0 + 3.6 + i * 0.3));
  ["#x1", "#x2", "#x3"].forEach((x, i) => { fromTo(x, { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, t0 + 5.0 + i * 0.25); sfx("pop2", t0 + 5.05 + i * 0.25, 0.25); });
  // s'aparten
  ["#food1", "#food2", "#food3", "#x1", "#x2", "#x3"].forEach((x, i) => to(x, { x: 700, opacity: 0, duration: 0.6, ease: "power3.in" }, t0 + 6.2 + (i % 3) * 0.12));
  sfx("whoosh1", t0 + 6.4, 0.25);
  fadeIn("#teeth4", t0 + 6.9, 0.5);
  fromTo("#brushWrap", { opacity: 0, x: 500 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, t0 + 7.2);
  fromTo("#brush", { x: -120 }, { x: 120, duration: 0.22, repeat: 9, yoyo: true, ease: "sine.inOut" }, t0 + 7.7);
  sfx("rub", t0 + 7.7, 0.22);
  to("#brushWrap", { opacity: 0, x: 600, duration: 0.5, ease: "power2.in" }, t0 + 9.9);
  ["#sp1", "#sp2", "#sp3"].forEach((x, i) => fromTo(x, { opacity: 0, scale: 0.2, rotation: 0 }, { opacity: 1, scale: 1, rotation: 45, duration: 0.45, ease: "back.out(2)" }, t0 + 9.9 + i * 0.18));
  sfx("pop1", t0 + 10.0, 0.25);
}

// ═════ 5 · tabac ═════
{
  const t0 = SC[5].t;
  cam(t0 - 0.2, WX(5), 0, 1, 1.0, "power3.inOut", { blur: true });
  fromTo("#cigWrap", { opacity: 0, x: 200 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, t0 + 0.4);
  [0, 1, 2].forEach((i) => fromTo(`#smk${i}`, { y: 0, opacity: 0.6 }, { y: -40, opacity: 0, duration: 1.4, repeat: 2, ease: "sine.out" }, t0 + 0.6 + i * 0.4));
  fromTo("#cigX", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, t0 + 1.3);
  sfx("impact", t0 + 1.35, 0.35);
  punch(t0 + 1.35);
  pop("#mucI", t0 + 2.6);
  fadeIn("#arr5", t0 + 3.4, 0.4);
  pop("#mucH", t0 + 3.8);
  sfx("pop2", t0 + 3.85, 0.25);
}

// ═════ 6 · seguiment ═════
{
  const t0 = SC[6].t;
  cam(t0 - 0.2, WX(6), 0, 1, 1.0, "power3.inOut", { blur: true });
  pop("#monthWrap", t0 + 2.6);
  ["#v1", "#v2", "#v3", "#v4"].forEach((v, i) => {
    pop(v, t0 + 3.4 + i * 1.1);
    pop(`#ut${i}`, t0 + 3.6 + i * 1.1);
    if (i < 3) fadeIn(`#tha${i}`, t0 + 4.2 + i * 1.1, 0.3);
    sfx("pop1", t0 + 3.45 + i * 1.1, 0.22);
  });
  cam(t0 + 3.0, WX(6) + 60, 40, 1.05, 5.5, "sine.inOut");
}

// ═════ 7 · si no millora ═════
{
  const t0 = SC[7].t;
  cam(t0 - 0.2, WX(7), 40, 0.95, 1.0, "power3.inOut", { blur: true });
  to("#tgLU", { scale: 0, opacity: 0, duration: 2.2, ease: "power2.inOut" }, t0 + 1.0);
  pop("#okL", t0 + 3.0);
  sfx("pop1", t0 + 3.05, 0.3);
  fromTo("#tgRU", { scale: 1 }, { scale: 1.15, duration: 0.4, yoyo: true, repeat: 5 }, t0 + 1.0);
  pop("#warnR", t0 + 3.3);
  fromTo("#warnR", { rotation: -6 }, { rotation: 6, duration: 0.12, repeat: 5, yoyo: true }, t0 + 3.8);
  sfx("impact", t0 + 3.35, 0.35);
  fromTo("#final", { opacity: 0, y: -30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, t0 + 3.9);
  punch(t0 + 3.9, 1.04);
}

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
const bgDots = `<svg class="layer" style="left:-3000px;top:-2000px" width="28000" height="4000" viewBox="-3000 -2000 28000 4000">
  <defs><pattern id="gDots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="2.6" fill="#DCE3EC"/></pattern></defs>
  <rect x="-3000" y="-2000" width="28000" height="4000" fill="url(#gDots)"/></svg>`;

fs.writeFileSync(path.join(ROOT, "compositions/world.html"), `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="world" data-width="${W}" data-height="${H}">
    <div id="bgSoft"></div>
    <div id="punchz"><div id="cam"><div id="zoom">
      <div id="bgpan">${bgDots}</div>
      <div id="pan">${world()}</div>
    </div></div></div>
    <div id="ui">${html}</div>
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
