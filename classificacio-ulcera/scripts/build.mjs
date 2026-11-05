// Generador del vídeo «Com classifiquem la lesió?» (infografia, 1920×1080, sense veu).
// Escriu index.html i compositions/world.html, i la llista d'efectes assets/sfx-cues.json.
//
//   node scripts/build.mjs             vídeo sencer
//   node scripts/build.mjs --until 15  només fins al segon 15 (proves)
//
// Tots els moments són a la taula B (segons): si en canvies un, la resta del
// vídeo es manté perquè cada escena es calcula a partir del seu propi inici.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const UNTIL = args.includes("--until") ? parseFloat(args[args.indexOf("--until") + 1]) : null;
const W = 1920, H = 1080;

// ───────────────────────── calendari (segons) ─────────────────────────
const B = {
  q: 0.3,          // ESCENA 1: la pregunta
  qUp: 3.9,        // la pregunta puja i es fa títol
  cards: 4.7,      // ESCENA 2: primera targeta (les altres cada 1,5 s)
  cardGap: 1.5,
  toS1: 12.6,      // entrada a la targeta 1 i viatge
  s1: 14.4,        // 1 · ORIGEN
  s2: 28.6,        // 2 · DURADA
  s3: 42.8,        // 3 · DISTRIBUCIÓ
  s4: 57.0,        // 4 · TIPUS D'ALTERACIÓ
  end: 71.0,
};
const DUR = +(UNTIL ?? B.end).toFixed(3);

// ───────────────────────── utilitats ─────────────────────────
const r2 = (v) => Math.round(v * 100) / 100;
const icon = (name, size, color = "currentColor") =>
  fs.readFileSync(path.join(ROOT, "assets/icons", `${name}.svg`), "utf8")
    .replace("<svg ", `<svg width="${size}" height="${size}" style="color:${color};display:block" `);
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const C = {
  bg: "#F4F7FB", ink: "#0F172A", ink2: "#475569", line: "#E2E8F0",
  blue: "#2563EB", blueL: "#DBEAFE", teal: "#0D9488", red: "#E11D48", redL: "#FFE4E6",
  green: "#15803D", greenL: "#DCFCE7", amber: "#B45309", grey: "#CBD5E1",
  tongue: "#E57C8A", tongueD: "#C25566",
};

// Lupa de l'escena 3 (al costat del cap).
const LENS3 = { x: 7800 - 150, y: -250, size: 260 };
// Posició de cada escena al món (una sola càmera viatja entre elles).
const S = { a: { x: 0, y: 0 }, 1: { x: 2600, y: 0 }, 2: { x: 5200, y: 0 }, 3: { x: 7800, y: 0 }, 4: { x: 10400, y: 0 } };
const CRIT = [
  { n: 1, icon: "lightning", k: "SEGONS L'ORIGEN", short: "Origen", res: "TRAUMÀTICA" },
  { n: 2, icon: "clock", k: "SEGONS LA DURADA", short: "Durada", res: "AGUDA" },
  { n: 3, icon: "person", k: "SEGONS LA DISTRIBUCIÓ", short: "Distribució", res: "LOCALITZADA" },
  { n: 4, icon: "microscope", k: "SEGONS EL TIPUS D'ALTERACIÓ", short: "Tipus d'alteració", res: "ORGÀNICA" },
];

// ───────────────────────── art: llengua i boca ─────────────────────────
const TONGUE = "M-235 40 C-245 -80 -120 -128 0 -128 C120 -128 245 -80 235 40 C225 165 120 255 0 255 C-120 255 -225 165 -235 40Z";
const ULCER = { x: 196, y: 108, rot: -62 };

function papillae(seed, n = 140) {
  const R = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, rr = Math.sqrt(R());
    const x = Math.cos(a) * rr * 200, y = 50 + Math.sin(a) * rr * 170;
    if (y < -110 || Math.hypot(x - ULCER.x, y - ULCER.y) < 50) continue;
    out += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(3 + R() * 3.5)}" fill="#F7A9B3" opacity="${r2(0.45 + R() * 0.4)}"/>`;
  }
  return out;
}
// Llengua sola (vista des de dalt). stage: 0 sana, 1 punt vermell, 2 úlcera.
function tongueSVG(id, stage, size, extra = "") {
  const ul = stage === 0 ? "" : stage === 1
    ? `<ellipse rx="16" ry="11" fill="#E0444F" opacity="0.8"/>`
    : `<ellipse rx="40" ry="27" fill="#E0444F" opacity="0.85"/><ellipse rx="25" ry="15" fill="#F4E3B5"/><ellipse rx="12" ry="6" fill="#FBF3DC"/>`;
  return `<svg id="${id}" width="${size}" height="${r2(size * 430 / 520)}" viewBox="-260 -150 520 430" style="display:block;overflow:visible">
    <path d="${TONGUE}" fill="url(#gTongue)" stroke="${C.tongueD}" stroke-width="4"/>
    <path d="M0 -100 Q8 60 0 190" stroke="${C.tongueD}" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.6"/>
    ${papillae(stage + 5)}
    <g transform="translate(${ULCER.x},${ULCER.y}) rotate(${ULCER.rot})">${ul}</g>
    ${extra}
  </svg>`;
}

