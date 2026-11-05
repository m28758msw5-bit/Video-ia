// Generador del vídeo «La ferida que no es cura».
// Llegeix assets/words.json (temps de cada paraula del guió) i escriu:
//   index.html                 arrel: veu, música, efectes, escenes
//   compositions/world.html    el món 2D amb la càmera
//   compositions/captions.html subtítols paraula a paraula
//
//   node scripts/build.mjs            (vídeo sencer)
//   node scripts/build.mjs --until 8  (només fins al segon 8, per a proves)

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const UNTIL = args.includes("--until") ? parseFloat(args[args.indexOf("--until") + 1]) : null;

// ───────────────────────── temps de la veu ─────────────────────────
const words = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/words.json"), "utf8"));
const norm = (w) =>
  w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/l·l/g, "ll").replace(/[^a-z0-9]/g, "");

// «l'úlcera» compta com a «úlcera» (i també com a «l'úlcera»).
const match = (text, key) => norm(text) === key || norm(text.split(/['’]/).pop()) === key;
/** Quan comença la n-èsima vegada que es diu `word` (1 = la primera). */
function P(word, n = 1) {
  const key = norm(word);
  let c = 0;
  for (const w of words) if (match(w.text, key) && ++c === n) return +w.start.toFixed(3);
  throw new Error(`P("${word}", ${n}): no es diu tantes vegades`);
}
/** Quan acaba la n-èsima vegada que es diu `word`. */
function E(word, n = 1) {
  const key = norm(word);
  let c = 0;
  for (const w of words) if (match(w.text, key) && ++c === n) return +w.end.toFixed(3);
  throw new Error(`E("${word}", ${n})`);
}

const voicePath = path.join(ROOT, "assets/voz.wav");
const voiceDur = fs.existsSync(voicePath)
  ? parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${voicePath}"`).toString())
  : words.at(-1).end + 0.6;
const DUR = +(UNTIL ?? voiceDur).toFixed(3);

// ───────────────────────── utilitats ─────────────────────────
const icon = (name, size, color = "currentColor", extra = "") => {
  const svg = fs.readFileSync(path.join(ROOT, "assets/icons", `${name}.svg`), "utf8");
  return svg.replace("<svg ", `<svg width="${size}" height="${size}" style="color:${color};${extra}" `);
};
const r2 = (v) => Math.round(v * 100) / 100;
// Generador pseudoaleatori amb llavor (render determinista).
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const C = {
  ink: "#0F172A",
  ink2: "#334155",
  wall: "#EAF2F8",
  blue: "#2563EB",
  teal: "#14B8A6",
  tealD: "#0F8F84",
  red: "#E11D48",
  green: "#16A34A",
  skinP: "#EDB88B",
  skinD: "#B97A56",
  hairP: "#4A3222",
  orange: "#F28C28",
  jeans: "#3557A6",
  coat: "#FFFFFF",
  coatLine: "#CBD5E1",
  mask: "#5EEAD4",
  glove: "#93C5FD",
  scrub: "#0EA5A4",
};

// ───────────────────────── geometria del món ─────────────────────────
// Coordenades del món en px. La càmera centra (cx, cy) al punt de pantalla
// (540, 990) amb escala s.
const HEAD = { x: 365, y: 20 }; // centre del cap del pacient
const MOUTH = { x: HEAD.x - 26, y: HEAD.y - 54 }; // boca del pacient
const K = 0.16; // escala de la làmina de la boca dins del món
const PL = (lx, ly) => ({ x: MOUTH.x + lx * K, y: MOUTH.y + ly * K }); // local → món
const MON = { x: 860, y: -220, w: 400, h: 260 }; // pantalla de l'ordinador
const TAG = { a: { x: 120, y: -585 }, b: { x: 360, y: -735 }, c: { x: 580, y: -560 } };
const TRAIL = `M${TAG.a.x + 90} ${TAG.a.y - 40} C ${TAG.a.x + 120} ${TAG.a.y - 160}, ${TAG.b.x - 60} ${TAG.b.y + 40}, ${TAG.b.x + 40} ${TAG.b.y + 30} C ${TAG.b.x + 300} ${TAG.b.y + 20}, ${TAG.c.x - 40} ${TAG.c.y - 200}, ${TAG.c.x + 60} ${TAG.c.y - 40}`;

// Dents (làmina de la boca, coordenades locals).
function arcTeeth(cx, cy, rx, ry, a0, a1, n, lower) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = ((a0 + ((a1 - a0) * (i + 0.5)) / n) * Math.PI) / 180;
    const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const centre = Math.abs(Math.cos(a)); // 0 al mig, 1 als costats
    const w = 78 - centre * 8, h = (lower ? 62 : 84) - centre * 18;
    const rot = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
    out.push({ x, y, w, h, rot, i });
  }
  return out;
}
const upperTeeth = arcTeeth(0, -30, 300, 250, 202, 338, 10, false);
const lowerTeeth = arcTeeth(0, 40, 290, 225, 22, 158, 10, true);
// La dent afilada: inferior, costat dret de la imatge (lateral de la llengua).
const SHARP = lowerTeeth[1];
const ULCER = { x: 196, y: 108, rot: -62 };

// ───────────────────────── art: fons de la clínica ─────────────────────────
function backWall() {
  const R = rng(7);
  let dust = "";
  for (let i = 0; i < 14; i++) {
    const x = -1200 + R() * 2600, y = -1000 + R() * 1300, r = 4 + R() * 7;
    dust += `<circle class="dust" id="dust${i}" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#ffffff" opacity="0.55"/>`;
  }
  return `
<svg class="layer" style="left:-2400px;top:-1700px" width="4800" height="2900" viewBox="-2400 -1700 4800 2900">
  <defs>
    <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F5F9FC"/><stop offset="1" stop-color="#E3EEF6"/>
    </linearGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#BFE3FA"/><stop offset="1" stop-color="#EAF6FF"/>
    </linearGradient>
    <pattern id="gGrid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0H0V80" fill="none" stroke="#D6E4EF" stroke-width="2"/>
    </pattern>
  </defs>
  <rect x="-2400" y="-1700" width="4800" height="2900" fill="url(#gWall)"/>
  <rect x="-2400" y="-1700" width="4800" height="2900" fill="url(#gGrid)" opacity="0.7"/>
  <!-- finestra -->
  <g transform="translate(-980,-760)">
    <rect x="0" y="0" width="560" height="520" rx="22" fill="#FFFFFF"/>
    <rect x="22" y="22" width="516" height="476" rx="12" fill="url(#gSky)"/>
    <circle cx="420" cy="120" r="46" fill="#FFF3C4"/>
    <path d="M22 400 Q160 330 300 380 T538 360 V498 H22Z" fill="#CDE8D5"/>
    <rect x="270" y="22" width="20" height="476" fill="#FFFFFF"/>
    <rect x="22" y="250" width="516" height="16" fill="#FFFFFF"/>
  </g>
  <!-- armari i prestatge -->
  <g transform="translate(-1060,-40)">
    <rect x="0" y="0" width="640" height="420" rx="18" fill="#FFFFFF" stroke="#D3E0EA" stroke-width="4"/>
    <rect x="24" y="24" width="282" height="170" rx="10" fill="#F1F6FA" stroke="#D3E0EA" stroke-width="3"/>
    <rect x="334" y="24" width="282" height="170" rx="10" fill="#F1F6FA" stroke="#D3E0EA" stroke-width="3"/>
    <rect x="24" y="220" width="592" height="80" rx="10" fill="#F1F6FA" stroke="#D3E0EA" stroke-width="3"/>
    <rect x="24" y="318" width="592" height="80" rx="10" fill="#F1F6FA" stroke="#D3E0EA" stroke-width="3"/>
    <rect x="140" y="102" width="50" height="10" rx="5" fill="#B8C7D4"/><rect x="450" y="102" width="50" height="10" rx="5" fill="#B8C7D4"/>
    <rect x="295" y="255" width="50" height="10" rx="5" fill="#B8C7D4"/><rect x="295" y="353" width="50" height="10" rx="5" fill="#B8C7D4"/>
  </g>
  <g transform="translate(-1040,-200)">
    <rect x="0" y="120" width="600" height="14" rx="7" fill="#D3E0EA"/>
    <rect x="40" y="40" width="60" height="80" rx="10" fill="#7DD3FC"/>
    <rect x="120" y="60" width="44" height="60" rx="8" fill="#FDE68A"/>
    <rect x="182" y="30" width="70" height="90" rx="12" fill="#FFFFFF" stroke="#D3E0EA" stroke-width="3"/>
    <path d="M200 60h34M217 43v34" stroke="#14B8A6" stroke-width="8" stroke-linecap="round"/>
  </g>
  <!-- planta -->
  <g id="plant" transform="translate(1260,420)">
    <path d="M-60 0 L-46 -120 H46 L60 0Z" fill="#FFFFFF" stroke="#D3E0EA" stroke-width="4"/>
    <g id="plantLeaves">
      <path d="M0 -120 C-80 -200 -120 -300 -60 -380 C-20 -300 -10 -220 0 -120Z" fill="#34D399"/>
      <path d="M0 -120 C70 -210 140 -260 150 -360 C80 -320 30 -240 0 -120Z" fill="#10B981"/>
      <path d="M0 -120 C10 -230 0 -330 30 -440 C70 -330 40 -220 0 -120Z" fill="#6EE7B7"/>
    </g>
  </g>
  <!-- rellotge de paret -->
  <g transform="translate(1280,-620)">
    <circle r="90" fill="#FFFFFF" stroke="#D3E0EA" stroke-width="8"/>
    <g id="clockMin"><rect x="-4" y="-70" width="8" height="74" rx="4" fill="#334155"/></g>
    <g id="clockHr"><rect x="-5" y="-44" width="10" height="48" rx="5" fill="#0F172A"/></g>
    <circle r="9" fill="#14B8A6"/>
  </g>
  <!-- terra -->
  <rect x="-2400" y="420" width="4800" height="780" fill="#D8E4EE"/>
  <rect x="-2400" y="420" width="4800" height="10" fill="#C3D3E0"/>
  ${dust}
</svg>`;
}

// ───────────────────────── art: personatges i clínica ─────────────────────────
function patientHead() {
  // Perfil estirat: cara cap amunt, clatell a la dreta, barbeta a l'esquerra.
  return `
  <g transform="translate(${HEAD.x},${HEAD.y})"><g id="pHead">
    <path d="M-60 6 Q-58 -40 -20 -58 Q30 -74 58 -30 Q74 10 52 44 Q20 74 -20 62 Q-52 48 -60 6Z" fill="${C.skinP}"/>
    <path d="M14 -60 Q58 -54 66 -6 Q70 40 34 62 Q2 76 -26 62 Q20 52 36 20 Q50 -14 14 -60Z" fill="${C.hairP}"/>
    <path d="M-2 -60 Q10 -64 18 -60 Q6 -48 -2 -60Z" fill="${C.hairP}"/>
    <ellipse cx="22" cy="14" rx="11" ry="14" fill="${C.skinP}" stroke="${C.skinD}" stroke-width="3"/>
    <path d="M-14 -58 L-6 -82 L4 -60Z" fill="${C.skinP}" stroke="${C.skinD}" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="-50" cy="-36" rx="16" ry="14" fill="${C.skinP}"/>
    <g id="pEye"><ellipse cx="10" cy="-36" rx="9" ry="7" fill="#fff"/><circle cx="13" cy="-38" r="4.5" fill="${C.ink}"/></g>
    <path id="pBrow" d="M2 -50 Q12 -56 22 -50" stroke="${C.hairP}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path id="pMouthLine" d="M-38 -46 Q-29 -52 -20 -56" stroke="#9B3D3D" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <g transform="translate(-29,-53) rotate(-28)"><g id="pMouthOpen"><ellipse rx="13" ry="9" fill="#5B1726"/><ellipse cy="3" rx="7" ry="3.5" fill="#E57C8A"/></g></g>
    <path id="pSmile" d="M-40 -50 Q-30 -46 -19 -58" stroke="#9B3D3D" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0"/>
  </g></g>`;
}

function patient() {
  return `
<g id="patient">
  <!-- cames -->
  <path d="M110 118 L-400 118 Q-420 118 -420 138 Q-420 158 -400 158 L110 162Z" fill="${C.jeans}"/>
  <path d="M-150 120 Q-120 108 -90 120" stroke="#2A4688" stroke-width="4" fill="none"/>
  <rect x="-462" y="84" width="40" height="76" rx="16" fill="#1F2937"/>
  <!-- tronc -->
  <g id="pChest">
    <path d="M80 166 L92 102 Q180 60 288 52 Q326 60 330 96 L318 132 Q200 160 80 166Z" fill="${C.orange}"/>
    <path d="M300 56 Q312 70 306 92" stroke="#D97316" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <!-- coll -->
  <path d="M296 60 Q312 34 318 6 L340 24 Q336 56 324 88Z" fill="${C.skinP}"/>
  ${patientHead()}
  <!-- braç (pivot a l'espatlla) -->
  <g transform="translate(272,92)"><g id="pArmU">
    <rect x="-96" y="-17" width="104" height="34" rx="17" fill="${C.orange}"/>
    <g transform="translate(-88,0)"><g id="pArmF">
      <rect x="-92" y="-15" width="100" height="30" rx="15" fill="#E57E1E"/>
      <circle cx="-96" cy="0" r="17" fill="${C.skinP}"/>
    </g></g>
  </g></g>
</g>`;
}

function dentist() {
  const arm = (id, px, py, sleeve, back) => `
  <g transform="translate(${px},${py})"><g id="${id}U">
    <rect x="-19" y="-10" width="38" height="128" rx="19" fill="${sleeve}" stroke="${C.coatLine}" stroke-width="3"/>
    <g transform="translate(0,112)"><g id="${id}F">
      <rect x="-17" y="-6" width="34" height="112" rx="17" fill="${sleeve}" stroke="${C.coatLine}" stroke-width="3"/>
      <rect x="-15" y="78" width="30" height="20" rx="6" fill="${C.glove}"/>
      <circle cx="0" cy="110" r="19" fill="${C.glove}" stroke="#6AA6E8" stroke-width="2"/>
    </g></g>
  </g></g>`;
  return `
<g id="dentist"><g id="dFlip">
  <!-- cames -->
  <rect x="528" y="200" width="30" height="210" rx="12" fill="${C.scrub}"/>
  <rect x="566" y="200" width="30" height="210" rx="12" fill="#0B8A89"/>
  <rect x="516" y="398" width="50" height="22" rx="10" fill="#E2E8F0"/>
  <rect x="560" y="398" width="50" height="22" rx="10" fill="#CBD5E1"/>
  ${arm("dArmB", 612, -132, "#F1F5F9", true)}
  <!-- bata -->
  <g id="dTorso">
    <path d="M498 -160 Q562 -188 626 -160 L648 236 Q562 252 476 236Z" fill="${C.coat}" stroke="${C.coatLine}" stroke-width="4"/>
    <path d="M538 -170 L562 -110 L586 -170" fill="${C.scrub}"/>
    <path d="M562 -110 V230" stroke="${C.coatLine}" stroke-width="3"/>
    <path d="M538 -170 L548 -60 M586 -170 L576 -60" stroke="${C.coatLine}" stroke-width="3" fill="none"/>
    <rect x="584" y="-60" width="40" height="46" rx="6" fill="none" stroke="${C.coatLine}" stroke-width="3"/>
    <rect x="596" y="-74" width="6" height="30" rx="3" fill="${C.blue}"/>
  </g>
  <!-- cap -->
  <g transform="translate(560,-178)"><g id="dHead">
    <rect x="-16" y="-14" width="32" height="26" rx="8" fill="${C.skinD}"/>
    <circle cx="-4" cy="-66" r="54" fill="${C.skinD}"/>
    <path d="M-58 -78 Q-50 -134 -2 -134 Q48 -134 54 -78 Q30 -92 -2 -92 Q-34 -92 -58 -78Z" fill="${C.teal}"/>
    <path d="M-58 -78 Q-34 -92 -2 -92 Q30 -92 54 -78" stroke="${C.tealD}" stroke-width="4" fill="none"/>
    <ellipse cx="46" cy="-62" rx="9" ry="14" fill="${C.skinD}" stroke="#9A5F3E" stroke-width="2"/>
    <g id="dEyes">
      <ellipse cx="-32" cy="-70" rx="9" ry="10" fill="#fff"/><circle cx="-36" cy="-69" r="5.5" fill="${C.ink}"/>
      <ellipse cx="-4" cy="-70" rx="9" ry="10" fill="#fff"/><circle cx="-8" cy="-69" r="5.5" fill="${C.ink}"/>
    </g>
    <path d="M-42 -86 Q-32 -91 -22 -86 M-14 -86 Q-4 -91 6 -86" stroke="#2B1A12" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-56 -54 Q-20 -60 26 -54 L22 -26 Q-14 -10 -50 -26Z" fill="${C.mask}" stroke="#2DBFAE" stroke-width="3"/>
    <path d="M-50 -44 H18 M-50 -36 H18" stroke="#2DBFAE" stroke-width="2"/>
    <path d="M24 -50 Q40 -56 44 -62 M22 -30 Q40 -40 44 -56" stroke="#E2E8F0" stroke-width="3" fill="none"/>
  </g></g>
  ${arm("dArmF", 512, -132, "#FFFFFF", false)}
</g></g>`;
}

function chair() {
  return `
<g id="chair">
  <ellipse cx="0" cy="424" rx="190" ry="20" fill="#C3D3E0"/>
  <rect x="-48" y="240" width="96" height="182" rx="18" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="4"/>
  <rect x="-130" y="208" width="260" height="40" rx="16" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="4"/>
  <path d="M-470 160 H140 Q156 160 156 176 V204 Q156 220 140 220 H-470 Q-500 220 -500 190 Q-500 160 -470 160Z" fill="${C.teal}"/>
  <path d="M-470 206 H150" stroke="${C.tealD}" stroke-width="6"/>
  <path d="M130 162 L338 92 Q362 86 370 108 L380 132 Q384 150 364 158 L152 220Z" fill="${C.teal}"/>
  <rect x="352" y="54" width="110" height="52" rx="24" fill="${C.tealD}" transform="rotate(-14 407 80)"/>
</g>`;
}

function lamp() {
  // Pivot al sostre; el cap del llum queda sobre la boca quan rotation = 0.
  return `
<g transform="translate(120,-1150)"><g id="lamp">
  <rect x="-30" y="-20" width="60" height="40" rx="10" fill="#CBD5E1"/>
  <path d="M0 0 L110 760" stroke="#94A3B8" stroke-width="18" stroke-linecap="round"/>
  <circle cx="110" cy="760" r="18" fill="#64748B"/>
  <g transform="translate(130,815) rotate(-24)">
    <rect x="-82" y="-38" width="164" height="70" rx="30" fill="#E2E8F0" stroke="#94A3B8" stroke-width="5"/>
    <rect id="lampFace" x="-64" y="16" width="128" height="20" rx="10" fill="#CBD5E1"/>
  </g>
</g></g>`;
}

function monitorCart() {
  const { x, y, w, h } = MON;
  return `
<g id="cart">
  <rect x="${x - 10}" y="${y + h / 2}" width="20" height="${420 - (y + h / 2)}" fill="#94A3B8"/>
  <rect x="${x - 110}" y="404" width="220" height="16" rx="8" fill="#94A3B8"/>
  <circle cx="${x - 96}" cy="424" r="10" fill="#475569"/><circle cx="${x + 96}" cy="424" r="10" fill="#475569"/>
  <rect x="${x - 120}" y="40" width="240" height="18" rx="9" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3"/>
  <rect x="${x - 96}" y="22" width="192" height="20" rx="6" fill="#334155"/>
  <rect x="${x - w / 2 - 16}" y="${y - h / 2 - 16}" width="${w + 32}" height="${h + 32}" rx="22" fill="#1E293B"/>
  <rect x="${x - 40}" y="${y + h / 2 + 14}" width="80" height="14" rx="7" fill="#334155"/>
</g>`;
}

function clinic() {
  return `
<svg class="layer" style="left:-1400px;top:-1300px" width="2800" height="1900" viewBox="-1400 -1300 2800 1900">
  <defs>
    <linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFF7D1" stop-opacity="0.95"/><stop offset="1" stop-color="#FFF7D1" stop-opacity="0"/>
    </linearGradient>
    <mask id="trailMask" maskUnits="userSpaceOnUse" x="-1400" y="-1300" width="2800" height="1900">
      <path id="trailDraw" d="${TRAIL}" stroke="#fff" stroke-width="40" fill="none" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
    </mask>
  </defs>
  ${monitorCart()}
  ${chair()}
  <path id="cone" d="M196 -330 L300 -350 L420 -10 L250 30Z" fill="url(#gCone)" opacity="0"/>
  ${patient()}
  ${dentist()}
  ${lamp()}
  <path id="trail" d="${TRAIL}" mask="url(#trailMask)"
     fill="none" stroke="${C.blue}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 18" opacity="0.9"/>
</svg>`;
}

// ───────────────────────── art: làmina de la boca ─────────────────────────
function tooth(t, id, fill = "#FBFBF7") {
  return `<g ${id ? `id="${id}"` : ""} transform="translate(${r2(t.x)},${r2(t.y)}) rotate(${r2(t.rot)})">
    <rect x="${r2(-t.w / 2)}" y="${r2(-t.h / 2)}" width="${r2(t.w)}" height="${r2(t.h)}" rx="${r2(t.w * 0.38)}" fill="${fill}" stroke="#D9D3C2" stroke-width="3"/>
    <path d="M${r2(-t.w / 4)} ${r2(-t.h / 2 + 10)} Q0 ${r2(-t.h / 2 + 4)} ${r2(t.w / 4)} ${r2(-t.h / 2 + 10)}" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9"/>
  </g>`;
}

function mouthPlate() {
  const R = rng(42);
  let pap = "";
  for (let i = 0; i < 150; i++) {
    const a = R() * Math.PI * 2, rr = Math.sqrt(R());
    const x = Math.cos(a) * rr * 200, y = 50 + Math.sin(a) * rr * 170;
    if (y < -110 || Math.hypot(x - ULCER.x, y - ULCER.y) < 50) continue;
    pap += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(3 + R() * 3.5)}" fill="#F7A9B3" opacity="${r2(0.45 + R() * 0.4)}"/>`;
  }
  // Vora afilada: dents de serra sobre la vora incisal (cap al centre de la boca).
  const s = SHARP;
  const zig = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const x = -s.w / 2 + 6 + ((s.w - 12) * i) / n;
    zig.push(`${r2(x)} ${r2(i % 2 ? -s.h / 2 - 24 : -s.h / 2 + 4)}`);
  }
  const tongue = "M-235 40 C-245 -80 -120 -128 0 -128 C120 -128 245 -80 235 40 C225 165 120 255 0 255 C-120 255 -225 165 -235 40Z";
  return `
<svg class="layer" style="left:-1600px;top:-1600px" width="3200" height="3200" viewBox="-1600 -1600 3200 3200">
  <defs>
    <radialGradient id="gSkin" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#F5CDAA"/><stop offset="1" stop-color="#D99E77"/>
    </radialGradient>
    <radialGradient id="gThroat" cx="0.5" cy="0.35" r="0.6">
      <stop offset="0" stop-color="#2A0710"/><stop offset="1" stop-color="#6E1F31"/>
    </radialGradient>
    <radialGradient id="gTongue" cx="0.5" cy="0.4" r="0.65">
      <stop offset="0" stop-color="#EE95A0"/><stop offset="1" stop-color="#D46473"/>
    </radialGradient>
    <radialGradient id="gMirror" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#CBD5E1"/><stop offset="1" stop-color="#64748B"/>
    </radialGradient>
    <pattern id="gGauze" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="#FFFFFF"/><path d="M0 7H14M7 0V14" stroke="#E2E8F0" stroke-width="2"/>
    </pattern>
  </defs>
  <rect x="-1600" y="-1600" width="3200" height="3200" fill="url(#gSkin)"/>
  <ellipse cx="0" cy="10" rx="470" ry="410" fill="#C35C68"/>
  <ellipse cx="0" cy="10" rx="410" ry="352" fill="url(#gThroat)"/>
  <path d="M-150 -120 Q0 -260 150 -120" stroke="#9E3448" stroke-width="18" fill="none"/>
  <ellipse cx="0" cy="-150" rx="24" ry="40" fill="#B4485A"/>
  <!-- genives i dents de dalt -->
  <path d="M-340 -150 Q0 -420 340 -150 L300 -120 Q0 -360 -300 -120Z" fill="#E58A93"/>
  ${upperTeeth.map((t) => tooth(t)).join("")}
  <!-- genives i dents de baix -->
  <path d="M-330 200 Q0 440 330 200 L290 170 Q0 380 -290 170Z" fill="#E58A93"/>
  ${lowerTeeth.map((t, i) => (i === SHARP.i ? "" : tooth(t))).join("")}
  <g id="sharpTooth">${tooth(SHARP, "", "#FBFBF7")}</g>
  <g transform="translate(${r2(s.x)},${r2(s.y)}) rotate(${r2(s.rot)})">
    <path id="sharpEdge" d="M${zig.join(" L")}" fill="#FFE4E6" stroke="${C.red}" stroke-width="8" stroke-linejoin="round" opacity="0"/>
  </g>
  <!-- llengua (pivot a l'arrel) -->
  <g transform="translate(0,-120)"><g id="tongue"><g transform="translate(0,120)">
    <g id="dorsal">
      <path d="${tongue}" fill="url(#gTongue)"/>
      <path d="M0 -100 Q8 60 0 190" stroke="#C25566" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.7"/>
      ${pap}
      <ellipse id="hlTop" cx="0" cy="10" rx="150" ry="110" fill="#FFFFFF" opacity="0"/>
      <ellipse id="hlL" cx="-200" cy="60" rx="46" ry="120" fill="#FFFFFF" opacity="0"/>
      <ellipse id="hlR" cx="200" cy="60" rx="46" ry="120" fill="#FFFFFF" opacity="0"/>
      <g transform="translate(${ULCER.x},${ULCER.y}) rotate(${ULCER.rot})">
        <ellipse id="ulcerHalo" rx="40" ry="27" fill="#E0444F" opacity="0.85"/>
        <ellipse rx="25" ry="15" fill="#F4E3B5"/>
        <ellipse rx="12" ry="6" fill="#FBF3DC"/>
      </g>
    </g>
    <g id="ventral" opacity="0">
      <path d="M-190 -40 C-200 -140 -100 -170 0 -170 C100 -170 200 -140 190 -40 C180 40 100 90 0 90 C-100 90 -180 40 -190 -40Z" fill="#E9A0AB"/>
      <path d="M0 -150 V80" stroke="#C65E70" stroke-width="12" stroke-linecap="round"/>
      <path d="M-40 -150 Q-60 -40 -30 70 M40 -150 Q60 -40 30 70" stroke="#6D7FCC" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.8"/>
    </g>
  </g></g></g>
  <!-- anotacions de l'úlcera -->
  <g transform="translate(${ULCER.x},${ULCER.y})">
    <circle id="ulcerRing" r="62" fill="none" stroke="${C.red}" stroke-width="8" opacity="0"/>
    <g id="ruler" opacity="0" transform="rotate(${ULCER.rot})">
      <path d="M-40 -46 H40" stroke="${C.blue}" stroke-width="6" stroke-linecap="round"/>
      <path d="M-40 -58 V-34 M40 -58 V-34 M-20 -52 V-40 M0 -52 V-40 M20 -52 V-40" stroke="${C.blue}" stroke-width="5" stroke-linecap="round"/>
    </g>
    <ellipse id="ulcerOutline" rx="34" ry="22" transform="rotate(${ULCER.rot})" fill="none" stroke="${C.blue}" stroke-width="5" stroke-dasharray="10 8" opacity="0"/>
    <g id="pin" opacity="0"><g transform="translate(-30,-150)">${icon("map-pin", 60, C.red)}</g></g>
  </g>
  <!-- contacte dent-úlcera -->
  <path id="link" d="M${ULCER.x + 14} ${ULCER.y + 26} L${r2(SHARP.x - 12)} ${r2(SHARP.y - 34)}" stroke="${C.red}" stroke-width="7" stroke-dasharray="12 9" stroke-linecap="round" opacity="0"/>
  <g id="spark" opacity="0" transform="translate(${r2((ULCER.x + SHARP.x) / 2 + 10)},${r2((ULCER.y + SHARP.y) / 2)})">
    <path d="M0 -26 V-10 M0 10 V26 M-26 0 H-10 M10 0 H26 M-18 -18 L-9 -9 M9 9 L18 18 M18 -18 L9 -9 M-9 9 L-18 18" stroke="#FACC15" stroke-width="6" stroke-linecap="round"/>
  </g>
  <!-- escaneig general -->
  <circle id="scan" r="360" fill="none" stroke="${C.teal}" stroke-width="10" stroke-dasharray="40 30" opacity="0"/>
  <!-- gasa i dits -->
  <g id="gauze" opacity="0">
    <g transform="translate(-40,250) rotate(-14)">
      <rect x="-95" y="-70" width="190" height="140" rx="22" fill="url(#gGauze)" stroke="#CBD5E1" stroke-width="4"/>
    </g>
    <path d="M-260 520 Q-200 360 -110 300 Q-80 290 -66 312 Q-120 380 -150 520Z" fill="${C.glove}" stroke="#6AA6E8" stroke-width="4"/>
    <path d="M-200 540 Q-120 380 -20 310 Q10 298 20 322 Q-50 400 -90 540Z" fill="${C.glove}" stroke="#6AA6E8" stroke-width="4"/>
  </g>
  <!-- mirall -->
  <g id="mirror" opacity="0">
    <path d="M0 0 L60 140 L420 900" stroke="#94A3B8" stroke-width="22" stroke-linecap="round" fill="none"/>
    <circle r="62" fill="url(#gMirror)" stroke="#475569" stroke-width="8"/>
    <ellipse cx="-16" cy="-18" rx="20" ry="12" fill="#fff" opacity="0.8" transform="rotate(-30 -16 -18)"/>
  </g>
  <!-- sonda -->
  <g id="probe" opacity="0">
    <path d="M0 0 Q-24 -10 -20 -36 M-20 -36 Q-12 -50 6 -44" stroke="#64748B" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M0 0 L40 90 L360 880" stroke="#94A3B8" stroke-width="18" stroke-linecap="round" fill="none"/>
  </g>
</svg>`;
}

