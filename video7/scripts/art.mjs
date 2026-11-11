// Il·lustracions del vídeo 7 (SVG generat): clínica, odontograma inferior, arcades 3D amb plans i tall sagital del cap.
export const r2 = (v) => Math.round(v * 100) / 100;

// ───────────── paleta ─────────────
export const C = {
  ink: "#0F172A", blue: "#2563EB", green: "#16A34A", yellow: "#EAB308", red: "#E11D48", pink: "#EC4899", orange: "#F97316",
  enamel: "#FBF8F1", enamelSh: "#D9CFBC", gum: "#EE9AA8", gumDark: "#D9707F", gumInfl: "#E0314F",
};

// ═════════════ CLÍNICA (1920×1080) ═════════════
// Pantalla del monitor (on després entrem): x 1200, y 300, 480×270
export const MON = { x: 1200, y: 300, w: 480, h: 270 };
export function clinic() {
  return `<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;overflow:visible">
  <defs>
    <linearGradient id="kWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8F1F5"/><stop offset="1" stop-color="#D3E2EA"/></linearGradient>
    <linearGradient id="kFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D3DA"/><stop offset="1" stop-color="#AEB9C2"/></linearGradient>
    <linearGradient id="kCab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E2E8EE"/></linearGradient>
    <linearGradient id="kChair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2DD4BF"/><stop offset="1" stop-color="#0F766E"/></linearGradient>
    <linearGradient id="kMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#94A3B8"/><stop offset=".5" stop-color="#F1F5F9"/><stop offset="1" stop-color="#64748B"/></linearGradient>
    <linearGradient id="kSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8D2B4"/><stop offset="1" stop-color="#E3A983"/></linearGradient>
    <radialGradient id="kLight" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFF7D6" stop-opacity=".85"/><stop offset="1" stop-color="#FFF7D6" stop-opacity="0"/></radialGradient>
    <linearGradient id="kWin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0F9FF"/><stop offset="1" stop-color="#BAE6FD"/></linearGradient>
    <filter id="kSh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#0F172A" flood-opacity=".22"/></filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#kWall)"/>
  <!-- finestra -->
  <rect x="120" y="120" width="560" height="420" rx="10" fill="url(#kWin)" stroke="#fff" stroke-width="16"/>
  <path d="M400 120 V540 M120 330 H680" stroke="#fff" stroke-width="12"/>
  <path d="M160 520 L330 160 L380 160 L210 520 Z" fill="#fff" opacity=".35"/>
  <!-- terra -->
  <rect y="800" width="1920" height="280" fill="url(#kFloor)"/>
  <path d="M0 800 H1920" stroke="#9AA6B0" stroke-width="4"/>
  <!-- moble i taulell -->
  <rect x="1060" y="600" width="820" height="210" rx="10" fill="url(#kCab)" filter="url(#kSh)"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${1080 + i * 200}" y="640" width="180" height="150" rx="8" fill="none" stroke="#CBD5E1" stroke-width="4"/><rect x="${1150 + i * 200}" y="656" width="40" height="8" rx="4" fill="#94A3B8"/>`).join("")}
  <rect x="1040" y="584" width="860" height="22" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3"/>
  <!-- prestatge amb pots -->
  <rect x="1180" y="160" width="560" height="14" rx="4" fill="#CBD5E1"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${1210 + i * 105}" y="${100 + (i % 2) * 14}" width="60" height="${60 - (i % 2) * 14}" rx="10" fill="${["#93C5FD", "#FDE68A", "#A7F3D0", "#FBCFE8", "#C7D2FE"][i]}"/>`).join("")}
  <!-- monitor -->
  <g filter="url(#kSh)">
    <rect x="${MON.x - 18}" y="${MON.y - 18}" width="${MON.w + 36}" height="${MON.h + 36}" rx="14" fill="#1E293B"/>
    <rect x="${MON.x + MON.w / 2 - 22}" y="${MON.y + MON.h + 18}" width="44" height="90" fill="url(#kMetal)"/>
    <rect x="${MON.x + MON.w / 2 - 110}" y="${MON.y + MON.h + 100}" width="220" height="16" rx="8" fill="#334155"/>
  </g>
  <rect id="monScreen" x="${MON.x}" y="${MON.y}" width="${MON.w}" height="${MON.h}" fill="#0B1220"/>
  <!-- teclat i post-its -->
  <rect x="1290" y="560" width="300" height="26" rx="6" fill="#334155"/>
  <rect x="1250" y="600" width="70" height="56" fill="#FDE047" transform="rotate(-3 1285 628)"/>
  <rect x="1560" y="600" width="70" height="56" fill="#FDE047" transform="rotate(4 1595 628)"/>
  <!-- planta -->
  <rect x="1800" y="500" width="70" height="90" rx="10" fill="#E2E8F0"/>
  <path d="M1835 500 C1800 420 1780 380 1760 360 M1835 500 C1840 420 1850 380 1870 340 M1835 500 C1830 440 1810 420 1795 410" stroke="#16A34A" stroke-width="14" fill="none" stroke-linecap="round"/>
  <!-- cadira dental amb pacient -->
  <g>
    <rect x="520" y="790" width="80" height="40" rx="10" fill="#475569"/>
    <rect x="545" y="690" width="30" height="110" fill="url(#kMetal)"/>
    <path d="M250 640 L860 660 C900 662 920 690 900 720 L880 740 L280 720 C240 718 230 650 250 640 Z" fill="url(#kChair)" filter="url(#kSh)"/>
    <path d="M250 640 C230 560 200 470 180 420 C170 395 190 380 215 395 C240 420 280 520 310 640 Z" fill="url(#kChair)"/>
    <!-- pacient (perfil) -->
    <path d="M300 640 C340 610 420 600 520 610 L840 640 C870 645 880 670 860 690 L320 680 C290 676 280 650 300 640 Z" fill="#60A5FA"/>
    <path d="M820 650 L900 640 C930 640 935 668 905 672 L830 678 Z" fill="#334155"/>
    <circle cx="245" cy="455" r="70" fill="url(#kSkin)"/>
    <path d="M200 400 C220 360 300 370 300 420 C280 400 240 400 200 420 Z" fill="#5B3A29"/>
    <path d="M310 470 C330 470 335 485 318 492" stroke="#C07F5A" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M290 520 C320 560 340 600 360 616 L300 640 Z" fill="url(#kSkin)"/>
    <ellipse id="pMouth" cx="300" cy="500" rx="16" ry="8" fill="#7F1D1D"/>
    <!-- pitet -->
    <path d="M320 600 L420 600 L410 650 L330 655 Z" fill="#7DD3FC"/>
  </g>
  <!-- llum dental -->
  <g>
    <path d="M600 0 V140 C600 180 560 200 520 210 L420 240" stroke="#CBD5E1" stroke-width="22" fill="none" stroke-linecap="round"/>
    <g transform="translate(400,250) rotate(25)"><rect x="-80" y="-30" width="160" height="60" rx="30" fill="#E2E8F0" stroke="#94A3B8" stroke-width="5"/><rect id="lampOn" x="-62" y="10" width="124" height="16" rx="8" fill="#FEF3C7"/></g>
    <path id="lampBeam" d="M350 290 L250 520 L400 520 L430 290 Z" fill="url(#kLight)" opacity="0"/>
  </g>
  <!-- safata amb instruments -->
  <g transform="translate(720,470)">
    <rect x="-20" y="40" width="16" height="190" fill="url(#kMetal)"/>
    <rect x="-120" y="20" width="240" height="26" rx="8" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4"/>
    <path d="M-90 16 H40 M-80 6 H50" stroke="#64748B" stroke-width="6" stroke-linecap="round"/>
  </g>
  <!-- mirall i sonda (entren a la boca) -->
  <g transform="translate(300,500)"><g id="tools" opacity="0">
    <path d="M10 -6 L170 -110" stroke="#94A3B8" stroke-width="8" stroke-linecap="round"/><circle cx="6" cy="-2" r="12" fill="#E0F2FE" stroke="#64748B" stroke-width="4"/>
    <path d="M-2 10 L150 -40 L200 -40" stroke="#64748B" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M150 -60 C190 -90 250 -80 260 -40 C250 -20 210 -10 170 -20 Z" fill="#93C5FD" opacity=".9"/>
  </g></g>
</svg>`;
}

// ═════════════ ODONTOGRAMA INFERIOR (vista oclusal) ═════════════
// Centre (0,0); incisius a baix (prop de l'observador), dreta del pacient a l'esquerra de la pantalla.
export function lowerOcclusal() {
  const widths = [5.5, 6, 7, 7, 7.5, 11, 10.5, 10]; // 1..8 (mm)
  const S = 11; // px per mm
  // corba: arc frontal + trams posteriors
  const pts = [];
  const R0 = 205, A0 = 1.3;
  for (let i = 0; i <= 200; i++) { const a = (i / 200) * A0; pts.push([R0 * Math.sin(a), R0 * Math.cos(a)]); }
  const tx = Math.cos(A0), tz = -Math.sin(A0); // tangent (cap enrere i enfora)
  const dirx = tx * 1.0, dirz = tz * 1.0; const nn = Math.hypot(dirx, dirz);
  const last = pts[pts.length - 1];
  for (let i = 1; i <= 300; i++) pts.push([last[0] + (dirx / nn) * i * 2, last[1] + (dirz / nn) * i * 2]);
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = (s) => { let i = cum.findIndex((c) => c >= s); if (i <= 0) i = 1; const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1]); const p = pts[i - 1], q = pts[i]; return { x: p[0] + (q[0] - p[0]) * f, z: p[1] + (q[1] - p[1]) * f, ang: Math.atan2(q[0] - p[0], q[1] - p[1]) }; };
  const teeth = [];
  let s = 0;
  widths.forEach((w, k) => { const c = at(s + (w * S) / 2), c2 = at(s + (w * S) / 2 + 2); teeth.push({ n: k + 1, w: w * S, x: c.x, z: c.z, tx: c2.x - c.x, tz: c2.z - c.z }); s += w * S + 3; });
  const zs = teeth.map((t) => t.z), zc = (Math.max(...zs) + Math.min(...zs)) / 2;
  const all = [];
  for (const side of [-1, 1]) for (const t of teeth) {
    const x = side * t.x, y = t.z - zc, txs = side * t.tx, tys = t.tz, L = Math.hypot(txs, tys);
    let nx = -tys / L, ny = txs / L; const cy = -zc; if (nx * x + ny * (y - cy) < 0) { nx = -nx; ny = -ny; }
    let rot = (Math.atan2(tys, txs) * 180) / Math.PI; if (rot > 90) rot -= 180; if (rot < -90) rot += 180;
    all.push({ ...t, side, fdi: (side < 0 ? 40 : 30) + t.n, x, y, rot, nx, ny });
  }
  const shape = (t) => {
    const w = t.w / 2, n = t.n;
    let body, det = "";
    if (n <= 2) { const h = 26; body = `<rect x="${-w}" y="${-h / 2}" width="${2 * w}" height="${h}" rx="${h / 2.4}"/>`; det = `<path d="M${-w * 0.6} 0 H${w * 0.6}" stroke="${C.enamelSh}" stroke-width="3" stroke-linecap="round"/>`; }
    else if (n === 3) { body = `<ellipse rx="${w}" ry="${w * 0.95}"/>`; det = `<circle r="${w * 0.22}" fill="${C.enamelSh}"/>`; }
    else if (n <= 5) { body = `<ellipse rx="${w}" ry="${w * 1.15}"/>`; det = `<path d="M${-w * 0.5} 0 H${w * 0.5}" stroke="${C.enamelSh}" stroke-width="4" stroke-linecap="round"/>`; }
    else { const h = w * 2.0; body = `<rect x="${-w}" y="${-h / 2}" width="${2 * w}" height="${h}" rx="${w * 0.55}"/>`; det = `<path d="M${-w * 0.6} 0 H${w * 0.6} M${-w * 0.2} ${-h * 0.3} L${w * 0.2} ${h * 0.3}" stroke="${C.enamelSh}" stroke-width="4" stroke-linecap="round" fill="none"/>`; }
    return { body, det };
  };
  const seq = [...all.filter((t) => t.side < 0).sort((a, b) => b.n - a.n), ...all.filter((t) => t.side > 0).sort((a, b) => a.n - b.n)];
  const line = seq.map((t, i) => `${i ? "L" : "M"}${r2(t.x)} ${r2(t.y)}`).join(" ");
  let svg = `<g>
    <path d="${line}" stroke="#F6BCC6" stroke-width="170" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="gumBand" d="${line}" stroke="${C.gum}" stroke-width="128" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="gumInfl" d="${line}" stroke="${C.gumInfl}" stroke-width="132" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>`;
  for (const t of all) {
    const { body, det } = shape(t);
    svg += `<g transform="translate(${r2(t.x)},${r2(t.y)}) rotate(${r2(t.rot)})"><g id="t${t.fdi}"><g fill="url(#gTooth)" stroke="#B9AD96" stroke-width="2.5">${body}</g>${det}</g></g>`;
  }
  svg += `</g>`;
  const pos = Object.fromEntries(all.map((t) => [t.fdi, { x: r2(t.x), y: r2(t.y), w: t.w, rot: t.rot, nx: t.nx, ny: t.ny }]));
  let nums = "";
  for (const t of all) nums += `<text x="${r2(t.x + t.nx * 118)}" y="${r2(t.y + t.ny * 118 + 10)}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="28" fill="#64748B">${t.fdi}</text>`;
  return { svg, nums, pos };
}