function arcTeeth(cx, cy, rx, ry, a0, a1, n, lower) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = ((a0 + ((a1 - a0) * (i + 0.5)) / n) * Math.PI) / 180;
    const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const centre = Math.abs(Math.cos(a));
    out.push({ x, y, w: 78 - centre * 8, h: (lower ? 62 : 84) - centre * 18, rot: (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90, i });
  }
  return out;
}
const upperTeeth = arcTeeth(0, -30, 300, 250, 202, 338, 10, false);
const lowerTeeth = arcTeeth(0, 40, 290, 225, 22, 158, 10, true);
const SHARP = lowerTeeth[1];
const tooth = (t, fill = "#FBFBF7", id = "") => `<g ${id ? `id="${id}"` : ""} transform="translate(${r2(t.x)},${r2(t.y)}) rotate(${r2(t.rot)})">
  <rect x="${r2(-t.w / 2)}" y="${r2(-t.h / 2)}" width="${r2(t.w)}" height="${r2(t.h)}" rx="${r2(t.w * 0.38)}" fill="${fill}" stroke="#D9D3C2" stroke-width="3"/>
  <path d="M${r2(-t.w / 4)} ${r2(-t.h / 2 + 10)} Q0 ${r2(-t.h / 2 + 4)} ${r2(t.w / 4)} ${r2(-t.h / 2 + 10)}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;

// Boca oberta (vista frontal), coordenades locals centrades a (0,0). p = prefix d'ids.
function mouthSVG(p, { ulcerStage = 2, sharp = true, backdrop = 1600 } = {}) {
  const s = SHARP;
  const zig = [];
  for (let i = 0; i <= 7; i++) zig.push(`${r2(-s.w / 2 + 6 + ((s.w - 12) * i) / 7)} ${r2(i % 2 ? -s.h / 2 - 24 : -s.h / 2 + 4)}`);
  return `
  <rect x="${-backdrop}" y="${-backdrop}" width="${backdrop * 2}" height="${backdrop * 2}" fill="url(#gSkin)"/>
  <ellipse cx="0" cy="10" rx="470" ry="410" fill="#C35C68"/>
  <ellipse cx="0" cy="10" rx="410" ry="352" fill="url(#gThroat)"/>
  <path d="M-150 -120 Q0 -260 150 -120" stroke="#9E3448" stroke-width="18" fill="none"/>
  <ellipse cx="0" cy="-150" rx="24" ry="40" fill="#B4485A"/>
  <path d="M-340 -150 Q0 -420 340 -150 L300 -120 Q0 -360 -300 -120Z" fill="#E58A93"/>
  ${upperTeeth.map((t) => tooth(t)).join("")}
  <path d="M-330 200 Q0 440 330 200 L290 170 Q0 380 -290 170Z" fill="#E58A93"/>
  ${lowerTeeth.map((t, i) => (i === s.i ? "" : tooth(t))).join("")}
  ${tooth(s, "#FBFBF7", `${p}Sharp`)}
  ${sharp ? `<g transform="translate(${r2(s.x)},${r2(s.y)}) rotate(${r2(s.rot)})"><path id="${p}Edge" d="M${zig.join(" L")}" fill="#FFE4E6" stroke="${C.red}" stroke-width="8" stroke-linejoin="round" opacity="0"/></g>` : ""}
  <g transform="translate(0,-120)"><g id="${p}Tongue"><g transform="translate(0,120)">
    <path d="${TONGUE}" fill="url(#gTongue)"/>
    <path d="M0 -100 Q8 60 0 190" stroke="${C.tongueD}" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.7"/>
    ${papillae(42)}
    <g transform="translate(${ULCER.x},${ULCER.y}) rotate(${ULCER.rot})"><g id="${p}Ulcer">
      <ellipse rx="40" ry="27" fill="#E0444F" opacity="0.85"/><ellipse rx="25" ry="15" fill="#F4E3B5"/><ellipse rx="12" ry="6" fill="#FBF3DC"/>
    </g></g>
  </g></g></g>`;
}

const DEFS = `<defs>
  <radialGradient id="gSkin" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#F5CDAA"/><stop offset="1" stop-color="#D99E77"/></radialGradient>
  <radialGradient id="gThroat" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stop-color="#2A0710"/><stop offset="1" stop-color="#6E1F31"/></radialGradient>
  <radialGradient id="gTongue" cx="0.5" cy="0.4" r="0.65"><stop offset="0" stop-color="#EE95A0"/><stop offset="1" stop-color="#D46473"/></radialGradient>
  <radialGradient id="gLens" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93C5FD"/><stop offset="1" stop-color="#60A5FA"/></linearGradient>