// ───────────────────────── HTML: bombolles, targetes, pantalla ─────────────────────────
const questions = [
  { icon: "clock", q: "Quan va aparèixer la ferida?", a: "Fa uns deu dies", at: () => P("quan"), ans: () => E("sortir") + 0.05 },
  { icon: "lightning", q: "Et fa mal o notes molèsties?", a: "Sí, quan menjo", at: () => P("et"), ans: () => E("mal") + 0.05 },
  { icon: "arrow-counter-clockwise", q: "Has tingut ferides semblants abans?", a: "No, mai", at: () => P("n'havies"), ans: () => E("abans") + 0.02 },
  { icon: "pill", q: "Prens alguna medicació?", a: "No", at: () => P("prens"), ans: () => E("medicació") + 0.02 },
  { icon: "heartbeat", q: "Tens alguna malaltia important?", a: "Cap", at: () => P("malalties", 1), ans: () => E("malalties", 1) + 0.02 },
  { icon: "warning-circle", q: "Tens alguna al·lèrgia?", a: "Cap", at: () => P("al·lèrgies"), ans: () => E("al·lèrgies") + 0.02 },
];
const history = [
  ["Inici", "fa uns deu dies"],
  ["Dolor", "sí, en menjar"],
  ["Antecedents", "cap ferida igual"],
  ["Medicació", "no en pren"],
  ["Malalties", "cap"],
  ["Al·lèrgies", "cap"],
];
const measures = [
  { icon: "ruler", k: "Mida", v: "6 mm", w: "mida" },
  { icon: "polygon", k: "Forma", v: "ovalada", w: "forma" },
  { icon: "palette", k: "Color", v: "groc i vermell", w: "color" },
  { icon: "map-pin", k: "Localització", v: "vora lateral", w: "localització" },
];