// ═════════════ ARCADES 3D (projecció axonomètrica) ═════════════
const PSI = (-30 * Math.PI) / 180, PHI = (24 * Math.PI) / 180;
export const proj = (x, y, z) => {
  const x1 = x * Math.cos(PSI) + z * Math.sin(PSI), z1 = -x * Math.sin(PSI) + z * Math.cos(PSI);
  return { x: x1, y: -(y * Math.cos(PHI) - z1 * Math.sin(PHI)), d: z1 * Math.cos(PHI) + y * Math.sin(PHI) };
};
export const axis = (x, y, z) => { const a = proj(x, y, z), o = proj(0, 0, 0); return { x: r2(a.x - o.x), y: r2(a.y - o.y) }; };

function archTeeth(upper) {
  const W = upper ? [8.5, 6.5, 7.5, 7, 6.5, 10, 9, 8.5] : [5.5, 6, 7, 7, 7.5, 11, 10.5, 10];
  const Hh = upper ? [10.5, 9, 10, 8.5, 7.5, 7, 6.5, 6] : [9, 9.5, 11, 8.5, 8, 7, 6.5, 6];
  const S = 8, R0 = upper ? 150 : 128, A0 = 1.0;
  const pts = []; for (let i = 0; i <= 200; i++) { const a = (i / 200) * A0; pts.push([R0 * Math.sin(a), R0 * Math.cos(a)]); }
  const dx = Math.cos(A0) * 0.8, dz = -Math.sin(A0) * 1.25, nn = Math.hypot(dx, dz), last = pts[200];
  for (let i = 1; i <= 300; i++) pts.push([last[0] + (dx / nn) * i * 2, last[1] + (dz / nn) * i * 2]);
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = (s) => { let i = cum.findIndex((c) => c >= s); if (i <= 0) i = 1; const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1]); const p = pts[i - 1], q = pts[i]; return { x: p[0] + (q[0] - p[0]) * f, z: p[1] + (q[1] - p[1]) * f }; };
  const out = []; let s = 0;
  W.forEach((w, k) => { const c = at(s + (w * S) / 2); out.push({ n: k + 1, r: (w * S) / 2 * 0.96, h: Hh[k] * S * 0.85, x: c.x, z: c.z }); s += w * S; });
  const res = [];
  for (const side of [-1, 1]) for (const t of out) res.push({ ...t, x: side * t.x, side, upper });
  return res;
}
// cilindre (dent o geniva) projectat
function cyl(x, z, y0, y1, r, fill, stroke, topFill) {
  const T = proj(x, y1, z), B = proj(x, y0, z), ry = r * Math.sin(PHI);
  const body = `<path d="M${r2(T.x - r)} ${r2(T.y)} L${r2(B.x - r)} ${r2(B.y)} A${r2(r)} ${r2(ry)} 0 0 0 ${r2(B.x + r)} ${r2(B.y)} L${r2(T.x + r)} ${r2(T.y)} Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  const top = topFill ? `<ellipse cx="${r2(T.x)}" cy="${r2(T.y)}" rx="${r2(r)}" ry="${r2(ry)}" fill="${topFill}" stroke="${stroke}" stroke-width="2"/>` : "";
  return body + top;
}
const GAP = 14; // meitat de l'obertura entre arcades
export const ZFRONT = 70; // pla frontal: z (entre canins i premolars)
// Retorna els elements de les dues arcades, amb meta per partir-les.
export function arches() {
  const items = [];
  for (const t of [...archTeeth(true), ...archTeeth(false)]) {
    const gumR = t.r * 1.22, gumH = 46;
    let g;
    if (t.upper) g = cyl(t.x, t.z, GAP + t.h, GAP + t.h + gumH, gumR, "url(#gGum3)", "#C7606F", "#F4A7B3") + cyl(t.x, t.z, GAP, GAP + t.h, t.r, "url(#gTooth3)", "#B5A88F", null)
      + cyl(t.x, t.z, GAP + t.h - 2, GAP + t.h + gumH, gumR, "url(#gGum3)", "#C7606F", "#F4A7B3");
    else g = cyl(t.x, t.z, -GAP - t.h - gumH, -GAP - t.h + 4, gumR, "url(#gGum3)", "#C7606F", null) + cyl(t.x, t.z, -GAP - t.h, -GAP, t.r, "url(#gTooth3)", "#B5A88F", "#FFFDF6");
    const d = proj(t.x, t.upper ? GAP : -GAP, t.z).d;
    items.push({ ...t, svg: g, d });
  }
  return items;
}
// pla com a polígon projectat
export function planePoly(kind) {
  const E = { x: 300, y: 150, zf: 260, zb: -260 };
  let P;
  if (kind === "sag") P = [[0, E.y, E.zf], [0, E.y, E.zb], [0, -E.y, E.zb], [0, -E.y, E.zf]];
  if (kind === "fro") P = [[-E.x, E.y, ZFRONT], [E.x, E.y, ZFRONT], [E.x, -E.y, ZFRONT], [-E.x, -E.y, ZFRONT]];
  if (kind === "tra") P = [[-E.x, 0, E.zf], [E.x, 0, E.zf], [E.x, 0, E.zb], [-E.x, 0, E.zb]];
  return P.map((p) => { const q = proj(...p); return `${r2(q.x)},${r2(q.y)}`; }).join(" ");
}
// costat de cada dent respecte del pla (+1/-1) i quin costat és a prop de la càmera
export function sideOf(kind, t) { if (kind === "sag") return t.x > 0 ? 1 : -1; if (kind === "fro") return t.z > ZFRONT ? 1 : -1; return t.upper ? 1 : -1; }
export function nearSide(kind) { const a = kind === "sag" ? axis(1, 0, 0) : kind === "fro" ? axis(0, 0, 1) : axis(0, 1, 0); const d = kind === "sag" ? proj(1, 0, 0).d - proj(0, 0, 0).d : kind === "fro" ? proj(0, 0, 1).d - proj(0, 0, 0).d : proj(0, 1, 0).d - proj(0, 0, 0).d; return d > 0 ? 1 : -1; }

// ═════════════ CAPS PETITS (orientació del pla) ═════════════
export function headFront() {
  return `<g><ellipse cx="0" cy="0" rx="120" ry="150" fill="url(#gSkin2)" stroke="#C88D68" stroke-width="5"/>
  <path d="M-120 -30 C-130 -150 130 -150 120 -30 C100 -110 -100 -110 -120 -30 Z" fill="#5B3A29"/>
  <ellipse cx="-45" cy="-10" rx="14" ry="9" fill="#334155"/><ellipse cx="45" cy="-10" rx="14" ry="9" fill="#334155"/>
  <path d="M0 0 L-12 45 H12" stroke="#C88D68" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M-40 82 C-20 70 20 70 40 82 C20 100 -20 100 -40 82 Z" fill="#D45D6E"/>
  <ellipse cx="-122" cy="10" rx="14" ry="28" fill="url(#gSkin2)" stroke="#C88D68" stroke-width="4"/><ellipse cx="122" cy="10" rx="14" ry="28" fill="url(#gSkin2)" stroke="#C88D68" stroke-width="4"/></g>`;
}
export function headSide() {
  // perfil mirant a l'esquerra
  return `<g><path d="M20 -150 C110 -150 150 -80 150 0 C150 70 120 110 90 130 L90 190 L-10 190 L-10 150 C-40 150 -70 140 -80 120 C-90 100 -85 90 -95 82 C-100 74 -92 70 -98 62 C-104 54 -100 48 -92 44 C-100 30 -112 20 -118 6 C-108 -6 -100 -10 -96 -30 C-96 -110 -60 -150 20 -150 Z" fill="url(#gSkin2)" stroke="#C88D68" stroke-width="5"/>
  <path d="M-70 -110 C-20 -170 120 -160 150 -40 C140 -60 120 -70 100 -60 C60 -100 0 -110 -70 -110 Z" fill="#5B3A29"/>
  <ellipse cx="50" cy="10" rx="16" ry="28" fill="#E8B08C" stroke="#C88D68" stroke-width="4"/>
  <ellipse cx="-62" cy="-26" rx="10" ry="7" fill="#334155"/>
  <path d="M-98 62 C-90 66 -84 66 -78 62" stroke="#B5485A" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
}