</defs>`;

// Tall del teixit (esquema). healthy: epiteli sencer; si no, cràter de l'úlcera.
function crossSection(p, healthy) {
  const Wd = 720, R = rng(healthy ? 9 : 10);
  let cells = "";
  for (let row = 0; row < 3; row++)
    for (let x = 6; x < Wd - 20; x += 34) {
      const cx = x + (row % 2) * 17;
      if (!healthy && cx > 250 && cx < 470) continue;
      cells += `<rect x="${cx}" y="${6 + row * 18}" width="30" height="15" rx="7" fill="#F7B6C0" stroke="#E68A98" stroke-width="2"/>`;
    }
  let vessels = "";
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 140 + R() * 30;
    vessels += `<path d="M${r2(x)} 80 q20 30 0 60 q-20 30 0 60" stroke="#E0444F" stroke-width="5" fill="none" opacity="0.55"/>`;
  }
  let fibers = "";
  for (let y = 214; y < 270; y += 14) fibers += `<path d="M0 ${y} Q${Wd / 2} ${y - 8} ${Wd} ${y}" stroke="#B9505F" stroke-width="3" fill="none" opacity="0.5"/>`;
  const crater = healthy ? "" : `
    <path d="M250 0 Q270 0 290 30 Q330 120 360 122 Q390 120 430 30 Q450 0 470 0 Z" fill="#F4E3B5" stroke="#E0444F" stroke-width="10" stroke-linejoin="round"/>
    <path d="M300 60 Q360 100 420 60" stroke="#E9C989" stroke-width="6" fill="none"/>
    <ellipse id="${p}Inflam" cx="360" cy="70" rx="170" ry="95" fill="#E0444F" opacity="0.12"/>`;
  return `<svg width="${Wd}" height="270" viewBox="0 0 ${Wd} 270" style="display:block;overflow:visible">
    <rect x="0" y="0" width="${Wd}" height="270" rx="18" fill="#FBE3E3"/>
    <rect x="0" y="200" width="${Wd}" height="70" fill="#E89AA5"/>${fibers}
    ${vessels}
    <rect x="0" y="0" width="${Wd}" height="62" fill="#FCD5DB"/>${cells}
    ${crater}
    <rect x="0" y="0" width="${Wd}" height="270" rx="18" fill="none" stroke="#E2E8F0" stroke-width="4"/>
  </svg>`;
}

// Silueta humana (vista frontal), alçada ~860, centrada a (0,0).
// Silueta humana (vista frontal) feta de formes simples; cap centrat a (0,-376).
const bodyShapes = (fill) => `
  <circle cx="0" cy="-376" r="62" fill="${fill}"/>
  <rect x="-22" y="-330" width="44" height="50" rx="12" fill="${fill}"/>
  <path d="M-100 -292 Q-142 -288 -140 -240 L-112 40 Q-110 66 -84 66 L84 66 Q110 66 112 40 L140 -240 Q142 -288 100 -292Z" fill="${fill}"/>
  <rect x="-176" y="-276" width="44" height="320" rx="22" fill="${fill}" transform="rotate(8 -154 -276)"/>
  <rect x="132" y="-276" width="44" height="320" rx="22" fill="${fill}" transform="rotate(-8 154 -276)"/>
  <rect x="-98" y="36" width="86" height="414" rx="38" fill="${fill}"/>
  <rect x="12" y="36" width="86" height="414" rx="38" fill="${fill}"/>`;

// ───────────────────────── composició HTML ─────────────────────────
const header = (c, sx) => `
<div class="hdr" id="hdr${c.n}" style="left:${sx - 860}px;top:${-500}px"><span class="num">${c.n}</span>${icon(c.icon, 46, C.blue)}<b>${c.k}</b></div>
<div class="badgeWrap" style="left:${sx + 860}px;top:${-455}px"><div class="badge" id="badge${c.n}"><small>${c.short}</small><b>${c.res}</b>${icon("seal-check", 54, "#fff")}</div></div>`;

const row = (id, ic, small, big, color = C.blue) =>
  `<div class="row" id="${id}"><div class="rowIcon" style="background:${color}1A">${icon(ic, 58, color)}</div><div><small>${small}</small><b>${big}</b></div></div>`;

function world() {
  const a = S.a, s1 = S[1], s2 = S[2], s3 = S[3], s4 = S[4];
  const q = ["COM", "CLASSIFIQUEM", "LA", "LESIÓ?"].map((w, i) => `<span class="qw" id="qw${i}">${w}</span>`).join(" ");
  const cards = CRIT.map((c, i) => `
    <div class="card" id="card${c.n}" style="left:${a.x - 780 + i * 400}px;top:${a.y - 150}px">
      <div class="cNum">${c.n}</div>
      <div class="cIcon" id="cIcon${c.n}">${icon(c.icon, 110, C.blue)}</div>
      <div class="cTxt">Segons<b>${c.short === "Origen" ? "l'" : c.short === "Tipus d'alteració" ? "el " : "la "}${c.short.toLowerCase()}</b></div>
    </div>`).join("");

  // Escena 2: nodes de la línia de temps
  const nodes = [
    { x: -640, st: 0, lab: "Sense lesió", id: "n1" },
    { x: -300, st: 1, lab: "Primers dies", id: "n2" },
    { x: 40, st: 2, lab: "Úlcera", id: "n3" },
    { x: 400, st: 2, lab: "Continua", id: "n4" },
    { x: 740, st: 2, lab: "Persisteix", id: "n5" },
  ];
  const nodeHTML = nodes.map((n) => `
    <div class="node" id="${n.id}" style="left:${s2.x + n.x - 110}px;top:${s2.y - 20}px">
      <div class="nodeArt">${tongueSVG(n.id + "T", n.st, 220)}</div>
      <div class="dot" style="background:${n.st === 0 ? C.green : C.red}"></div>
      <div class="nLab">${n.lab}</div>
    </div>`).join("");

  return `
<!-- ═════ ESCENA 1 i 2 ═════ -->
<div class="center" id="qWrap" style="left:${a.x}px;top:${a.y}px"><div id="question">${q}</div></div>
<div class="center" style="left:${a.x}px;top:${a.y - 300}px"><div id="sub">La lesió es pot classificar segons <b>quatre criteris</b></div></div>
${cards}

<!-- ═════ 1 · ORIGEN ═════ -->
${header(CRIT[0], s1.x)}
<div class="col" style="left:${s1.x + 150}px;top:${s1.y - 300}px">
  ${row("o1", "tooth", "Agent físic", "Dent afilada", C.red)}
  <div class="arrow" id="oa1">${icon("arrow-down", 44, C.grey)}</div>
  ${row("o2", "arrows-left-right", "Acció", "Fregament repetit", C.red)}
  <div class="arrow" id="oa2">${icon("arrow-down", 44, C.grey)}</div>
  ${row("o3", "bandaids", "Resultat", "Teixit lesionat", C.red)}
</div>

<!-- ═════ 2 · DURADA ═════ -->
${header(CRIT[1], s2.x)}
<div class="calendar" id="cal" style="left:${s2.x - 860}px;top:${s2.y - 380}px">
  <div class="calTop">${icon("calendar-blank", 34, "#fff")}<span>DIES</span></div>
  <div class="calNum" data-layout-allow-overflow><div id="calRoll">${[1, 2, 3, 4, 5, 6, 7].map((d) => `<div>${d}</div>`).join("")}</div></div>