function worldHTML() {
  const qIcons = questions
    .map((q, i) => `<div class="qIcon" id="qIcon${i}">${icon(q.icon, 44, "#fff")}</div>`)
    .join("");
  const qTexts = questions.map((q, i) => `<div class="qText" id="qText${i}">${q.q}</div>`).join("");
  const aTexts = questions.map((q, i) => `<div class="aText" id="aText${i}">${q.a}</div>`).join("");
  const dots = questions.map((_, i) => `<i id="qDot${i}"></i>`).join("");
  const hist = history
    .map(([k, v], i) => `<div class="hRow" id="hRow${i}"><b>${k}:</b> <span class="type" id="hVal${i}">${v}</span></div>`)
    .join("");
  const plateCards = measures
    .map(
      (m, i) => `<div class="mRow" id="mRow${i}"><div class="mIcon">${icon(m.icon, 38, C.blue)}</div>
        <div class="mTxt"><b>${m.k}</b><span>${m.v}</span></div><div class="mCheck" id="mCheck${i}">${icon("check-circle", 44, C.green)}</div></div>`,
    )
    .join("");
  const tag = (id, n, label, p) =>
    `<div class="tagWrap" style="left:${p.x}px;top:${p.y}px"><div class="tag" id="${id}"><span>${n}</span>${label}</div></div>`;
  return `
${tag("tag1", 1, "ANAMNESI", TAG.a)}
${tag("tag2", 2, "EXPLORACIÓ", TAG.b)}
${tag("tag3", 3, "DIAGNÒSTIC", TAG.c)}

<!-- ganxo: lupa amb l'úlcera -->
<div class="anchor" style="left:${HEAD.x - 150}px;top:${HEAD.y - 205}px">
  <div id="lens">
    <svg width="190" height="190" viewBox="-260 -230 520 520">
      <rect x="-300" y="-300" width="600" height="600" fill="#6E1F31"/>
      <path d="M-235 40 C-245 -80 -120 -128 0 -128 C120 -128 245 -80 235 40 C225 165 120 255 0 255 C-120 255 -225 165 -235 40Z" fill="#E57C8A"/>
      <path d="M0 -100 Q8 60 0 190" stroke="#C25566" stroke-width="10" fill="none" opacity="0.7"/>
      <g transform="translate(${ULCER.x - 20},${ULCER.y}) rotate(${ULCER.rot})"><ellipse id="lensHalo" rx="52" ry="36" fill="#E0444F"/><ellipse rx="32" ry="19" fill="#F4E3B5"/></g>
    </svg>
  </div>
</div>
<div class="anchor" style="left:${HEAD.x + 60}px;top:${HEAD.y - 120}px"><div id="pain">${icon("lightning", 46, C.red)}</div></div>
<div class="anchor" style="left:${HEAD.x + 70}px;top:${HEAD.y - 210}px"><div id="qmark">?</div></div>

<!-- anamnesi -->
<div class="anchor" style="left:${168}px;top:${-520}px">
  <div id="qBubble"><div class="qIconBox">${qIcons}</div><div class="qTextBox">${qTexts}</div><div class="dots">${dots}</div></div>
</div>
<div class="anchor" style="left:${10}px;top:${-300}px">
  <div id="aBubble"><div class="aTextBox">${aTexts}</div></div>
</div>

<!-- ordinador -->
<div id="screen" style="left:${MON.x - MON.w / 2}px;top:${MON.y - MON.h / 2}px;width:${MON.w}px;height:${MON.h}px">
  <div id="scrHist">
    <div class="scrTitle">${icon("clipboard-text", 22, C.blue)}<span>Història clínica · Pau R.</span></div>
    ${hist}
    <div id="caret"></div>
  </div>
  <div id="scrDiag">
    <div id="cardA" class="dCard">${icon("chat-teardrop-text", 24, C.blue)}<b>Anamnesi</b></div>
    <div id="plus">+</div>
    <div id="cardB" class="dCard">${icon("magnifying-glass", 24, C.blue)}<b>Exploració</b></div>
    <div id="cardD">
      <div class="dHead">${icon("tooth", 22, C.red)}<span>Diagnòstic</span></div>
      <div id="dxTitle">Úlcera traumàtica lingual</div>
      <div id="dxCause">Fregament repetit amb una <b>dent afilada</b></div>
      <div id="stamp">${icon("seal-check", 20, C.red)}CONFIRMAT</div>
    </div>
    <div id="nf1" class="nf">${icon("virus", 22, "#7C3AED")}<span>Infecció</span><em id="nf1ok">${icon("check-circle", 22, C.green)}descartada</em></div>
    <div id="nf2" class="nf">${icon("heartbeat", 22, "#7C3AED")}<span>Altres malalties</span><em id="nf2ok">${icon("check-circle", 22, C.green)}descartades</em></div>
  </div>
</div>

<!-- làmina de la boca (escala K) -->
<div id="plate" style="left:${MOUTH.x}px;top:${MOUTH.y}px">
  <div id="plateClip">
    <div class="plateInner">
      ${mouthPlate()}
      <div id="mCard" style="left:-350px;top:-130px">${plateCards}</div>
      <div id="ulcerChip" style="left:${ULCER.x - 140}px;top:${ULCER.y - 230}px">${icon("warning-circle", 40, "#fff")}Úlcera</div>
      <div id="counter" style="left:20px;top:-120px">
        <div class="cLabel">${icon("arrows-left-right", 34, C.red)}Fregaments</div>
        <div class="cNum"><div class="roll" id="roll">${Array.from({ length: 11 }, (_, i) => `<div>${i === 10 ? "+1.000" : (i * 100).toLocaleString("ca-ES")}</div>`).join("")}</div></div>
      </div>
      <div id="sharpChip" style="left:${r2(SHARP.x - 230)}px;top:${r2(SHARP.y + 70)}px">${icon("warning-circle", 40, "#fff")}Vora afilada</div>
    </div>
  </div>
</div>`;
}