// ═════════════ TALL SAGITAL DEL CAP (cara a l'esquerra, caixa 0..1000) ═════════════
export const HEAD = {
  skin: "M520 40 C700 40 840 150 850 330 C858 450 820 540 760 600 C800 650 806 720 810 1000 L395 1000 C395 880 380 790 340 730 C300 700 262 690 250 652 C238 622 240 598 256 584 C264 576 262 568 250 560 C228 548 226 524 244 512 L250 508 C226 498 226 478 244 466 C256 458 262 450 258 438 C240 436 210 428 196 414 C184 400 196 380 212 360 C240 320 262 290 272 250 C280 225 285 205 280 185 C280 100 380 40 520 40 Z",
  brain: "M300 190 C320 100 420 70 520 70 C680 70 800 160 815 320 C780 300 700 300 600 320 C500 320 420 300 330 280 C310 260 296 230 300 190 Z",
  nasal: "M268 300 C300 285 400 300 500 330 C540 345 560 370 562 400 L545 425 L470 432 L290 432 C268 420 248 400 236 380 C244 350 254 322 268 300 Z",
  conchae: ["M330 330 C380 322 430 330 470 350", "M320 365 C380 356 440 366 500 385", "M310 400 C370 395 440 400 520 412"],
  palateHard: "M282 434 L472 434 L472 452 L290 454 C278 450 276 440 282 434 Z",
  palateSoft: "M472 436 C510 438 538 456 550 490 C556 508 548 520 536 516 C522 498 500 472 472 452 Z",
  maxilla: "M264 412 C276 398 296 400 304 414 L300 456 L268 458 C262 440 260 425 264 412 Z",
  upperLip: "M258 438 C262 450 256 460 244 466 C226 478 226 498 250 508 L258 506 C254 490 256 470 262 452 Z",
  lowerLip: "M250 510 C226 524 228 548 250 560 C262 568 264 576 258 584 L268 582 C264 562 258 534 256 512 Z",
  incUp: "M272 452 L292 454 C290 480 284 500 278 516 L266 514 C266 496 268 472 272 452 Z",
  incLow: "M268 520 L282 518 C288 538 292 556 294 578 L276 580 C274 560 270 540 268 520 Z",
  mandible: "M268 580 C290 572 306 584 310 612 C312 650 302 690 288 702 C270 704 258 674 262 634 C264 606 266 590 268 580 Z",
  mandBody: "M304 640 C380 655 450 650 520 622 L530 642 C450 682 380 690 300 682 Z",
  tongue: "M284 522 C300 506 340 478 400 470 C462 464 520 480 546 520 C560 550 562 592 552 630 C532 646 500 644 470 632 C420 612 362 594 322 584 C300 576 290 562 284 546 Z",
  tongueTop: "M290 520 C310 500 350 482 400 476 C460 470 515 486 540 520",
  floor: "M286 548 C300 590 340 620 400 630 C460 640 520 640 550 632 L540 650 C480 662 400 660 340 640 C300 625 286 600 280 560 Z",
  // espais
  vestUp: "M262 452 L272 452 C268 474 266 496 266 514 L252 508 C254 490 256 470 262 452 Z",
  vestLow: "M252 512 L268 520 C270 540 274 560 276 580 L264 582 C262 562 256 536 252 512 Z",
  proper: "M292 456 L472 452 C506 464 530 488 540 516 C548 546 540 580 520 600 C470 616 400 612 340 600 C312 592 294 578 288 558 L280 520 C284 500 288 478 292 456 Z",
  pharynx: "M545 400 C578 392 608 404 614 430 L618 1000 L570 1000 L570 720 C566 690 560 664 556 640 C562 600 560 560 550 522 C556 500 552 470 530 432 Z",
  pharWall: "M614 410 C630 410 642 420 642 440 L642 1000 L618 1000 L618 430 Z",
  epiglottis: "M556 640 C572 610 590 600 598 618 C592 640 578 660 568 694 Z",
  larynx: "M470 700 C500 690 540 690 566 700 L566 860 C540 870 500 870 470 860 Z",
  trachea: "M478 860 L558 860 L558 1000 L478 1000 Z",
  esoph: "M570 760 L614 760 L614 1000 L570 1000 Z",
  hyoid: "M450 682 C470 672 500 672 520 680 L516 692 C500 686 470 686 454 694 Z",
  lipsZone: "M246 430 C190 440 190 600 252 600 C290 600 296 440 246 430 Z",
};
export function sagittalHead() {
  const v = Array.from({ length: 8 }, (_, i) => `<rect x="652" y="${420 + i * 72}" width="96" height="60" rx="12" fill="#F3E6CF" stroke="#D2BC94" stroke-width="3"/><path d="M748 ${430 + i * 72} L800 ${445 + i * 72} L800 ${465 + i * 72} L748 ${470 + i * 72} Z" fill="#F3E6CF" stroke="#D2BC94" stroke-width="3"/>`).join("");
  const rings = Array.from({ length: 6 }, (_, i) => `<path d="M480 ${876 + i * 22} H556" stroke="#93C5FD" stroke-width="8" stroke-linecap="round"/>`).join("");
  const H = HEAD;
  return `<g>
  <path d="${H.skin}" fill="url(#gSkinCut)" stroke="#C88D68" stroke-width="5"/>
  <path d="${H.brain}" fill="#F3D3D6" opacity=".7"/>
  <path d="${H.nasal}" fill="#FFF1EE" stroke="#E7A3A3" stroke-width="4"/>
  ${H.conchae.map((d) => `<path d="${d}" stroke="#E79A9A" stroke-width="12" fill="none" stroke-linecap="round"/>`).join("")}
  <path d="${H.pharynx}" fill="#FFF1EE" stroke="#E7A3A3" stroke-width="4"/>
  <path d="${H.pharWall}" fill="#E57373"/>
  ${v}
  <path d="${H.esoph}" fill="#F0A0A0"/>
  <path d="${H.larynx}" fill="#BFDBFE" stroke="#60A5FA" stroke-width="4"/>
  <path d="M480 770 L556 790 M480 790 L556 800" stroke="#2563EB" stroke-width="5"/>
  <path d="${H.trachea}" fill="#DBEAFE"/>${rings}
  <path d="${H.mandBody}" fill="#F3E6CF" stroke="#D2BC94" stroke-width="3"/>
  <path d="${H.hyoid}" fill="#F3E6CF" stroke="#D2BC94" stroke-width="3"/>
  <path d="${H.floor}" fill="#EF9A9A"/>
  <path id="hProperBg" d="${H.proper}" fill="#FFF1EE"/>
  <path id="hTongue" d="${H.tongue}" fill="url(#gTongue)" stroke="#C2414B" stroke-width="4"/>
  <path d="${H.tongueTop}" stroke="#F9A8A8" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="${H.epiglottis}" fill="#FDE68A" stroke="#D4A72C" stroke-width="3"/>
  <path id="hPalSoft" d="${H.palateSoft}" fill="#E57373" stroke="#C2414B" stroke-width="3"/>
  <path id="hPalHard" d="${H.palateHard}" fill="#F3E6CF" stroke="#D2BC94" stroke-width="3"/>
  <path d="M286 452 L472 450" stroke="#F19CA6" stroke-width="6"/>
  <path d="${H.maxilla}" fill="#F3E6CF" stroke="#D2BC94" stroke-width="3"/>
  <path d="${H.mandible}" fill="#F3E6CF" stroke="#D2BC94" stroke-width="3"/>
  <path id="hGumUp" d="M266 446 C276 440 296 444 302 452 L292 462 L272 460 Z" fill="#F08B9C"/>
  <path id="hGumLow" d="M268 586 C278 592 292 590 300 582 L294 566 L274 570 Z" fill="#F08B9C"/>
  <path d="${H.vestUp}" fill="#FFF1EE"/><path d="${H.vestLow}" fill="#FFF1EE"/>
  <g id="hTeeth"><path d="${H.incUp}" fill="#FFFDF6" stroke="#B5A88F" stroke-width="3"/><path d="${H.incLow}" fill="#FFFDF6" stroke="#B5A88F" stroke-width="3"/></g>
  <g id="hLips"><path d="${H.upperLip}" fill="#E07A84" stroke="#B5485A" stroke-width="3"/><path d="${H.lowerLip}" fill="#E07A84" stroke="#B5485A" stroke-width="3"/></g>
</g>`;
}

export const DEFS = `<defs>
  <radialGradient id="gTooth" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F6F0E2"/><stop offset="1" stop-color="#DCCFB6"/></radialGradient>
  <linearGradient id="gTooth3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D8CCB4"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CDBFA4"/></linearGradient>
  <linearGradient id="gGum3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D86A7C"/><stop offset=".45" stop-color="#F4A1AE"/><stop offset="1" stop-color="#CC5A6C"/></linearGradient>
  <linearGradient id="gSkin2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAD9BF"/><stop offset="1" stop-color="#E8B28E"/></linearGradient>
  <linearGradient id="gSkinCut" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F9D7C0"/><stop offset="1" stop-color="#EDBB98"/></linearGradient>
  <linearGradient id="gTongue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE7F86"/><stop offset="1" stop-color="#C9424F"/></linearGradient>
  <filter id="gGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="gSh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#0F172A" flood-opacity=".18"/></filter>
</defs>`;