</div>
<div class="brace" id="brace" data-layout-allow-overflow style="left:${s2.x - 700}px;top:${s2.y - 70}px;width:820px"><span>Apareix en <b>poc temps</b></span></div>
<div class="note" id="cont" style="left:${s2.x + 300}px;top:${s2.y - 150}px">Si el fregament <b>continua…</b></div>
<div class="note red" id="slow" style="left:${s2.x + 290}px;top:${s2.y + 330}px">${icon("hourglass-medium", 50, C.red)}<span>…tarda més a <b>cicatritzar</b></span></div>
${nodeHTML}

<!-- ═════ 3 · DISTRIBUCIÓ ═════ -->
${header(CRIT[2], s3.x)}
<div class="lensWrap" style="left:${LENS3.x}px;top:${LENS3.y}px"><div id="dLens">${tongueSVG("dLensT", 2, 220, `<circle cx="${ULCER.x}" cy="${ULCER.y}" r="70" fill="none" stroke="${C.red}" stroke-width="12"/>`)}</div></div>
<div class="col" style="left:${s3.x + 170}px;top:${s3.y - 150}px;width:690px">
  ${row("d1", "check-circle", "Afecta", "Una zona concreta", C.green)}
  <div style="height:40px"></div>
  ${row("d2", "x-circle", "No afecta", "Tot l'organisme", C.ink2)}
</div>

<!-- ═════ 4 · TIPUS D'ALTERACIÓ ═════ -->
${header(CRIT[3], s4.x)}
<div class="center" style="left:${s4.x}px;top:${s4.y - 335}px"><div class="pill" id="alt">Alteració <b>física</b> del teixit</div></div>
<div class="tWrap" id="tSa" style="left:${s4.x - 580}px;top:${s4.y - 300}px">${tongueSVG("tSaT", 0, 360)}<div class="tLab ok">${icon("check-circle", 44, C.green)}Teixit sa</div></div>
<div class="tWrap" id="tUl" style="left:${s4.x + 220}px;top:${s4.y - 300}px">${tongueSVG("tUlT", 2, 360)}<div class="tLab ko">${icon("warning-circle", 44, C.red)}Amb úlcera</div></div>
<div class="xs" id="xsSa" style="left:${s4.x - 760}px;top:${s4.y + 200}px">${crossSection("xa", true)}
  <div class="xLab" id="xlA" style="left:20px;top:-58px">Epiteli <b>intacte</b></div></div>
<div class="xs" id="xsUl" style="left:${s4.x + 40}px;top:${s4.y + 200}px">${crossSection("xb", false)}
  <div class="xLab" id="xl1" style="left:-10px;top:-58px">Epiteli</div>
  <div class="xLab red" id="xl2" style="left:250px;top:-58px">Pèrdua de teixit</div>
  <div class="xLab" id="xl3" style="left:480px;top:282px">Vora inflamada</div>
</div>
<div class="glassWrap" style="left:${s4.x + 220 + 180 + ULCER.x * 360 / 520}px;top:${s4.y - 300 + (ULCER.y + 150) * 360 / 520}px">
  <div id="glass">${icon("magnifying-glass", 150, C.ink)}</div>
</div>`;
}

function worldSVG() {
  const s1 = S[1], s3 = S[3];
  // Boca de l'escena 1 (escala 0,78 al voltant de M1).
  const M1 = { x: s1.x - 420, y: s1.y + 70, k: 0.78 };
  // Cos de l'escena 3 i la boca minúscula al cap.
  const BD = { x: s3.x - 470, y: s3.y + 90, k: 0.8 };
  const MH = { x: BD.x, y: BD.y - 432 + 26, k: 0.05 };
  return {
    M1, BD, MH,
    svg: `
<svg class="layer" style="left:-2000px;top:-1500px" width="15000" height="3000" viewBox="-2000 -1500 15000 3000">
  ${DEFS}
  <!-- camí que uneix les escenes -->
  <path id="trail" d="M0 420 C 900 420, 1200 470, ${S[1].x} 470 S ${S[2].x - 900} 470, ${S[2].x} 470 S ${S[3].x - 900} 470, ${S[3].x} 470 S ${S[4].x - 900} 470, ${S[4].x} 470"
        fill="none" stroke="${C.blue}" stroke-width="6" stroke-dasharray="2 22" stroke-linecap="round" opacity="0.45"/>

  <!-- 1 · ORIGEN: boca -->
  <g transform="translate(${M1.x},${M1.y}) scale(${M1.k})">
    <clipPath id="m1Clip"><ellipse cx="0" cy="10" rx="560" ry="500"/></clipPath>
    <g clip-path="url(#m1Clip)">${mouthSVG("m1", { backdrop: 700 })}</g>
    <ellipse cx="0" cy="10" rx="560" ry="500" fill="none" stroke="#fff" stroke-width="14"/>
    <circle id="m1Ring" cx="${r2(SHARP.x)}" cy="${r2(SHARP.y - 10)}" r="70" fill="none" stroke="${C.red}" stroke-width="10" stroke-dasharray="18 12" opacity="0"/>
    <circle id="m1URing" cx="${ULCER.x}" cy="${ULCER.y}" r="78" fill="none" stroke="${C.red}" stroke-width="10" opacity="0"/>
    <g id="m1Spark" opacity="0" transform="translate(${r2((ULCER.x + SHARP.x) / 2 + 10)},${r2((ULCER.y + SHARP.y) / 2 + 6)})">
      <path d="M0 -30 V-12 M0 12 V30 M-30 0 H-12 M12 0 H30 M-21 -21 L-10 -10 M10 10 L21 21 M21 -21 L10 -10 M-10 10 L-21 21" stroke="#FACC15" stroke-width="7" stroke-linecap="round"/>
    </g>
    <g id="m1Rub" opacity="0" transform="translate(${r2(SHARP.x + 140)},${r2(SHARP.y - 150)})">
      <path d="M-50 0 H50 M-50 0 l18 -14 M-50 0 l18 14 M50 0 l-18 -14 M50 0 l-18 14" stroke="${C.red}" stroke-width="9" stroke-linecap="round" fill="none"/>
    </g>
  </g>

  <!-- 2 · DURADA: eix del temps -->
  <path id="axis1" d="M${S[2].x - 760} ${S[2].y + 200} H${S[2].x + 200}" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>
  <path id="axis2" d="M${S[2].x + 200} ${S[2].y + 200} H${S[2].x + 830}" stroke="${C.red}" stroke-width="8" stroke-dasharray="20 14" stroke-linecap="round"/>
  <path id="axisHead" d="M${S[2].x + 830} ${S[2].y + 180} l26 20 l-26 20" stroke="${C.red}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>

  <!-- 3 · DISTRIBUCIÓ: silueta -->
  <g transform="translate(${BD.x},${BD.y}) scale(${BD.k})">
    <g id="body">${bodyShapes("url(#gBody)")}</g>
    <g id="bodyGrey" opacity="0">${bodyShapes(C.grey)}</g>
    <g transform="translate(0,-376)">
      <circle cx="-22" cy="-14" r="7" fill="#1E3A8A"/><circle cx="22" cy="-14" r="7" fill="#1E3A8A"/>
      <path d="M-20 22 Q0 40 20 22 Q0 30 -20 22Z" fill="#7F1D1D"/>
    </g>
    <circle id="bodySpot" cx="12" cy="-350" r="9" fill="${C.red}" opacity="0"/>
    <circle id="bodySpotRing" cx="12" cy="-350" r="12" fill="none" stroke="${C.red}" stroke-width="5" opacity="0"/>
  </g>
  <path id="lensLine" d="M${BD.x + 14 * BD.k} ${BD.y - 350 * BD.k} L${LENS3.x - 120} ${LENS3.y + 30}" stroke="${C.red}" stroke-width="5" stroke-dasharray="12 9" opacity="0"/>