const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.wall};font-family:Inter,sans-serif;color:${C.ink}}
#cam{position:absolute;left:540px;top:990px;width:0;height:0}
#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
.anchor,.tagWrap{position:absolute;width:0;height:0}
.tag{position:absolute;transform-origin:0 50%;display:flex;align-items:center;gap:18px;padding:14px 34px 14px 14px;border-radius:999px;background:#fff;box-shadow:0 12px 34px rgba(15,23,42,.16);font-weight:900;font-size:68px;letter-spacing:.01em;white-space:nowrap;left:-20px;top:-50px;opacity:0}
.tag span{display:grid;place-items:center;width:76px;height:76px;border-radius:50%;background:${C.blue};color:#fff;font-size:46px}
#lens{position:absolute;left:0;top:0;width:190px;height:190px;border-radius:50%;overflow:hidden;border:7px solid #fff;box-shadow:0 12px 30px rgba(15,23,42,.25);opacity:0}
#lens svg{display:block}
#pain{position:absolute;left:0;top:0;opacity:0}
#qmark{position:absolute;left:0;top:0;font-weight:900;font-size:150px;line-height:1;color:${C.red};opacity:0;text-shadow:0 8px 0 rgba(225,29,72,.18)}
#qBubble{position:absolute;left:0;top:0;width:470px;min-height:118px;background:#fff;border-radius:30px;box-shadow:0 14px 34px rgba(15,23,42,.16);opacity:0;padding:20px 24px 34px 98px}
#qBubble:after{content:"";position:absolute;right:70px;bottom:-26px;border:16px solid transparent;border-top:18px solid #fff;border-right-width:4px}
.qIconBox{position:absolute;left:18px;top:20px;width:66px;height:66px;border-radius:20px;background:${C.blue}}
.qIcon{position:absolute;inset:0;display:grid;place-items:center;opacity:0}
.qTextBox{position:relative;height:80px}
.qText{position:absolute;left:0;top:0;right:0;font-weight:700;font-size:34px;line-height:1.15;opacity:0}
.dots{position:absolute;left:98px;bottom:14px;display:flex;gap:8px}
.dots i{display:block;width:14px;height:14px;border-radius:50%;background:#E2E8F0}
#aBubble{position:absolute;left:0;top:0;width:290px;height:74px;background:${C.orange};border-radius:26px;color:#fff;opacity:0;box-shadow:0 12px 26px rgba(242,140,40,.3)}
#aBubble:after{content:"";position:absolute;right:30px;bottom:-22px;border:14px solid transparent;border-top:16px solid ${C.orange};border-left-width:4px}
.aTextBox{position:relative;width:100%;height:100%}
.aText{position:absolute;inset:0;display:grid;place-items:center;font-weight:900;font-size:32px;opacity:0;white-space:nowrap}
#screen{position:absolute;border-radius:10px;background:#F8FAFC;overflow:hidden}
#scrHist,#scrDiag{position:absolute;inset:0;padding:18px 20px}
.scrTitle{display:flex;align-items:center;gap:8px;font-weight:900;font-size:21px;padding-bottom:8px;margin-bottom:8px;border-bottom:2px solid #E2E8F0}
.hRow{font-size:19.5px;line-height:1.5;white-space:nowrap}
.hRow b{font-weight:700;color:${C.ink2}}
.hRow .type{display:inline-block;clip-path:inset(0 100% 0 0);color:${C.ink};font-weight:700}
#caret{position:absolute;width:3px;height:22px;background:${C.blue};left:20px;top:60px;opacity:0}
#scrDiag{opacity:0}
.dCard{position:absolute;top:24px;width:150px;height:84px;border-radius:14px;background:#fff;box-shadow:0 6px 16px rgba(15,23,42,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:18.5px;opacity:0}
#cardA{left:20px}#cardB{right:20px}
#plus{position:absolute;left:0;right:0;top:44px;text-align:center;font-weight:900;font-size:36px;color:${C.blue};opacity:0}
#cardD{position:absolute;left:18px;right:18px;top:16px;height:142px;border-radius:16px;background:#fff;box-shadow:0 8px 20px rgba(15,23,42,.14);padding:12px 16px;opacity:0;border-left:8px solid ${C.red}}
.dHead{display:flex;align-items:center;gap:6px;font-weight:900;font-size:19px;color:${C.red};letter-spacing:.06em;text-transform:uppercase}
#dxTitle{font-weight:900;font-size:22px;margin-top:6px;clip-path:inset(0 100% 0 0)}
#dxCause{font-size:18.5px;margin-top:4px;color:${C.ink2};clip-path:inset(0 100% 0 0)}
#dxCause b{color:${C.red}}
#stamp{position:absolute;right:10px;top:8px;display:flex;align-items:center;gap:4px;padding:4px 10px;border:3px solid ${C.red};border-radius:8px;color:${C.red};font-weight:900;font-size:18px;opacity:0;transform-origin:50% 50%}
.nf{position:absolute;left:18px;right:18px;height:38px;border-radius:12px;background:#fff;box-shadow:0 6px 14px rgba(15,23,42,.12);display:flex;align-items:center;gap:8px;padding:0 12px;font-weight:700;font-size:18.5px;opacity:0}
#nf1{top:170px}#nf2{top:212px}
.nf em{margin-left:auto;display:flex;align-items:center;gap:4px;font-style:normal;color:${C.green};font-weight:900;font-size:18.5px;opacity:0}
#plate{position:absolute;width:0;height:0;transform:scale(${K});transform-origin:0 0}
#plateClip{position:absolute;left:-1600px;top:-1600px;width:3200px;height:3200px;clip-path:circle(0px at 1600px 1600px)}
.plateInner{position:absolute;left:1600px;top:1600px;width:0;height:0}
#mCard{position:absolute;width:470px;background:#fff;border-radius:30px;box-shadow:0 18px 40px rgba(15,23,42,.28);padding:20px 22px;opacity:0}
.mRow{display:flex;align-items:center;gap:14px;padding:10px 0;border-bottom:2px solid #EEF2F6}
.mRow:last-child{border-bottom:0}
.mIcon{flex:none;width:58px;height:58px;border-radius:16px;background:#EFF6FF;display:grid;place-items:center}
.mTxt{display:flex;flex-direction:column;line-height:1.1}
.mTxt b{font-weight:900;font-size:40px}
.mTxt span{font-weight:700;font-size:36px;white-space:nowrap;color:${C.ink2};opacity:0}
.mCheck{margin-left:auto;opacity:0}
.mRow{opacity:.35}
#ulcerChip,#sharpChip{position:absolute;display:flex;align-items:center;gap:10px;padding:10px 22px 10px 14px;border-radius:999px;background:${C.red};color:#fff;font-weight:900;font-size:34px;white-space:nowrap;opacity:0;box-shadow:0 10px 24px rgba(225,29,72,.35)}
#counter{position:absolute;width:330px;background:#fff;border-radius:28px;padding:18px 22px;box-shadow:0 18px 40px rgba(15,23,42,.28);opacity:0}
.cLabel{display:flex;align-items:center;gap:10px;font-weight:900;font-size:30px}
.cNum{height:64px;overflow:hidden;margin-top:6px}
.roll div{height:64px;font-weight:900;font-size:56px;line-height:64px;color:${C.red};font-variant-numeric:tabular-nums}
`;

// ───────────────────────── línia de temps ─────────────────────────
const T = []; // instruccions GSAP (cadenes)
const at = (t) => r2(Math.max(0, t));
const add = (s) => T.push(s);
const to = (sel, vars, t) => add(`tl.to(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${at(t)});`);
const fromTo = (sel, a, b, t) => add(`tl.fromTo(${JSON.stringify(sel)}, ${JSON.stringify(a)}, ${JSON.stringify(b)}, ${at(t)});`);
const set = (sel, vars, t) => add(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${at(t)});`);

const SFX = []; // { file, t, vol }
const sfx = (file, t, vol = 0.5) => SFX.push({ file, t: Math.max(0, +t.toFixed(3)), vol });

// Càmera: centre (x, y) del món a la pantalla, escala s.
let camState = { x: 0, y: 0, s: 1 };
function cam(t, x, y, s, dur = 0.9, ease = "power2.inOut", opts = {}) {
  to("#zoom", { scale: s, duration: dur, ease }, t);
  to("#pan", { x: -x, y: -y, duration: dur, ease }, t);
  to("#bgpan", { x: -x * 0.82, y: -y * 0.82, duration: dur, ease }, t);
  const far = Math.hypot(x - camState.x, y - camState.y) * Math.max(s, camState.s) > 700 || Math.abs(Math.log(s / camState.s)) > 0.9;
  if ((far || opts.blur) && opts.blur !== false) {
    to("#zoom", { filter: "blur(3.5px)", duration: dur * 0.45, ease: "power2.in" }, t);
    to("#zoom", { filter: "blur(0px)", duration: dur * 0.55, ease: "power2.out" }, t + dur * 0.45);
    if (opts.whoosh !== false) sfx(pick("whoosh"), t + dur * 0.15, 0.32);
  }
  camState = { x, y, s };
}
let pickN = {};
function pick(kind) {
  const n = (pickN[kind] = (pickN[kind] || 0) + 1);
  const files = { whoosh: ["whoosh1", "whoosh2", "whoosh3"], pop: ["pop1", "pop2"], click: ["click1"] }[kind];
  return files[(n - 1) % files.length];
}
const pop = (sel, t, extra = {}) => {
  fromTo(sel, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)", ...extra }, t);
};

// Pivots dels grups SVG (coordenades locals del pare).
add(`gsap.set(["#pArmU","#pArmF","#pHead","#dArmFU","#dArmFF","#dArmBU","#dArmBF","#dHead","#lamp","#tongue"], {svgOrigin:"0 0"});`);
add(`gsap.set("#pChest", {svgOrigin:"200 166"});`);
add(`gsap.set("#dTorso", {svgOrigin:"562 236"});`);
add(`gsap.set("#dFlip", {svgOrigin:"562 0"});`);
add(`gsap.set("#pEye", {svgOrigin:"10 -36"});`);
add(`gsap.set("#dEyes", {svgOrigin:"-18 -70"});`);
add(`gsap.set("#pMouthOpen", {svgOrigin:"0 0", scale:0});`);
add(`gsap.set("#ventral", {svgOrigin:"0 -170"});`);
add(`gsap.set("#dorsal", {svgOrigin:"0 -128"});`);
add(`gsap.set("#plantLeaves", {svgOrigin:"0 -120"});`);
add(`gsap.set(["#clockMin","#clockHr"], {svgOrigin:"0 0"});`);
add(`gsap.set("#ulcerRing", {svgOrigin:"0 0"});`);
add(`gsap.set("#scan", {svgOrigin:"0 0"});`);
add(`gsap.set("#stamp", {rotation:-8});`);

// ── vida contínua: respiració, parpelleig, planta, rellotge, pols ──
{
  const breaths = Math.ceil(DUR / 3.2);
  fromTo("#pChest", { scaleY: 1 }, { scaleY: 1.035, duration: 1.6, ease: "sine.inOut", repeat: breaths * 2 - 1, yoyo: true }, 0);
  fromTo("#dTorso", { scaleY: 1 }, { scaleY: 1.012, duration: 1.8, ease: "sine.inOut", repeat: Math.ceil(DUR / 1.8), yoyo: true }, 0.4);
  fromTo("#plantLeaves", { rotation: -2 }, { rotation: 2, duration: 2.6, ease: "sine.inOut", repeat: Math.ceil(DUR / 2.6), yoyo: true }, 0);
  fromTo("#clockMin", { rotation: 40 }, { rotation: 40 + DUR * 6, duration: DUR, ease: "none" }, 0);
  fromTo("#clockHr", { rotation: 200 }, { rotation: 200 + DUR * 0.5, duration: DUR, ease: "none" }, 0);
  const R = rng(3);
  for (let i = 0; i < 14; i++) {
    fromTo(`#dust${i}`, { x: 0, y: 0 }, { x: r2((R() - 0.5) * 120), y: r2(-60 - R() * 120), duration: DUR, ease: "none" }, 0);
  }
  // parpelleigs
  const blink = (sel, t) => {
    to(sel, { scaleY: 0.1, duration: 0.07, ease: "power2.in" }, t);
    to(sel, { scaleY: 1, duration: 0.1, ease: "power2.out" }, t + 0.08);
  };
  const Rb = rng(11);
  for (let t = 1.2; t < DUR - 0.5; t += 2.6 + Rb() * 1.6) blink("#dEyes", t);
  for (let t = 2.0; t < DUR - 0.5; t += 3.0 + Rb() * 1.8) blink("#pEye", t);
}

// ── posicions inicials ──
set("#lamp", { rotation: 62 }, 0);
set("#pArmU", { rotation: -14 }, 0);
set("#pArmF", { rotation: 6 }, 0);
set("#dArmFU", { rotation: 10 }, 0);
set("#dArmFF", { rotation: 4 }, 0);
set("#dArmBU", { rotation: -6 }, 0);
set("#dArmBF", { rotation: 4 }, 0);


// ═════════ GANXO ═════════
{
  const t0 = 0;
  // Arrencada amb cop de zoom sobre la cara.
  set("#zoom", { scale: 4.2 }, 0);
  set("#pan", { x: -(HEAD.x - 30), y: -(HEAD.y - 70) }, 0);
  set("#bgpan", { x: -(HEAD.x - 30) * 0.82, y: -(HEAD.y - 70) * 0.82 }, 0);
  camState = { x: HEAD.x - 30, y: HEAD.y - 70, s: 4.2 };
  cam(0.0, HEAD.x - 40, HEAD.y - 60, 2.7, 0.7, "expo.out", { whoosh: false, blur: false });
  sfx("impact", 0.0, 0.5);
  // El pacient es toca la galta (dolor).
  to("#pArmU", { rotation: -4, duration: 0.4, ease: "back.out(1.6)" }, 0.05);
  to("#pArmF", { rotation: 40, duration: 0.4, ease: "back.out(1.6)" }, 0.1);
  to("#pBrow", { attr: { d: "M2 -54 Q12 -48 22 -56" }, duration: 0.3 }, 0.15);
  // Lupa amb la llengua i l'úlcera.
  pop("#lens", P("ferida") - 0.05);
  sfx("pop1", P("ferida"), 0.45);
  fromTo("#pain", { opacity: 0, scale: 0.3, rotation: -20 }, { opacity: 1, scale: 1.25, rotation: 0, duration: 0.35, ease: "back.out(3)" }, P("ferida") + 0.15);
  // «llengua»: l'úlcera batega.
  fromTo("#lensHalo", { scale: 1 }, { scale: 1.35, duration: 0.25, ease: "power2.out", repeat: 5, yoyo: true, transformOrigin: "50% 50%" }, P("llengua", 1));
  // «no es cura»: sacsejada de la lupa.
  fromTo("#lens", { rotation: 0 }, { rotation: 6, duration: 0.07, repeat: 5, yoyo: true, ease: "sine.inOut" }, P("cura"));
  // «D'on surt?»: interrogant.
  fromTo("#qmark", { opacity: 0, y: -160, rotation: -25 }, { opacity: 1, y: 0, rotation: 8, duration: 0.5, ease: "bounce.out" }, P("d'on") - 0.05);
  sfx("pop2", P("d'on") + 0.1, 0.4);
}

// ═════════ ESCENA 1 · ANAMNESI ═════════
{
  // Revelació de la consulta.
  const tReveal = E("surt") + 0.05;
  cam(tReveal - 0.1, 330, -200, 0.8, 0.85);
  to("#lens", { scale: 0.05, x: 140, y: 150, opacity: 0, duration: 0.5, ease: "power3.in" }, tReveal);
  to(["#qmark", "#pain"], { opacity: 0, scale: 0.4, duration: 0.3, ease: "power2.in" }, tReveal);
  to("#pArmU", { rotation: -14, duration: 0.6, ease: "power2.inOut" }, tReveal);
  to("#pArmF", { rotation: 6, duration: 0.6, ease: "power2.inOut" }, tReveal);
  to("#pBrow", { attr: { d: "M2 -50 Q12 -56 22 -50" }, duration: 0.3 }, tReveal + 0.3);

  // «Pas u: l'anamnesi»
  const tPas = P("pas", 1);
  cam(tPas, 300, -255, 1.35, 0.8);
  fromTo("#tag1", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, P("anamnesi") - 0.1);
  sfx("pop1", P("anamnesi"), 0.4);
  to("#dHead", { rotation: -8, duration: 0.5, ease: "power2.inOut" }, tPas + 0.3);

  // Preguntes i respostes (la bombolla es transforma al seu lloc).
  questions.forEach((q, i) => {
    const tq = q.at() - 0.08;
    if (i === 0) fromTo("#qBubble", { opacity: 0, scale: 0.6, transformOrigin: "80% 100%" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, tq);
    else {
      to("#qBubble", { scale: 1.04, duration: 0.1, ease: "power2.out", transformOrigin: "80% 100%" }, tq);
      to("#qBubble", { scale: 1, duration: 0.2, ease: "power2.out" }, tq + 0.1);
      to(`#qText${i - 1}`, { opacity: 0, y: -16, duration: 0.15, ease: "power2.in" }, tq);
      to(`#qIcon${i - 1}`, { opacity: 0, rotation: -90, scale: 0.4, duration: 0.15 }, tq);
    }
    fromTo(`#qText${i}`, { opacity: 0, y: 18, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.22, ease: "power3.out" }, tq + 0.06);
    fromTo(`#qIcon${i}`, { opacity: 0, rotation: 90, scale: 0.4 }, { opacity: 1, rotation: 0, scale: 1, duration: 0.3, ease: "back.out(2)" }, tq + 0.04);
    to(`#qDot${i}`, { backgroundColor: C.blue, duration: 0.2 }, tq + 0.05);
    sfx(pick("pop"), tq + 0.05, 0.22);
    // la dentista assenteix
    to("#dHead", { rotation: -12, duration: 0.15, ease: "power2.out" }, tq);
    to("#dHead", { rotation: -8, duration: 0.25, ease: "power2.inOut" }, tq + 0.15);
    // resposta del pacient
    const ta = q.ans();
    if (i === 0) fromTo("#aBubble", { opacity: 0, scale: 0.5, transformOrigin: "85% 100%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, ta);
    else {
      to(`#aText${i - 1}`, { opacity: 0, duration: 0.1 }, ta - 0.02);
      to("#aBubble", { scale: 1.08, duration: 0.08, transformOrigin: "85% 100%" }, ta);
      to("#aBubble", { scale: 1, duration: 0.18 }, ta + 0.08);
    }
    fromTo(`#aText${i}`, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)" }, ta + 0.03);
    // boca del pacient parlant
    fromTo("#pMouthOpen", { scale: 0 }, { scale: 0.55, duration: 0.08, repeat: 3, yoyo: true, ease: "sine.inOut" }, ta);
  });

  // «Tot va a la història clínica»
  const tTot = P("tot");
  cam(tTot - 0.05, MON.x - 30, MON.y + 10, 2.45, 0.8);
  to(["#qBubble", "#aBubble"], { opacity: 0, duration: 0.25 }, tTot + 0.2);
  to("#dHead", { rotation: 4, duration: 0.4, ease: "power2.inOut" }, tTot);
  to("#dArmFU", { rotation: -38, duration: 0.5, ease: "power2.inOut" }, tTot);
  to("#dArmFF", { rotation: -50, duration: 0.5, ease: "power2.inOut" }, tTot);
  const tH = P("història") - 0.05;
  const span = Math.max(1.3, P("pas", 2) - tH - 0.25);
  history.forEach((_, i) => {
    const t = tH + (span * i) / history.length;
    const d = (span / history.length) * 0.85;
    to(`#hVal${i}`, { clipPath: "inset(0 0% 0 0)", duration: d, ease: "steps(12)" }, t);
    set("#caret", { opacity: 1, top: 62 + i * 29.25 }, t);
    sfx("keys", t, 0.2);
  });
  set("#caret", { opacity: 0 }, tH + span + 0.05);
  // teclejant
  fromTo("#dArmFF", { rotation: -50 }, { rotation: -44, duration: 0.09, repeat: Math.floor(span / 0.09), yoyo: true }, tH);
}

// ═════════ ESCENA 2 · EXPLORACIÓ ═════════
const plateCam = (t, lx, ly, f = 1, dur = 0.7, ease = "power2.inOut", opts = {}) => {
  const p = PL(lx, ly);
  cam(t, p.x, p.y, (1 / K) * 0.96 * f, dur, ease, opts);
};
{
  const tPas = P("pas", 2);
  cam(tPas - 0.05, 470, -330, 0.7, 0.9);
  to("#trailDraw", { strokeDashoffset: 560, duration: 0.8, ease: "power2.inOut" }, tPas + 0.1);
  fromTo("#tag2", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, P("exploració", 1) - 0.1);
  sfx("pop2", P("exploració", 1), 0.4);
  // la dentista torna cap al pacient
  to("#dHead", { rotation: -10, duration: 0.4 }, tPas);
  to("#dArmFU", { rotation: 10, duration: 0.5, ease: "power2.inOut" }, tPas);
  to("#dArmFF", { rotation: 4, duration: 0.5, ease: "power2.inOut" }, tPas);

  // «Llum encès»
  const tL = P("llum");
  to(["#tag1", "#tag2", "#trail"], { opacity: 0, duration: 0.25 }, tL - 0.05);
  cam(tL, HEAD.x - 10, HEAD.y - 150, 1.55, 0.8);
  to("#lamp", { rotation: 0, duration: 0.7, ease: "back.out(1.2)" }, tL - 0.1);
  sfx("click1", P("encès"), 0.5);
  to("#cone", { opacity: 1, duration: 0.25, ease: "power2.out" }, P("encès"));
  to("#lampFace", { fill: "#FFF3B0", duration: 0.2 }, P("encès"));
  // «obre la boca»
  to("#pMouthOpen", { scale: 1.25, duration: 0.35, ease: "back.out(2)" }, P("obre"));
  to("#pMouthLine", { opacity: 0, duration: 0.1 }, P("obre"));
  to("#dArmFU", { rotation: 58, duration: 0.6, ease: "power2.inOut" }, P("obre"));
  to("#dArmFF", { rotation: 30, duration: 0.6, ease: "power2.inOut" }, P("obre"));
  to("#dHead", { rotation: -16, duration: 0.5 }, P("obre"));

  // «mirada general»: entrem a la boca.
  const tIn = P("boca") + 0.1;
  plateCam(tIn, 0, 40, 1, 0.85, "power3.inOut");
  to("#plateClip", { clipPath: "circle(1800px at 1600px 1600px)", duration: 0.75, ease: "power3.in" }, tIn + 0.05);
  fromTo("#scan", { opacity: 0, scale: 0.6, rotation: 0 }, { opacity: 1, scale: 1, rotation: 120, duration: 0.9, ease: "power2.out" }, P("mirada"));
  to("#scan", { opacity: 0, rotation: 200, duration: 0.5, ease: "power2.in" }, P("general") + 0.5);
  sfx(pick("whoosh"), P("mirada"), 0.25);

  // «Amb el mirall, la llengua per dalt, pels costats i per sota.»
  const tM = P("mirall", 1);
  fromTo("#mirror", { opacity: 0, x: 420, y: 520 }, { opacity: 1, x: 130, y: 180, duration: 0.45, ease: "power3.out" }, tM - 0.1);
  to("#mirror", { x: 0, y: -10, duration: 0.4, ease: "power2.inOut" }, P("dalt") - 0.2);
  fromTo("#hlTop", { opacity: 0 }, { opacity: 0.35, duration: 0.2, yoyo: true, repeat: 1, repeatDelay: 0.25 }, P("dalt"));
  to("#mirror", { x: -205, y: 60, duration: 0.35, ease: "power2.inOut" }, P("costats") - 0.15);
  fromTo("#hlL", { opacity: 0 }, { opacity: 0.4, duration: 0.15, yoyo: true, repeat: 1, repeatDelay: 0.1 }, P("costats"));
  to("#mirror", { x: 205, y: 60, duration: 0.35, ease: "power2.inOut" }, P("costats") + 0.35);
  fromTo("#hlR", { opacity: 0 }, { opacity: 0.4, duration: 0.15, yoyo: true, repeat: 1, repeatDelay: 0.1 }, P("costats") + 0.55);
  // per sota: la llengua s'aixeca
  to("#dorsal", { scaleY: 0.35, opacity: 0, duration: 0.35, ease: "power2.inOut" }, P("sota") - 0.1);
  fromTo("#ventral", { opacity: 0, scaleY: 0.3 }, { opacity: 1, scaleY: 1, duration: 0.35, ease: "power2.out" }, P("sota") - 0.05);
  to("#mirror", { x: 0, y: 150, duration: 0.35, ease: "power2.inOut" }, P("sota") - 0.1);

  // «Treu-la i mou-la a banda i banda.»
  const tT = P("treu-la");
  to("#ventral", { opacity: 0, scaleY: 0.3, duration: 0.25 }, tT - 0.1);
  to("#dorsal", { scaleY: 1, opacity: 1, duration: 0.3, ease: "power2.out" }, tT - 0.05);
  to("#mirror", { x: 420, y: 520, opacity: 0, duration: 0.35, ease: "power2.in" }, tT);
  to("#tongue", { y: 120, scale: 1.12, duration: 0.4, ease: "back.out(1.6)" }, tT);
  plateCam(tT, 0, 110, 0.92, 0.5);
  to("#tongue", { rotation: -16, duration: 0.3, ease: "power2.inOut" }, P("banda", 1) - 0.1);
  to("#tongue", { rotation: 16, duration: 0.4, ease: "power2.inOut" }, P("banda", 2) - 0.15);
  to("#tongue", { rotation: 0, y: 40, scale: 1, duration: 0.35, ease: "power2.inOut" }, E("banda", 2) + 0.05);

  // «Aquí està: una úlcera al lateral de la llengua.»
  const tA = P("aquí");
  plateCam(tA - 0.05, ULCER.x - 40, ULCER.y + 10, 1.75, 0.55, "expo.out", { whoosh: false });
  sfx("impact", tA + 0.05, 0.35);
  fromTo("#ulcerRing", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, tA);
  fromTo("#ulcerHalo", { scale: 1 }, { scale: 1.25, duration: 0.22, repeat: 3, yoyo: true, svgOrigin: "0 0" }, tA + 0.1);
  fromTo("#ulcerChip", { opacity: 0, scale: 0.4, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, P("úlcera", 1));
  sfx("pop1", P("úlcera", 1), 0.35);

  // «Mida, forma, color i localització.»
  const tMi = P("mida");
  plateCam(tMi - 0.25, -45, 100, 1.35, 0.5, "power2.inOut", { whoosh: false });
  to("#ulcerChip", { opacity: 0, scale: 0.6, duration: 0.2 }, tMi - 0.25);
  to("#ulcerRing", { opacity: 0, duration: 0.2 }, tMi - 0.2);
  fromTo("#mCard", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, tMi - 0.25);
  measures.forEach((m, i) => {
    const t = P(m.w) - 0.03;
    to(`#mRow${i}`, { opacity: 1, duration: 0.15 }, t);
    to(`#mRow${i} .mTxt span`, { opacity: 1, duration: 0.2 }, t + 0.05);
    fromTo(`#mCheck${i}`, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.5)" }, t + 0.1);
    sfx(pick("pop"), t + 0.1, 0.25);
  });
  fromTo("#ruler", { opacity: 0, scaleX: 0.1, svgOrigin: "0 0" }, { opacity: 1, scaleX: 1, duration: 0.3, ease: "power3.out" }, P("mida"));
  fromTo("#ulcerOutline", { opacity: 1, strokeDashoffset: 180, attr: { "stroke-dasharray": "180 180" } }, { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" }, P("forma"));
  fromTo("#ulcerHalo", { fill: "#E0444F" }, { fill: "#FF2D55", duration: 0.15, repeat: 1, yoyo: true }, P("color"));
  fromTo("#pin", { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 0.35, ease: "bounce.out" }, P("localització"));

  // «Una gasa subjecta la llengua.»
  const tG = P("gasa") - 0.15;
  to("#mCard", { opacity: 0, x: -60, duration: 0.25, ease: "power2.in" }, tG);
  to(["#ruler", "#ulcerOutline", "#pin"], { opacity: 0, duration: 0.2 }, tG);
  plateCam(tG, 40, 140, 0.95, 0.6);
  fromTo("#gauze", { opacity: 0, x: -200, y: 220 }, { opacity: 1, x: 0, y: 0, duration: 0.45, ease: "power3.out" }, tG + 0.05);
  to("#tongue", { rotation: -12, x: -40, y: 60, duration: 0.45, ease: "power2.inOut" }, P("subjecta"));
  to("#gauze", { x: -40, y: 30, rotation: -4, duration: 0.45, ease: "power2.inOut", svgOrigin: "0 250" }, P("subjecta"));

  // «Ara, les dents properes, amb mirall i sonda.»
  const tD = P("dents", 1);
  plateCam(tD - 0.1, SHARP.x - 30, SHARP.y - 20, 1.9, 0.6);
  fromTo("#mirror", { opacity: 0, x: 520, y: 380 }, { opacity: 1, x: SHARP.x + 150, y: SHARP.y - 200, duration: 0.4, ease: "power3.out" }, P("mirall", 2) - 0.1);
  fromTo("#probe", { opacity: 0, x: 380, y: 620 }, { opacity: 1, x: SHARP.x + 70, y: SHARP.y + 30, duration: 0.35, ease: "power3.out" }, P("sonda") - 0.1);
  const taps = [lowerTeeth[0], SHARP, lowerTeeth[2]];
  const tapT0 = P("sonda") + 0.25;
  taps.forEach((tt, i) => {
    to("#probe", { x: tt.x - 10, y: tt.y - 40, duration: 0.18, ease: "power2.inOut" }, tapT0 + i * 0.3);
    sfx("click1", tapT0 + i * 0.3 + 0.17, 0.25);
  });

  // «Una té la vora afilada i irregular.»
  to("#probe", { x: SHARP.x - 10, y: SHARP.y - 40, duration: 0.2 }, P("vora", 1) - 0.25);
  fromTo("#sharpEdge", { opacity: 1, strokeDashoffset: 260, attr: { "stroke-dasharray": "260 260" } }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, P("vora", 1));
  fromTo("#sharpEdge", { scaleY: 0.4, svgOrigin: "0 -20" }, { scaleY: 1, duration: 0.35, ease: "back.out(3)" }, P("afilada", 1));
  to("#sharpTooth rect", { fill: "#FFE4E6", stroke: C.red, duration: 0.3 }, P("vora", 1));
  fromTo("#sharpChip", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, P("irregular") - 0.05);
  sfx("pop2", P("irregular"), 0.35);

  // «I frega just on hi ha l'úlcera.»
  const tF = P("frega");
  to(["#mirror", "#probe"], { opacity: 0, x: "+=300", y: "+=400", duration: 0.35, ease: "power2.in" }, tF - 0.15);
  to("#gauze", { opacity: 0, x: -260, y: 260, duration: 0.35, ease: "power2.in" }, tF - 0.15);
  to("#sharpChip", { opacity: 0, duration: 0.2 }, tF - 0.1);
  to("#tongue", { rotation: 0, x: 0, y: 0, duration: 0.3, ease: "power2.inOut" }, tF - 0.15);
  plateCam(tF - 0.1, (ULCER.x + SHARP.x) / 2, (ULCER.y + SHARP.y) / 2, 2.0, 0.5);
  const rubs = 4;
  const rubSpan = Math.max(0.9, E("úlcera", 2) + 0.4 - tF);
  fromTo("#tongue", { x: 0 }, { x: 22, y: 14, duration: rubSpan / (rubs * 2), repeat: rubs * 2 - 1, yoyo: true, ease: "sine.inOut" }, tF + 0.15);
  fromTo("#spark", { opacity: 0, scale: 0.5, svgOrigin: "0 0" }, { opacity: 1, scale: 1.2, duration: rubSpan / (rubs * 2), repeat: rubs * 2 - 1, yoyo: true }, tF + 0.15);
  fromTo("#counter", { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, tF);
  fromTo("#roll", { y: 0 }, { y: -64 * 10, duration: rubSpan, ease: "steps(10)" }, tF + 0.1);
  fromTo("#link", { opacity: 0 }, { opacity: 1, duration: 0.2 }, P("úlcera", 2) - 0.05);
  fromTo("#link", { strokeDashoffset: 0 }, { strokeDashoffset: -84, duration: 1.2, ease: "none" }, P("úlcera", 2) - 0.05);
  sfx("rub", tF + 0.15, 0.25);
}

// ═════════ ESCENA 3 · DIAGNÒSTIC ═════════
{
  const tP = P("pas", 3);
  // Sortim de la boca i veiem els tres passos.
  to(["#counter", "#link", "#spark"], { opacity: 0, duration: 0.2 }, tP - 0.15);
  to("#plateClip", { clipPath: "circle(0px at 1600px 1600px)", duration: 0.6, ease: "power3.out" }, tP + 0.15);
  cam(tP - 0.1, 470, -330, 0.7, 1.0, "power3.inOut");
  to("#pMouthOpen", { scale: 0, duration: 0.25 }, tP + 0.5);
  to("#pMouthLine", { opacity: 1, duration: 0.1 }, tP + 0.6);
  to("#dArmFU", { rotation: 10, duration: 0.5, ease: "power2.inOut" }, tP);
  to("#dArmFF", { rotation: 4, duration: 0.5, ease: "power2.inOut" }, tP);
  to("#cone", { opacity: 0.35, duration: 0.4 }, tP + 0.3);
  to(["#tag1", "#tag2", "#trail"], { opacity: 1, duration: 0.3 }, tP + 0.2);
  to("#trailDraw", { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, tP + 0.3);
  fromTo("#tag3", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, P("diagnòstic", 1) - 0.1);
  sfx("pop1", P("diagnòstic", 1), 0.4);

  // «Respostes més exploració.»
  const tR = P("respostes");
  cam(tR - 0.15, MON.x - 20, MON.y + 10, 2.5, 0.75);
  to("#dHead", { rotation: 6, duration: 0.4 }, tR - 0.1);
  to(["#tag1", "#tag2", "#tag3", "#trail"], { opacity: 0, duration: 0.25 }, tR - 0.1);
  to("#scrHist", { opacity: 0, duration: 0.2 }, tR - 0.05);
  to("#scrDiag", { opacity: 1, duration: 0.2 }, tR - 0.05);
  fromTo("#cardA", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, tR);
  fromTo("#plus", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, P("més"));
  fromTo("#cardB", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, P("exploració", 2));
  sfx(pick("pop"), tR + 0.05, 0.25);
  sfx(pick("pop"), P("exploració", 2) + 0.05, 0.25);
  // Les dues targetes s'ajunten i es converteixen en el diagnòstic.
  const tMerge = Math.min(P("úlcera", 3) - 0.3, E("exploració", 2) + 0.05);
  to("#cardA", { x: 95, scale: 0.7, opacity: 0, duration: 0.3, ease: "power3.in" }, tMerge);
  to("#cardB", { x: -95, scale: 0.7, opacity: 0, duration: 0.3, ease: "power3.in" }, tMerge);
  to("#plus", { scale: 0, opacity: 0, duration: 0.2 }, tMerge);
  fromTo("#cardD", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.8)" }, tMerge + 0.22);

  // Clímax.
  to("#dxTitle", { clipPath: "inset(0 0% 0 0)", duration: Math.max(0.5, P("fregament") - P("úlcera", 3) - 0.05), ease: "steps(14)" }, P("úlcera", 3));
  to("#dxCause", { clipPath: "inset(0 0% 0 0)", duration: Math.max(0.6, P("afilada", 2) - P("fregament") + 0.2), ease: "steps(18)" }, P("fregament"));
  sfx("keys", P("úlcera", 3), 0.18);
  sfx("keys", P("fregament"), 0.18);
  const tS = E("afilada", 2) + 0.05;
  fromTo("#stamp", { opacity: 0, scale: 2.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.28, ease: "power4.in" }, tS);
  sfx("impact", tS + 0.25, 0.6);
  fromTo("#cam", { x: 0, y: 0 }, { x: 10, y: -6, duration: 0.05, repeat: 5, yoyo: true, ease: "none" }, tS + 0.28);
  set("#cam", { x: 0, y: 0 }, tS + 0.6);

  // «Però també descarta infeccions i altres malalties.»
  to("#cardD", { y: -6, duration: 0.3 }, P("descarta"));
  const nfs = [["#nf1", "#nf1ok", P("infeccions")], ["#nf2", "#nf2ok", P("malalties", 2)]];
  nfs.forEach(([n, ok, t]) => {
    fromTo(n, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.8)" }, t - 0.08);
    sfx(pick("pop"), t, 0.3);
    fromTo(ok, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.25, ease: "power3.out" }, t + 0.45);
    to(`${n} span`, { color: "#94A3B8", textDecoration: "line-through", duration: 0.1 }, t + 0.45);
  });

  // «I li explica els resultats al pacient.»
  const tX = P("explica");
  cam(tX - 0.2, 560, -150, 1.0, 0.9);
  to("#cone", { opacity: 0, duration: 0.4 }, tX);
  to("#lampFace", { fill: "#CBD5E1", duration: 0.3 }, tX);
  to("#lamp", { rotation: 40, duration: 0.8, ease: "power2.inOut" }, tX);
  to("#dHead", { rotation: -12, duration: 0.4 }, tX);
  to("#dArmBU", { rotation: -70, duration: 0.5, ease: "back.out(1.5)" }, tX + 0.1);
  to("#dArmBF", { rotation: -30, duration: 0.5, ease: "back.out(1.5)" }, tX + 0.1);
  to("#dArmFU", { rotation: 14, duration: 0.5, ease: "power2.inOut" }, P("resultats"));
  to("#dArmFF", { rotation: 38, duration: 0.5, ease: "back.out(1.6)" }, P("resultats"));
  to("#dTorso", { rotation: -2, duration: 0.5 }, P("resultats"));
  // el pacient assenteix i somriu
  const tPa = P("pacient");
  to("#pHead", { rotation: -8, duration: 0.18, repeat: 3, yoyo: true, ease: "sine.inOut" }, tPa);
  to("#pMouthLine", { opacity: 0, duration: 0.15 }, tPa);
  to("#pSmile", { opacity: 1, duration: 0.15 }, tPa);
  to("#pBrow", { attr: { d: "M2 -54 Q12 -60 22 -54" }, duration: 0.3 }, tPa);
}

// ───────────────────────── subtítols ─────────────────────────
const KEY = {
  red: ["ferida", "úlcera", "afilada", "irregular", "frega", "fregament", "mal", "traumàtica"],
  green: ["diagnòstic", "descarta"],
  blue: ["anamnesi", "exploració", "història", "mirall", "llengua", "sonda", "gasa", "dents", "mida", "forma", "color", "localització", "llum", "boca", "medicació", "malalties", "al·lèrgies", "resultats", "infeccions", "general", "lateral", "dalt", "costats", "sota", "banda", "obre", "respostes", "lingual", "repetit"],
};
function keyColor(t) {
  const k = norm(t);
  for (const [c, list] of Object.entries(KEY)) if (list.some((w) => norm(w) === k)) return c;
  return null;
}
function captionGroups() {
  // Per a cada línia del guió, tria els talls que fan grups de 2-4 paraules
  // sense acabar en paraula feble (article, preposició...) ni partir una pausa.
  const weak = /^(a|la|el|les|els|i|de|amb|per|una|un|al|que|on|hi|no|es|pels|l'|li|va|et|ha|just|tot|més)$/i;
  const lines = [];
  words.forEach((w) => (lines[w.line] ||= []).push(w));
  const out = [];
  for (const L of lines.filter(Boolean)) {
    const n = L.length;
    const best = Array(n + 1).fill(Infinity), from = Array(n + 1).fill(0);
    best[0] = 0;
    for (let j = 1; j <= n; j++)
      for (let k = 1; k <= 4 && j - k >= 0; k++) {
        const g = L.slice(j - k, j);
        let c = 0;
        if (k === 1 && n > 1) c += 4;
        if (k === 4) c += 1;
        if (j < n && weak.test(g.at(-1).text.replace(/[.,:?]$/, ""))) c += 10;
        for (let q = 0; q < g.length - 1; q++) {
          if (/[,:?]$/.test(g[q].text)) c += 6;
          if (g[q + 1].start - g[q].end > 0.3) c += 8;
        }
        if (best[j - k] + c < best[j]) { best[j] = best[j - k] + c; from[j] = j - k; }
      }
    const groups = [];
    for (let j = n; j > 0; j = from[j]) groups.unshift(L.slice(from[j], j));
    out.push(...groups);
  }
  return out;
}

function buildCaptions() {
  const groups = captionGroups().filter((g) => g[0].start < DUR);
  let html = "", js = "";
  groups.forEach((g, gi) => {
    const start = Math.max(0.1, g[0].start - 0.05);
    const next = groups[gi + 1];
    const end = Math.min(DUR, next ? next[0].start - 0.05 : g.at(-1).end + 0.6);
    const ws = g
      .map((w, wi) => {
        const k = keyColor(w.text);
        return `<span class="w${k ? " k-" + k : ""}" id="c${gi}w${wi}">${w.text.replace(/[.,]$/, "")}</span>`;
      })
      .join(" ");
    html += `<div class="cg" id="cg${gi}">${ws}</div>`;
    js += `tl.set("#cg${gi}", {opacity:1, visibility:"visible"}, ${at(start)});\n`;
    js += `tl.fromTo("#cg${gi}", {y:14, scale:0.96}, {y:0, scale:1, duration:0.16, ease:"power3.out"}, ${at(start)});\n`;
    g.forEach((w, wi) => {
      js += `tl.fromTo("#c${gi}w${wi}", {opacity:0.25}, {opacity:1, duration:0.08}, ${at(Math.max(start, w.start - 0.02))});\n`;
      if (keyColor(w.text)) js += `tl.fromTo("#c${gi}w${wi}", {"--hl":0}, {"--hl":1, duration:0.14, ease:"power2.out"}, ${at(w.start)});\n`;
    });
    js += `tl.to("#cg${gi}", {opacity:0, duration:0.1, ease:"power2.in"}, ${at(end - 0.1)});\n`;
    js += `tl.set("#cg${gi}", {opacity:0, visibility:"hidden"}, ${at(end)});\n`;
  });
  return `<template>
  <style>
    #root{position:absolute;inset:0;pointer-events:none}
    .cg{position:absolute;left:60px;right:60px;top:250px;text-align:center;opacity:0;visibility:hidden;font-family:Inter,sans-serif;font-weight:900;font-size:66px;line-height:1.25;color:#0F172A;letter-spacing:-0.01em}
    .w{display:inline-block;padding:2px 10px;border-radius:14px;position:relative;
       text-shadow:0 0 18px rgba(255,255,255,.95),0 0 6px rgba(255,255,255,.95);
       background:rgba(255,255,255,calc(.82 - var(--hl,0)*.82));}
    .k-blue{background:color-mix(in srgb,#2563EB calc(var(--hl,0)*100%),rgba(255,255,255,.82));color:color-mix(in srgb,#fff calc(var(--hl,0)*100%),#0F172A);text-shadow:none}
    .k-red{background:color-mix(in srgb,#E11D48 calc(var(--hl,0)*100%),rgba(255,255,255,.82));color:color-mix(in srgb,#fff calc(var(--hl,0)*100%),#0F172A);text-shadow:none}
    .k-green{background:color-mix(in srgb,#16A34A calc(var(--hl,0)*100%),rgba(255,255,255,.82));color:color-mix(in srgb,#fff calc(var(--hl,0)*100%),#0F172A);text-shadow:none}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
    ${html}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    window.__timelines["captions"] = tl;
  </script>
</template>
`;
}

// ───────────────────────── escriure fitxers ─────────────────────────
const worldFile = `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="world" data-width="1080" data-height="1920">
    <div id="cam"><div id="zoom">
      <div id="bgpan">${backWall()}</div>
      <div id="pan">
        ${clinic()}
        ${worldHTML()}
      </div>
    </div></div>
    <div id="glow"></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${T.join("\n    ")}
    window.__timelines["world"] = tl;
  </script>
</template>
`.replace("#glow", "#glow");

fs.writeFileSync(path.join(ROOT, "compositions/world.html"), worldFile);
fs.writeFileSync(path.join(ROOT, "compositions/captions.html"), buildCaptions());

// Pista d'efectes (es mesclen amb ffmpeg a scripts/mix.mjs).
fs.writeFileSync(path.join(ROOT, "assets/sfx-cues.json"), JSON.stringify(SFX.filter((s) => s.t < DUR).sort((a, b) => a.t - b.t), null, 1));

const hasMix = fs.existsSync(path.join(ROOT, "assets/mix.wav"));
const audioSrc = hasMix ? "assets/mix.wav" : "assets/voz.wav";
const index = `<!doctype html>
<html lang="ca" data-composition-variables='[{"id":"captions","type":"boolean","label":"Subtítols","default":true}]'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: ${C.wall}; }
      #glowBottom { position: absolute; left: 0; right: 0; bottom: 0; height: 520px; pointer-events: none;
        background: radial-gradient(70% 90% at 50% 100%, rgba(20,184,166,.28), rgba(37,99,235,.10) 55%, rgba(234,242,248,0) 100%); z-index: 2; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920" data-fps="30">
      <div id="world" data-composition-id="world" data-composition-src="compositions/world.html"
        data-start="0" data-duration="${DUR}" data-track-index="1" data-track-kind="graphics"
        data-width="1080" data-height="1920" style="z-index:1"></div>
      <div id="glowBottom"></div>
      <div id="captions" class="clip" data-composition-id="captions" data-composition-src="compositions/captions.html"
        data-start="0" data-duration="${DUR}" data-track-index="2" data-track-kind="captions"
        data-width="1080" data-height="1920" style="z-index:3"></div>
      <audio id="voice" class="clip" src="${audioSrc}" data-start="0" data-duration="${DUR}" data-track-index="3" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      const vars = (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {};
      if (vars.captions === false) tl.set("#captions", { opacity: 0 }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(ROOT, "index.html"), index);
console.log(`OK · durada ${DUR}s · ${T.length} instruccions · ${SFX.length} efectes · àudio ${audioSrc}`);