</svg>`,
  };
}

const CSS = `
#root{position:absolute;inset:0;overflow:hidden;background:${C.bg};font-family:Inter,sans-serif;color:${C.ink}}
#cam{position:absolute;left:${W / 2}px;top:${H / 2}px;width:0;height:0}
#zoom,#pan,#bgpan{position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0}
.layer{position:absolute;overflow:visible}
.center{position:absolute;width:0;height:0;display:flex;justify-content:center;align-items:center}
.center>*{position:absolute;white-space:nowrap}
#question{font-weight:900;font-size:118px;letter-spacing:-0.02em;color:${C.ink};text-align:center}
.qw{display:inline-block;opacity:0}
#qw3{color:${C.blue}}
#sub{font-size:44px;font-weight:700;color:${C.ink2};opacity:0}
#sub b{color:${C.blue}}
.card{position:absolute;width:360px;height:330px;background:#fff;border-radius:34px;box-shadow:0 18px 50px rgba(15,23,42,.10);border:3px solid ${C.line};opacity:0;display:flex;flex-direction:column;align-items:center;padding-top:34px}
.cNum{position:absolute;left:22px;top:22px;width:56px;height:56px;border-radius:50%;background:${C.blue};color:#fff;font-weight:900;font-size:32px;display:grid;place-items:center}
.cIcon{width:150px;height:150px;border-radius:40px;background:${C.blueL};display:grid;place-items:center;margin-top:8px}
.cTxt{margin-top:26px;font-size:38px;font-weight:600;color:${C.ink2};text-align:center;line-height:1.15;padding:0 18px}
.cTxt b{display:block;font-weight:900;color:${C.ink};font-size:44px}
.hdr{position:absolute;display:flex;align-items:center;gap:18px;padding:14px 34px 14px 14px;border-radius:999px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.08);border:3px solid ${C.line};white-space:nowrap;opacity:0}
.hdr .num{width:62px;height:62px;border-radius:50%;background:${C.blue};color:#fff;font-weight:900;font-size:36px;display:grid;place-items:center}
.hdr b{font-weight:900;font-size:46px;letter-spacing:.01em}
.badgeWrap{position:absolute;width:0;height:0}
.badge{position:absolute;right:0;top:-48px;display:flex;align-items:center;gap:20px;padding:12px 26px 12px 32px;border-radius:26px;background:${C.red};color:#fff;white-space:nowrap;opacity:0;box-shadow:0 16px 36px rgba(225,29,72,.30);transform-origin:100% 50%}
.badge small{font-size:30px;font-weight:700;opacity:.85;margin-right:4px}
.badge b{font-size:62px;font-weight:900;letter-spacing:.02em}
.col{position:absolute;width:720px}
.row{display:flex;align-items:center;gap:26px;padding:20px 28px;background:#fff;border-radius:28px;box-shadow:0 12px 34px rgba(15,23,42,.08);border:3px solid ${C.line};opacity:0}
.rowIcon{flex:none;width:96px;height:96px;border-radius:26px;display:grid;place-items:center}
.row small{display:block;font-size:30px;font-weight:700;color:${C.ink2}}
.row b{display:block;font-size:50px;font-weight:900;line-height:1.1}
.arrow{display:flex;justify-content:center;padding:6px 0;opacity:0}
#d2 b{text-decoration:line-through;text-decoration-thickness:5px;color:${C.ink2}}
.calendar{position:absolute;width:250px;border-radius:30px;background:#fff;box-shadow:0 14px 34px rgba(15,23,42,.10);overflow:hidden;opacity:0;border:3px solid ${C.line}}
.calTop{height:62px;background:${C.red};color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:900;font-size:30px;letter-spacing:.08em}
.calNum{height:150px;overflow:hidden}
#calRoll div{height:150px;line-height:150px;text-align:center;font-weight:900;font-size:110px;color:${C.ink};font-variant-numeric:tabular-nums}
.brace{position:absolute;height:70px;border:6px solid ${C.ink};border-bottom:0;border-radius:22px 22px 0 0;opacity:0}
.brace span{position:absolute;left:0;right:0;top:-70px;text-align:center;font-size:44px;font-weight:700;white-space:nowrap}
.brace b{color:${C.blue};font-weight:900}
.note{position:absolute;font-size:44px;font-weight:700;white-space:nowrap;opacity:0;display:flex;align-items:center;gap:14px}
.note b{font-weight:900}
.note.red b{color:${C.red}}
.node{position:absolute;width:220px;display:flex;flex-direction:column;align-items:center;opacity:0}
.nodeArt{position:absolute;top:-24px}
.dot{position:absolute;top:202px;width:40px;height:40px;border-radius:50%;border:7px solid #fff;box-shadow:0 0 0 3px ${C.line}}
.nLab{position:absolute;top:262px;font-size:34px;font-weight:700;color:${C.ink2};white-space:nowrap}
.lensWrap,.glassWrap{position:absolute;width:0;height:0}
#dLens{position:absolute;left:-130px;top:-130px;width:260px;height:260px;border-radius:50%;background:#6E1F31;border:8px solid #fff;box-shadow:0 18px 40px rgba(15,23,42,.25);display:grid;place-items:center;overflow:hidden;opacity:0}
.pill{font-size:48px;font-weight:700;padding:14px 34px;border-radius:999px;background:#fff;border:3px solid ${C.line};box-shadow:0 10px 26px rgba(15,23,42,.08);opacity:0}
.pill b{color:${C.red};font-weight:900}
.tWrap{position:absolute;width:360px;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0}
.tLab{display:flex;align-items:center;gap:12px;font-size:42px;font-weight:900;white-space:nowrap}
.tLab.ok{color:${C.green}}.tLab.ko{color:${C.red}}
.xs{position:absolute;width:720px;height:270px;opacity:0}
.xLab{position:absolute;font-size:34px;font-weight:800;white-space:nowrap;padding:4px 14px;border-radius:12px;background:#fff;border:3px solid ${C.line};opacity:0}
.xLab.red{color:${C.red};border-color:#FECDD3}
.xLab b{color:${C.green}}
#glass{position:absolute;left:-55px;top:-55px;opacity:0}
`;

// ───────────────────────── línia de temps ─────────────────────────
const T = [];
const SFX = [];
const sfx = (file, t, vol = 0.5) => SFX.push({ file, t: +Math.max(0, t).toFixed(3), vol });
const tw = (sel, from, vars, t) => { const o = { sel, from, vars, t }; T.push(o); return o; };
const to = (sel, vars, t) => tw(sel, null, vars, t);
const fromTo = (sel, a, b, t) => tw(sel, a, b, t);
const set = (sel, vars, t) => T.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r2(t)});`);
const raw = (s) => T.push(s);
let pk = 0;
const pick = (k) => ({ whoosh: ["whoosh1", "whoosh2", "whoosh3"], pop: ["pop1", "pop2"] }[k][pk++ % (k === "pop" ? 2 : 3)]);

let camState = { x: 0, y: 0, s: 1 };
let lastCam = null;
function cam(t, x, y, s, dur = 1.1, ease = "power2.inOut", opts = {}) {
  if (lastCam && t < lastCam.t + lastCam.dur) {
    const d = Math.max(0.2, t - lastCam.t);
    lastCam.tw.forEach((o) => (o.vars.duration = r2(d)));
  }
  const tws = [
    to("#zoom", { scale: s, duration: dur, ease }, t),
    to("#pan", { x: -x, y: -y, duration: dur, ease }, t),
    to("#bgpan", { x: -x * 0.85, y: -y * 0.85, duration: dur, ease }, t),
  ];
  lastCam = { t, dur, tw: tws };
  const far = Math.hypot(x - camState.x, y - camState.y) > 900 || Math.abs(Math.log(s / camState.s)) > 1;
  if ((far || opts.blur) && opts.blur !== false) {
    to("#zoom", { filter: "blur(5px)", duration: dur * 0.45, ease: "power2.in" }, t);
    to("#zoom", { filter: "blur(0px)", duration: dur * 0.5, ease: "power2.out" }, t + dur * 0.45);
    sfx(pick("whoosh"), t + dur * 0.5, 0.35);
  }
  camState = { x, y, s };
}
const pop = (sel, t, extra = {}, snd = true) => {
  fromTo(sel, { opacity: 0, scale: 0.6, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)", ...extra }, t);
  if (snd) sfx(pick("pop"), t + 0.05, 0.3);
};
const stamp = (sel, t) => {
  fromTo(sel, { opacity: 0, scale: 1.8, rotation: -6 }, { opacity: 1, scale: 1, rotation: -2, duration: 0.38, ease: "power4.in" }, t);
  sfx("impact", t + 0.36, 0.45);
  fromTo("#cam", { x: 0, y: 0 }, { x: 6, y: -4, duration: 0.05, repeat: 5, yoyo: true, ease: "none" }, t + 0.38);
  set("#cam", { x: 0, y: 0 }, t + 0.7);
};
const showHeader = (n, t) => fromTo(`#hdr${n}`, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, t);

const { M1, BD, MH, svg: WSVG } = worldSVG();
const L1 = (lx, ly) => ({ x: M1.x + lx * M1.k, y: M1.y + ly * M1.k });

// pivots
raw(`gsap.set(["#m1Tongue"], {svgOrigin:"0 0"});`);
raw(`gsap.set(["#m1Ulcer"], {svgOrigin:"0 0", scale:0});`);
raw(`gsap.set(["#m1Ring","#m1URing","#bodySpotRing"], {transformOrigin:"50% 50%"});`);
raw(`gsap.set("#trail", {attr:{"stroke-dashoffset":0}});`);

// ═════ ESCENA 1 · PREGUNTA ═════
set("#zoom", { scale: 1.15 }, 0);
cam(0, 0, 0, 1, 3.4, "power1.out", { blur: false });
["qw0", "qw1", "qw2", "qw3"].forEach((id, i) => {
  fromTo(`#${id}`, { opacity: 0, y: 60, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, B.q + i * 0.28);
});
fromTo("#qw3", { scale: 1, rotation: 0 }, { scale: 1.12, rotation: -3, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 80%" }, B.q + 1.4);
sfx("pop1", B.q + 0.1, 0.3);
sfx("pop2", B.q + 1.45, 0.35);

// ═════ ESCENA 2 · CRITERIS ═════
to("#question", { y: -400, scale: 0.6, duration: 0.9, ease: "power3.inOut" }, B.qUp);
fromTo("#sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, B.qUp + 0.6);
CRIT.forEach((c, i) => {
  const t = B.cards + i * B.cardGap;
  pop(`#card${c.n}`, t);
  fromTo(`#cIcon${c.n}`, { rotation: -14, scale: 0.7 }, { rotation: 0, scale: 1, duration: 0.7, ease: "elastic.out(1,0.5)" }, t + 0.15);
});

// entrada a la targeta 1 i viatge a l'escena 1
cam(B.toS1, -780 + 180, -150 + 165, 2.1, 0.8, "power3.in", { blur: false });
to(["#card2", "#card3", "#card4", "#question", "#sub"], { opacity: 0.25, duration: 0.5 }, B.toS1);
const C1 = L1(SHARP.x - 20, SHARP.y - 50);
cam(B.toS1 + 0.8, C1.x, C1.y, 2.3, 1.2, "power2.inOut", { blur: true });
fromTo("#trail", { attr: { "stroke-dasharray": "2 22" }, opacity: 0.45 }, { opacity: 0.45, duration: 0.1 }, 0);

// ═════ 1 · ORIGEN → TRAUMÀTICA ═════
{
  const t0 = B.s1;
  showHeader(1, t0 - 0.2);
  // vora afilada
  fromTo("#m1Edge", { opacity: 0, scaleY: 0.3, svgOrigin: "0 -20" }, { opacity: 1, scaleY: 1, duration: 0.5, ease: "back.out(3)" }, t0 + 0.3);
  fromTo("#m1Ring", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, t0 + 0.6);
  sfx("pop2", t0 + 0.6, 0.3);
  // fregament repetit: la llengua va i ve; l'úlcera creix a cada passada
  const rubs = 5, half = 0.42, r0 = t0 + 1.2;
  fromTo("#m1Rub", { opacity: 0 }, { opacity: 1, duration: 0.3 }, r0);
  fromTo("#m1Tongue", { x: 0, y: 0 }, { x: 26, y: 16, duration: half, repeat: rubs * 2 - 1, yoyo: true, ease: "sine.inOut" }, r0);
  fromTo("#m1Rub", { x: -10 }, { x: 10, duration: half, repeat: rubs * 2 - 1, yoyo: true, ease: "sine.inOut" }, r0);
  for (let i = 0; i < rubs; i++) {
    const t = r0 + half * (2 * i + 1);
    fromTo("#m1Spark", { opacity: 0, scale: 0.5, svgOrigin: "0 0" }, { opacity: 1, scale: 1.2, duration: 0.16, yoyo: true, repeat: 1 }, t - 0.16);
    to("#m1Ulcer", { scale: (i + 1) / rubs, duration: 0.25, ease: "back.out(2)" }, t);
    sfx("click1", t, 0.18);
  }
  const rEnd = r0 + half * rubs * 2;
  to("#m1Rub", { opacity: 0, duration: 0.3 }, rEnd);
  fromTo("#m1URing", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, rEnd + 0.1);
  // la càmera s'allunya i apareix l'explicació
  const tOut = rEnd + 0.6;
  cam(tOut, S[1].x, S[1].y, 1, 1.2, "power2.inOut", { blur: false });
  sfx("whoosh2", tOut + 0.5, 0.25);
  pop("#o1", tOut + 1.2);
  fromTo("#oa1", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.4 }, tOut + 2.4);
  pop("#o2", tOut + 2.7);
  fromTo("#oa2", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.4 }, tOut + 3.9);
  pop("#o3", tOut + 4.2);
  stamp("#badge1", tOut + 5.6);
}

// ═════ 2 · DURADA → AGUDA ═════
{
  const t0 = B.s2;
  cam(t0 - 1.2, S[2].x, S[2].y, 1, 1.3, "power2.inOut", { blur: true });
  showHeader(2, t0 - 0.2);
  pop("#cal", t0 + 0.3);
  fromTo("#axis1", { attr: { "stroke-dasharray": "1000 1000", "stroke-dashoffset": 1000 } }, { attr: { "stroke-dashoffset": 0 }, duration: 1.2, ease: "power2.inOut" }, t0 + 0.4);
  set("#axis2", { attr: { "stroke-dasharray": "0 2000" } }, 0);
  fromTo("#calRoll", { y: 0 }, { y: -150 * 6, duration: 3.0, ease: "steps(6)" }, t0 + 0.8);
  pop("#n1", t0 + 0.8);
  pop("#n2", t0 + 1.8);
  pop("#n3", t0 + 2.8);
  fromTo("#n3T", { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, t0 + 3.2);
  fromTo("#brace", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, t0 + 4.0);
  stamp("#badge2", t0 + 5.4);
  // si el fregament continua…
  const t1 = t0 + 7.2;
  fromTo("#cont", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, t1);
  to("#axis2", { attr: { "stroke-dasharray": "20 14" }, duration: 0 }, t1 + 0.6);
  fromTo("#axis2", { attr: { "stroke-dashoffset": 640 } }, { attr: { "stroke-dashoffset": 0 }, duration: 1.0, ease: "none" }, t1 + 0.6);
  fromTo("#axis2", { opacity: 0 }, { opacity: 1, duration: 0.2 }, t1 + 0.6);
  fromTo("#axisHead", { opacity: 0 }, { opacity: 1, duration: 0.2 }, t1 + 1.6);
  pop("#n4", t1 + 1.0);
  pop("#n5", t1 + 1.8);
  fromTo(["#n4T", "#n5T"], { x: 0 }, { x: 8, duration: 0.2, repeat: 7, yoyo: true, ease: "sine.inOut" }, t1 + 2.0);
  fromTo("#slow", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, t1 + 2.6);
  fromTo("#slow svg", { rotation: 0 }, { rotation: 180, duration: 0.8, ease: "power2.inOut", transformOrigin: "50% 50%" }, t1 + 3.4);
}

// ═════ 3 · DISTRIBUCIÓ → LOCALITZADA ═════
{
  const t0 = B.s3;
  const head = { x: BD.x, y: BD.y - 376 * BD.k };
  cam(t0 - 1.2, S[3].x, S[3].y, 1, 1.3, "power2.inOut", { blur: true });
  showHeader(3, t0 - 0.2);
  fromTo("#body", { opacity: 0.6 }, { opacity: 1, duration: 0.6 }, t0);
  // zoom progressiu: cos sencer → cap → boca
  to("#hdr3", { opacity: 0, duration: 0.4 }, t0 + 1.3);
  cam(t0 + 1.4, head.x + 60, head.y + 20, 1.9, 1.3, "power2.inOut", { blur: false });
  sfx("whoosh3", t0 + 2.0, 0.25);
  cam(t0 + 2.9, head.x + 140, head.y + 10, 2.6, 1.2, "power2.inOut", { blur: false });
  fromTo("#bodySpot", { opacity: 0, scale: 0.2, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, t0 + 3.9);
  fromTo("#bodySpotRing", { opacity: 1, scale: 1 }, { opacity: 0, scale: 3.4, duration: 0.9, repeat: 3, ease: "power2.out", immediateRender: false }, t0 + 4.0);
  sfx("pop1", t0 + 3.95, 0.3);
  fromTo("#lensLine", { opacity: 0, attr: { "stroke-dashoffset": 200 } }, { opacity: 1, attr: { "stroke-dashoffset": 0 }, duration: 0.5 }, t0 + 4.6);
  pop("#dLens", t0 + 4.9);
  // tornem enrere: tot el cos en gris menys el punt
  cam(t0 + 6.6, S[3].x, S[3].y, 1, 1.4, "power2.inOut", { blur: false });
  to("#hdr3", { opacity: 1, duration: 0.5 }, t0 + 7.6);
  fromTo("#bodyGrey", { opacity: 0 }, { opacity: 1, duration: 0.8 }, t0 + 7.2);
  pop("#d1", t0 + 8.2);
  pop("#d2", t0 + 9.4);
  stamp("#badge3", t0 + 10.8);
}

// ═════ 4 · TIPUS D'ALTERACIÓ → ORGÀNICA ═════
{
  const t0 = B.s4;
  cam(t0 - 1.2, S[4].x, S[4].y, 1, 1.3, "power2.inOut", { blur: true });
  showHeader(4, t0 - 0.2);
  pop("#tSa", t0 + 0.4);
  pop("#tUl", t0 + 1.6);
  // lupa sobre l'úlcera i primer pla del teixit
  fromTo("#glass", { opacity: 0, x: 160, y: 160, rotation: 20 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.7, ease: "power3.out" }, t0 + 2.8);
  pop("#xsUl", t0 + 3.6);
  cam(t0 + 3.9, S[4].x + 400, S[4].y + 320, 1.7, 1.1, "power2.inOut", { blur: false });
  pop("#xl1", t0 + 5.0);
  pop("#xl2", t0 + 5.9);
  fromTo("#xbInflam", { opacity: 0.12 }, { opacity: 0.4, duration: 0.4, yoyo: true, repeat: 3 }, t0 + 6.7);
  pop("#xl3", t0 + 6.8);
  // comparació amb el teixit sa
  cam(t0 + 8.0, S[4].x, S[4].y, 1, 1.1, "power2.inOut", { blur: false });
  pop("#xsSa", t0 + 8.6);
  pop("#xlA", t0 + 9.2);
  to("#glass", { opacity: 0, duration: 0.4 }, t0 + 8.2);
  fromTo("#alt", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, t0 + 10.2);
  stamp("#badge4", t0 + 11.4);
}

// Vida contínua: el camí de punts es desplaça suaument durant tot el vídeo.
fromTo("#trail", { attr: { "stroke-dashoffset": 0 } }, { attr: { "stroke-dashoffset": -240 }, duration: DUR, ease: "none" }, 0);

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

const bgGrid = `<svg class="layer" style="left:-3000px;top:-2000px" width="17000" height="4000" viewBox="-3000 -2000 17000 4000">
  <defs><pattern id="gDots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="3" fill="#D5DEEA"/></pattern></defs>
  <rect x="-3000" y="-2000" width="17000" height="4000" fill="url(#gDots)"/></svg>`;

const worldFile = `<template>
  <style>${CSS}</style>
  <div id="root" data-composition-id="world" data-width="${W}" data-height="${H}">
    <div id="cam"><div id="zoom">
      <div id="bgpan">${bgGrid}</div>
      <div id="pan">
        ${WSVG}
        ${world()}
      </div>
    </div></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${serialize()}
    window.__timelines["world"] = tl;
  </script>
</template>
`;
fs.writeFileSync(path.join(ROOT, "compositions/world.html"), worldFile);
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
