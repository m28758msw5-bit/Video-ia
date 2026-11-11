// Vídeo 7 · Exploració intraoral, plans anatòmics de la boca i cavitat oral.
// 1920×1080, sense música, amb l'àudio original de l'usuària (assets/voz.wav).
// Capa 2D (GSAP): clínica → monitor → odontograma / tall sagital del cap.
// Capa 3D (Three.js, render(t) pur amb hf-seek): arcades dentals amb els tres plans.
//   node scripts/build.mjs
//
// IMPORTANT (correcció de la usuària): el PLA FRONTAL és un tall vertical de costat a costat (coronal)
// que separa la part ANTERIOR (llavis) de la POSTERIOR (faringe). No és com el sagital.

import fs from "node:fs";
import path from "node:path";
import * as A from "./art.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const W_ = 1920, H_ = 1080;
const DUR = 101.3;
const r2 = A.r2;
const words = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/transcript.json"), "utf8"));
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
function P(word, n = 1) {
  const k = norm(word); let c = 0;
  for (const w of words) { const parts = [w.text, ...w.text.split(/[-'’]/)].map(norm); if (parts.includes(k) && ++c === n) return +(w.start + 0.12).toFixed(2); }
  throw new Error(`P(${word},${n})`);
}

// ───────────── geometria de la pantalla ─────────────
const M = A.MON, FIN = { x: 80, y: 45, w: 1760, h: 990 };
const KZ = FIN.w / M.w; // zoom de la clínica fins al monitor
const CX = 90, CY = 56, CW = FIN.w - CX - 20, CH = FIN.h - CY - 20; // àrea de contingut dins la pantalla

// ───────────── odontograma ─────────────
const occ = A.lowerOcclusal();
const OC = { x: CW / 2, y: CH / 2 + 10, s: 1.2 }; // centre de l'odontograma dins el contingut
const tp = (fdi, dx = 0, dy = 0) => ({ x: OC.x + (occ.pos[fdi].x + dx) * OC.s, y: OC.y + (occ.pos[fdi].y + dy) * OC.s });
const p46 = occ.pos[46], p45 = occ.pos[45];
const cav46 = { x: p46.x, y: p46.y };
const cav45 = { x: p45.x + p45.nx * p45.w * 0.55, y: p45.y + p45.ny * p45.w * 0.55 };
const ipx = { x: (p45.x + p46.x) / 2 + (p45.nx + p46.nx) * 0.5 * 80, y: (p45.y + p46.y) / 2 + (p45.ny + p46.ny) * 0.5 * 80 };

// ───────────── tall sagital ─────────────
const HS = 0.82, HX = 230, HY = 20; // escala i posició del cap dins el contingut

// ───────────── text amb contorn ─────────────
const outline = (col, w) => Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `${r2(Math.cos(a) * w)}px ${r2(Math.sin(a) * w)}px 0 ${col}`; }).join(",");

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W_}px;height:${H_}px;overflow:hidden;background:#0F172A}
#root{position:absolute;inset:0;overflow:hidden;background:#DCE8EF;font-family:Inter,sans-serif}
#clinicL{position:absolute;left:0;top:0;width:${W_}px;height:${H_}px;transform-origin:0 0}
#screenL{position:absolute;left:${M.x}px;top:${M.y}px;transform:scale(${1 / KZ});width:${FIN.w}px;height:${FIN.h}px;transform-origin:0 0;background:#F8FAFC;overflow:hidden}
#ui{position:absolute;inset:0}
.top{position:absolute;left:0;top:0;right:0;height:40px;background:#E2E8F0;display:flex;align-items:center;gap:10px;padding-left:18px}
.top i{width:14px;height:14px;border-radius:50%;display:block}
.top b{margin-left:24px;font:600 18px Inter;color:#475569}
.side{position:absolute;left:0;top:40px;bottom:0;width:70px;background:#F1F5F9;border-right:2px solid #E2E8F0}
.side i{display:block;width:34px;height:34px;border-radius:8px;background:#CBD5E1;margin:22px auto 0}
.side i.on{background:#60A5FA}
#content{position:absolute;left:${CX}px;top:${CY}px;width:${CW}px;height:${CH}px}
.page{position:absolute;inset:0;opacity:0}
.page svg{position:absolute;left:0;top:0;overflow:visible}
.ttl{position:absolute;left:30px;top:6px;font:800 34px Inter;color:#0F172A;letter-spacing:.01em}
.anc{position:absolute;width:0;height:0}
.ctr{position:absolute;left:0;top:0;transform:translate(-50%,-50%)}
.tag{font:800 30px Inter;white-space:nowrap;padding:8px 18px;border-radius:12px;color:#fff;opacity:0;box-shadow:0 8px 20px rgba(15,23,42,.18)}
.lab{font:700 26px Inter;color:#334155;white-space:nowrap;opacity:0}
.kw{font-family:"Archivo Black",Inter,sans-serif;white-space:nowrap;opacity:0;letter-spacing:.01em;line-height:1.02;text-align:center}
#gl{position:absolute;left:0;top:0;width:1120px;height:${CH}px}
.chip{position:absolute;top:8px;font:800 24px Inter;padding:8px 16px;border-radius:999px;border:3px solid;opacity:.0;background:#fff}
#fade{position:absolute;inset:0;background:#000}
.l3{position:absolute;left:0;top:0;width:0;height:0}
`;

// ───────────── HTML ─────────────
const tagH = (id, txt, bg, x, y, size = 30) => `<div class="anc" style="left:${r2(x)}px;top:${r2(y)}px"><div class="ctr"><div class="tag" id="${id}" style="background:${bg};font-size:${size}px">${txt}</div></div></div>`;
const kwH = (id, html, x, y, size, col) => `<div class="anc" style="left:${x}px;top:${y}px"><div class="ctr"><div class="kw" id="${id}" style="font-size:${size}px;color:${col};text-shadow:${outline("#fff", 7)},0 14px 26px rgba(15,23,42,.35)">${html}</div></div></div>`;

const svgTag = (id, txt, x, y) => { const w = txt.length * 17 + 40; return `<g transform="translate(${r2(x)},${r2(y)})"><g id="${id}" opacity="0"><rect x="${-w / 2}" y="-28" width="${w}" height="56" rx="14" fill="${A.C.red}" filter="url(#gSh)"/><text y="11" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" fill="#fff">${txt}</text></g></g>`; };
// Pàgina 1 · odontograma
const page1 = `<div class="page" id="pg1">
  <div class="ttl">Odontograma · arcada inferior</div>
  <svg width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">${A.DEFS}
   <g id="occCam">
    <g transform="translate(${OC.x},${OC.y}) scale(${OC.s})">
      ${occ.svg}${occ.nums}
      <text x="-470" y="-300" font-family="Inter" font-weight="700" font-size="26" fill="#94A3B8" text-anchor="middle">Dreta</text>
      <text x="470" y="-300" font-family="Inter" font-weight="700" font-size="26" fill="#94A3B8" text-anchor="middle">Esquerra</text>
      <!-- càries -->
      <g transform="translate(${r2(cav46.x)},${r2(cav46.y)})"><g id="car46" opacity="0"><ellipse rx="20" ry="16" fill="#5B3A1E"/><ellipse rx="11" ry="8" fill="#2B1608"/></g></g>
      <g transform="translate(${r2(cav45.x)},${r2(cav45.y)}) rotate(${r2(p45.rot)})"><g id="car45" opacity="0"><ellipse rx="16" ry="9" fill="#5B3A1E"/><ellipse rx="8" ry="4.5" fill="#2B1608"/></g></g>
      <!-- cercles que es dibuixen -->
      <circle id="ring46" cx="${r2(cav46.x)}" cy="${r2(cav46.y)}" r="78" fill="none" stroke="${A.C.red}" stroke-width="9" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 ${r2(cav46.x)} ${r2(cav46.y)})"/>
      <circle id="ring45" cx="${r2(cav45.x)}" cy="${r2(cav45.y)}" r="62" fill="none" stroke="${A.C.red}" stroke-width="9" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 ${r2(cav45.x)} ${r2(cav45.y)})"/>
      ${svgTag("lab46", "46 · oclusal", p46.x + p46.nx * 210, p46.y + p46.ny * 210 - 40)}
      ${svgTag("lab45", "45 · vestibular", p45.x + p45.nx * 230, p45.y + p45.ny * 230 + 30)}
      <g transform="translate(${r2(ipx.x)},${r2(ipx.y)})"><g id="papil" opacity="0"><path d="M-22 18 L0 -26 L22 18 Z" fill="#B91C3C"/></g></g>
      <ellipse id="ringIp" cx="${r2(ipx.x - 10)}" cy="${r2(ipx.y - 20)}" rx="70" ry="92" fill="none" stroke="${A.C.yellow}" stroke-width="10" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-20 ${r2(ipx.x - 10)} ${r2(ipx.y - 20)})"/>
    </g>
   </g>
  </svg>
</div>`;

// Pàgina 2 · plans (canvas 3D + cap petit)
const RP = { x: 1120 + (CW - 1120) / 2, y: CH / 2 + 40 };
const page2 = `<div class="page" id="pg2">
  <canvas id="gl" width="1120" height="${CH}"></canvas>
  <div class="chip" id="chS" style="left:30px;color:${A.C.blue};border-color:${A.C.blue}">SAGITAL</div>
  <div class="chip" id="chF" style="left:200px;color:${A.C.green};border-color:${A.C.green}">FRONTAL</div>
  <div class="chip" id="chT" style="left:375px;color:#B7791F;border-color:${A.C.yellow}">TRANSVERSAL</div>
  ${["S", "F", "T"].map((k, i) => `<div class="anc" style="left:${RP.x}px;top:120px"><div class="ctr"><div class="kw" id="pt${k}" style="font-size:52px;color:${[A.C.blue, A.C.green, "#CA8A04"][i]};text-shadow:${outline("#fff", 5)}">PLA ${["SAGITAL", "FRONTAL", "TRANSVERSAL"][i]}</div></div></div>`).join("")}
  <svg width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}" style="pointer-events:none">${A.DEFS}
    <g transform="translate(${RP.x},${RP.y})">
      <rect x="-250" y="-260" width="500" height="560" rx="36" fill="#fff" stroke="#E2E8F0" stroke-width="4" filter="url(#gSh)"/>
      <g id="mhF" opacity="0"><g transform="scale(1.25)">${A.headFront()}</g>
        <path id="mlS" d="M0 -230 V250" stroke="${A.C.blue}" stroke-width="10" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
        <text x="-150" y="250" font-family="Inter" font-weight="800" font-size="30" fill="${A.C.blue}" text-anchor="middle" id="mtD" opacity="0">DRETA</text>
        <text x="150" y="250" font-family="Inter" font-weight="800" font-size="30" fill="${A.C.blue}" text-anchor="middle" id="mtE" opacity="0">ESQUERRA</text></g>
      <g id="mhS" opacity="0"><g transform="translate(10,0) scale(1.25)">${A.headSide()}</g>
        <g id="mzA" opacity="0"><path d="M-200 -230 H-62 V250 H-200 Z" fill="${A.C.green}" opacity=".16"/></g>
        <g id="mzP" opacity="0"><path d="M-62 -230 H240 V250 H-62 Z" fill="${A.C.green}" opacity=".10"/></g>
        <path id="mlF" d="M-62 -230 V250" stroke="${A.C.green}" stroke-width="10" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
        <path id="mlT" d="M-230 88 H230" stroke="${A.C.yellow}" stroke-width="10" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
        <text x="-150" y="-180" font-family="Inter" font-weight="800" font-size="28" fill="${A.C.green}" text-anchor="middle" id="mtL" opacity="0">llavis</text>
        <text x="90" y="-180" font-family="Inter" font-weight="800" font-size="28" fill="${A.C.green}" text-anchor="middle" id="mtFa" opacity="0">faringe</text></g>
    </g>
  </svg>
  <div class="l3" id="L3a"><div class="ctr"><div class="tag" id="t3a">·</div></div></div>
  <div class="l3" id="L3b"><div class="ctr"><div class="tag" id="t3b">·</div></div></div>
</div>`;

// Pàgina 3 · tall sagital del cap
const HL = (id, d, fill, extra = "") => `<path id="${id}" d="${d}" fill="${fill}" opacity="0" ${extra}/>`;
const leader = (id, txt, ax, ay, lx, ly, anchor) => `<g id="${id}" opacity="0"><path d="M${ax} ${ay} L${lx} ${ly}" stroke="#64748B" stroke-width="3"/><circle cx="${ax}" cy="${ay}" r="7" fill="#334155"/><text x="${lx + (anchor === "end" ? -10 : 10)}" y="${ly + 10}" text-anchor="${anchor}" font-family="Inter" font-weight="700" font-size="42" fill="#334155">${txt}</text></g>`;
const page3 = `<div class="page" id="pg3">
  <div class="ttl" id="pg3t">Tall sagital</div>
  <svg width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">${A.DEFS}
   <g id="headCam">
    <g transform="translate(${HX},${HY}) scale(${HS})">
      ${A.sagittalHead()}
      ${HL("hiOral", A.HEAD.proper + " " + A.HEAD.vestUp + " " + A.HEAD.vestLow, "#38BDF8", 'stroke="#0284C7" stroke-width="4"')}
      ${HL("hiVest", A.HEAD.vestUp + " " + A.HEAD.vestLow, "#EC4899", 'stroke="#BE185D" stroke-width="3" filter="url(#gGlow)"')}
      ${HL("hiProp", A.HEAD.proper, "#F97316", 'stroke="#C2410C" stroke-width="4"')}
      <path id="hiLipsRing" d="M262 410 C180 410 170 610 262 612" fill="none" stroke="#FACC15" stroke-width="12" stroke-linecap="butt" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" filter="url(#gGlow)"/>
      <path id="hiDiv" d="M268 440 L278 600" stroke="#0F172A" stroke-width="5" stroke-dasharray="12 10" opacity="0"/>
      ${leader("lbNas", "Cavitat nasal", 380, 370, 120, 300, "end")}
      ${leader("lbPal", "Paladar", 400, 444, 120, 400, "end")}
      ${leader("lbLle", "Llengua", 420, 540, 120, 700, "end")}
      ${leader("lbFar", "Faringe", 590, 560, 980, 520, "start")}
      ${leader("lbLar", "Laringe", 520, 780, 980, 800, "start")}
    </g>
   </g>
  </svg>
  <div class="anc" style="left:${CW - 330}px;top:${CH - 260}px"><div class="ctr"><div id="lipsBox" style="opacity:0;width:440px;height:260px;border-radius:28px;background:#fff;box-shadow:0 16px 40px rgba(15,23,42,.25);overflow:hidden">
    <svg width="440" height="260" viewBox="-220 -130 440 260"><rect x="-220" y="-130" width="440" height="260" fill="#F6CDB0"/>
      <path d="M-170 0 C-110 -70 -40 -64 0 -46 C40 -64 110 -70 170 0 C110 6 40 6 0 4 C-40 6 -110 6 -170 0 Z" fill="#D9707F"/>
      <path d="M-170 0 C-110 90 110 90 170 0 C110 10 -110 10 -170 0 Z" fill="#E07A84"/>
      <g id="lipsOpen" transform="scale(1,0.05)"><path d="M-150 0 C-80 -40 80 -40 150 0 C80 40 -80 40 -150 0 Z" fill="#5B1220"/><path d="M-110 -22 H110 V-8 H-110 Z" fill="#FFFDF6"/></g>
    </svg></div></div></div>
</div>`;

// paraules clau grans (fora de la pantalla, per sobre)
const KW = [
  kwH("kCar", "2 CÀRIES", 960, 150, 120, A.C.red),
  kwH("kGen", "GENIVA INFLAMADA", 960, 150, 96, "#BE123C"),
  kwH("kReg", "REGIÓ ORAL", 1460, 170, 110, "#CA8A04"),
  kwH("kCav", "CAVITAT ORAL", 1460, 170, 110, "#0284C7"),
  kwH("kVes", "VESTÍBUL ORAL", 1460, 170, 110, "#DB2777"),
  kwH("kPro", "CAVITAT ORAL<br>PRÒPIAMENT DITA", 1400, 200, 82, "#EA580C"),
  kwH("k2", "2 ESPAIS", 1460, 880, 120, A.C.ink),
].join("");

// ───────────── línia de temps (GSAP) ─────────────
const T = [];
const tw = (sel, from, vars, t) => { const o = { sel, from, vars, t }; T.push(o); return o; };
const to = (sel, vars, t) => tw(sel, null, vars, t);
const fromTo = (sel, a, b, t) => tw(sel, a, b, t);
const set = (sel, vars, t) => T.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(vars)}, ${r2(t)});`);
const raw = (s) => T.push(s);
const pop = (sel, t, extra = {}) => fromTo(sel, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)", ...extra }, t);
const slam = (sel, t) => { fromTo(sel, { opacity: 0, scale: 1.6, rotation: -4 }, { opacity: 1, scale: 1, rotation: -2, duration: 0.32, ease: "power4.in" }, t); punch(t + 0.32); };
const out = (sel, t, d = 0.3) => to(sel, { opacity: 0, scale: 0.85, duration: d, ease: "power2.in" }, t);
const draw = (sel, t, d = 0.7) => fromTo(sel, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut" }, t);
const undraw = (sel, t, d = 0.3) => to(sel, { opacity: 0, duration: d }, t);
const fadeIn = (sel, t, d = 0.4, op = 1) => fromTo(sel, { opacity: 0 }, { opacity: op, duration: d, ease: "power1.out" }, t);
const punch = (t, s = 1.03) => { to("#punchz", { scale: s, duration: 0.12, ease: "power3.out" }, t); to("#punchz", { scale: 1, duration: 0.45, ease: "power2.inOut" }, t + 0.13); };
// càmera d'un grup SVG (pàgina 1 i 3): centra el punt (x,y) del contingut amb zoom s
const svgCam = (sel, t, x, y, s, d = 1.0, ease = "power3.inOut") => to(sel, { x: r2(CW / 2 - x * s), y: r2(CH / 2 - y * s), scale: s, duration: d, ease }, t);
const pulse = (sel, t, n = 3, s = 1.08) => fromTo(sel, { scale: 1 }, { scale: s, duration: 0.22, repeat: n * 2 - 1, yoyo: true, ease: "sine.inOut" }, t);

raw(`gsap.set(["#occCam","#lab46","#lab45","#headCam","#car46","#car45","#papil","#hTongue","#hPalHard","#hPalSoft","#hTeeth","#hLips","#hGumUp","#hGumLow","#mhF","#mhS"], {svgOrigin:"0 0"});`);
raw(`gsap.set(["#hTongue"], {svgOrigin:"${r2(420 * HS + HX)} ${r2(560 * HS + HY)}"});`);

// ═════ 0–16 · clínica ═════
set("#clinicL", { scale: 1.12, x: -60, y: -40 }, 0);
to("#fade", { opacity: 0, duration: 1.4, ease: "power1.out" }, 0.1);
to("#clinicL", { scale: 1.0, x: 0, y: 0, duration: 5.2, ease: "sine.inOut" }, 0.2);
fadeIn("#lampBeam", 5.5, 0.35, 1);
fromTo("#lampOn", { fill: "#FEF3C7" }, { fill: "#FFFBEB", duration: 0.3 }, 5.5);
fadeIn("#pg1", 3.0, 0.8);
// apropament al pacient
to("#clinicL", { scale: 1.9, x: -300 * 1.9 + 760, y: -500 * 1.9 + 540, duration: 4.5, ease: "power2.inOut" }, 9.6);
fadeIn("#tools", 13.6, 0.5);
fromTo("#tools", { x: 60, y: -30 }, { x: 0, y: 0, duration: 1.2, ease: "power2.out" }, 13.6);
fromTo("#tools", { rotation: -4 }, { rotation: 4, duration: 0.5, repeat: 3, yoyo: true, ease: "sine.inOut", svgOrigin: "0 0" }, 14.8);
// cap al monitor
const tMon = P("detectat") - 0.3, dMon = 1.7;
raw(`tl.fromTo("#clinicL", {scale:1.9, x:${r2(-300 * 1.9 + 760)}, y:${r2(-500 * 1.9 + 540)}}, {scale:${r2(KZ)}, x:${r2(FIN.x - M.x * KZ)}, y:${r2(FIN.y - M.y * KZ)}, duration:${dMon}, ease:"power3.inOut", immediateRender:false}, ${r2(tMon)});`);

// ═════ 16–35 · odontograma ═════
slam("#kCar", P("càries") - 0.1);
out("#kCar", P("càries") + 1.3);
const c46 = tp(46), c45 = tp(45), cip = { x: OC.x + ipx.x * OC.s, y: OC.y + ipx.y * OC.s };
svgCam("#occCam", P("oclusal") - 0.6, c46.x, c46.y, 1.9, 1.0);
pop("#car46", P("oclusal") - 0.05);
fromTo("#car46", { scale: 0.2 }, { scale: 1, duration: 0.8, ease: "power2.out" }, P("oclusal"));
draw("#ring46", P("oclusal") + 0.2);
pop("#lab46", P("molar"));
svgCam("#occCam", P("altra") - 0.1, c45.x, c45.y, 1.9, 1.0);
pop("#car45", P("vestibular") - 0.05);
draw("#ring45", P("vestibular") + 0.2);
pop("#lab45", P("premolar"));
svgCam("#occCam", P("també") - 0.2, CW / 2, CH / 2, 1, 1.1);
to(["#lab46", "#lab45"], { opacity: 0, duration: 0.3 }, P("també") - 0.2);
fromTo("#gumInfl", { opacity: 0 }, { opacity: 0.85, duration: 1.4, ease: "sine.inOut" }, P("inflamació"));
fromTo("#gumInfl", { strokeWidth: 132 }, { strokeWidth: 146, duration: 0.5, repeat: 3, yoyo: true, ease: "sine.inOut" }, P("generalitzada"));
slam("#kGen", P("geniva") - 0.1);
out("#kGen", P("afectació") + 0.6);
svgCam("#occCam", P("zona", 1) - 0.4, cip.x, cip.y - 30, 2.0, 1.0);
pop("#papil", P("interproximal") - 0.1);
pulse("#papil", P("interproximal") + 0.4, 4, 1.25);
draw("#ringIp", P("interproximal") + 0.1, 0.8);
fromTo(["#t45", "#t46"], { opacity: 1 }, { opacity: 0.55, duration: 0.25, repeat: 3, yoyo: true }, P("dues", 2));

// ═════ 35–62 · plans (3D) ═════
const tP2 = P("per", 1) - 0.1;
to("#pg1", { opacity: 0, x: -120, duration: 0.5, ease: "power2.in" }, tP2);
fromTo("#pg2", { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, tP2 + 0.35);
fromTo("#pg2", { opacity: 1 }, { opacity: 1, duration: 0.01 }, tP2 + 1);
[["#chS", 0], ["#chF", 0.2], ["#chT", 0.4]].forEach(([s, d]) => pop(s, P("plans", 1) + d));
const K3 = {
  start: tP2 + 0.3,
  sag: P("sagital", 1) - 0.3, sagSplit: P("divideix", 1), dreta: P("dreta"), esq: P("esquerra"),
  fro: P("frontal") - 0.3, froSplit: P("divideix", 2), ant: P("anterior"), post: P("posterior"),
  tra: P("transversal") - 0.3, traSplit: P("divideix", 3), sup: P("superior"), inf: P("inferior", 3),
  end: P("continuació") - 0.1,
};
// xips i títols
const chipOn = (s, t, t2) => { to(s, { scale: 1.12, duration: 0.25, ease: "back.out(2)" }, t); if (t2) to(s, { scale: 1, duration: 0.25 }, t2); };
chipOn("#chS", K3.sag, K3.fro); chipOn("#chF", K3.fro, K3.tra); chipOn("#chT", K3.tra, K3.end);
slam("#ptS", K3.sag + 0.2); out("#ptS", K3.fro - 0.1);
slam("#ptF", K3.fro + 0.2); out("#ptF", K3.tra - 0.1);
slam("#ptT", K3.tra + 0.2);
// cap petit
pop("#mhF", K3.sag); draw("#mlS", K3.sag + 0.4, 0.6);
fadeIn("#mtD", K3.dreta - 0.1, 0.3); fadeIn("#mtE", K3.esq - 0.1, 0.3);
out("#mhF", K3.fro - 0.2);
pop("#mhS", K3.fro); draw("#mlF", K3.fro + 0.4, 0.6);
fadeIn("#mzA", K3.ant - 0.1, 0.4); fadeIn("#mtL", P("llavis", 1) - 0.1, 0.3);
fadeIn("#mzP", K3.post - 0.1, 0.4); fadeIn("#mtFa", P("faringe", 1) - 0.1, 0.3);
to(["#mzA", "#mzP", "#mtL", "#mtFa", "#mlF"], { opacity: 0, duration: 0.3 }, K3.tra - 0.2);
draw("#mlT", K3.tra + 0.4, 0.6);
// etiquetes 3D (posició des del render; aquí només l'opacitat)
const lab3 = (id, t, t2) => { fromTo(id, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, t); to(id, { opacity: 0, duration: 0.25 }, t2); };
lab3("#t3a", K3.dreta - 0.1, K3.fro - 0.3); lab3("#t3b", K3.esq - 0.1, K3.fro - 0.3);
lab3("#t3a", K3.ant - 0.1, K3.tra - 0.3); lab3("#t3b", K3.post - 0.1, K3.tra - 0.3);
lab3("#t3a", K3.sup - 0.1, K3.end); lab3("#t3b", K3.inf - 0.1, K3.end);

// ═════ 62–101 · tall sagital del cap ═════
const tP3 = K3.end;
to("#pg2", { opacity: 0, x: -120, duration: 0.5, ease: "power2.in" }, tP3);
fromTo("#pg3", { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, tP3 + 0.35);
// cap: entra amb un pla sagital blau que l'escombra
fromTo("#headCam", { scale: 0.92, x: r2(CW * 0.04), y: r2(CH * 0.04) }, { scale: 1, x: 0, y: 0, duration: 1.4, ease: "power2.out" }, tP3 + 0.35);
[["#lbNas", 0], ["#lbPal", 0.35], ["#lbLle", 0.7], ["#lbFar", 1.05], ["#lbLar", 1.4]].forEach(([s, d]) => fadeIn(s, P("diferenciar") + d, 0.35));
// localitzem: zoom a la boca
const HP = (x, y) => ({ x: HX + x * HS, y: HY + y * HS });
const mouth = HP(300, 520);
svgCam("#headCam", P("localitzar") - 0.2, mouth.x + 180, mouth.y, 1.35, 1.4);
to(["#lbNas", "#lbPal", "#lbLle", "#lbFar", "#lbLar"], { opacity: 0, duration: 0.4 }, P("localitzar") - 0.2);
// regió oral
draw("#hiLipsRing", P("regió") - 0.1, 0.9);
slam("#kReg", P("regió") + 0.1);
pulse("#hLips", P("llavis", 2) - 0.1, 2, 1.06);
fromTo("#lipsBox", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, P("llavis", 2) - 0.1);
fromTo("#lipsOpen", { scaleY: 0.05 }, { scaleY: 1, duration: 0.6, ease: "power2.out", svgOrigin: "0 0" }, P("l'obertura"));
out("#lipsBox", P("canvi") - 0.1);
out("#kReg", P("canvi") - 0.1);
to("#hiLipsRing", { opacity: 0, duration: 0.4 }, P("canvi"));
// cavitat oral
fadeIn("#hiOral", P("cavitat", 1) - 0.1, 0.6, 0.7);
slam("#kCav", P("cavitat", 1));
fromTo("#hiOral", { opacity: 0.7 }, { opacity: 0.35, duration: 0.4, repeat: 3, yoyo: true }, P("obrim"));
// dues parts
to("#hiDiv", { opacity: 1, duration: 0.3 }, P("dues", 3) - 0.1);
fromTo("#hiDiv", { strokeDashoffset: 0 }, { strokeDashoffset: -88, duration: 1.6, ease: "none" }, P("dues", 3));
// vestíbul (zoom fort a la zona dels llavis)
const vest = HP(262, 515);
svgCam("#headCam", P("vestíbul", 1) - 0.5, vest.x + 60, vest.y, 2.6, 1.1);
out("#kCav", P("vestíbul", 1) - 0.4);
to("#hiOral", { opacity: 0, duration: 0.4 }, P("vestíbul", 1) - 0.2);
to("#hiDiv", { opacity: 0, duration: 0.3 }, P("vestíbul", 1) - 0.2);
fadeIn("#hiVest", P("vestíbul", 1), 0.4);
slam("#kVes", P("vestíbul", 1) + 0.05);
pulse("#hLips", P("llavis", 3) - 0.1, 2, 1.04);
pulse("#hTeeth", P("dents", 2) - 0.1, 2, 1.04);
fromTo(["#hGumUp", "#hGumLow"], { opacity: 1 }, { opacity: 0.3, duration: 0.2, repeat: 3, yoyo: true }, P("genives") - 0.1);
// cavitat oral pròpiament dita
const prop = HP(410, 530);
svgCam("#headCam", P("pròpiament") - 0.6, prop.x + 120, prop.y, 1.55, 1.2);
out("#kVes", P("pròpiament") - 0.5);
to("#hiVest", { opacity: 0.35, duration: 0.4 }, P("pròpiament") - 0.5);
fadeIn("#hiProp", P("pròpiament") - 0.2, 0.6, 0.62);
slam("#kPro", P("pròpiament"));
to("#headCam", { scale: 1.68, x: r2(CW / 2 - (prop.x + 120) * 1.68), y: r2(CH / 2 - prop.y * 1.68), duration: 5, ease: "sine.inOut" }, P("pròpiament") + 0.7);
fromTo("#hiProp", { opacity: 0.62 }, { opacity: 0.85, duration: 0.3, repeat: 1, yoyo: true }, P("arcades") - 0.1);
pulse("#hTeeth", P("arcades") - 0.1, 1, 1.05);
pulse("#hTongue", P("llengua", 1) - 0.1, 2, 1.05);
fromTo(["#hPalHard", "#hPalSoft"], { opacity: 1 }, { opacity: 0.35, duration: 0.2, repeat: 3, yoyo: true }, P("paladar") - 0.1);
// dos espais
out("#kPro", P("bé") - 0.2);
svgCam("#headCam", P("bé") - 0.25, prop.x + 60, prop.y, 1.4, 0.6);
to("#hiVest", { opacity: 1, duration: 0.3 }, P("bé"));
pulse("#hiVest", P("dos", 1) - 0.4, 1, 1.0);
slam("#k2", P("bé") + 0.05);

// ───────────── 3D: claus i escena ─────────────
const K3json = JSON.stringify(Object.fromEntries(Object.entries(K3).map(([k, v]) => [k, r2(v)])));
const THREE_JS = `
import * as THREE from "./assets/vendor/three.module.js";
const K = ${K3json};
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(1120, ${CH}, false); renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight("#FFFFFF", "#C9B8B0", 1.1));
const key = new THREE.DirectionalLight("#FFF6EC", 2.2); key.position.set(30, 60, 50); scene.add(key);
const fill = new THREE.DirectionalLight("#DCEBFF", 0.7); fill.position.set(-50, 20, 10); scene.add(fill);
const rim = new THREE.DirectionalLight("#FFFFFF", 0.8); rim.position.set(0, 30, -60); scene.add(rim);
const camera = new THREE.PerspectiveCamera(30, 1120 / ${CH}, 1, 2000);
const enamel = new THREE.MeshPhysicalMaterial({ color: "#F7F1E3", roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 });
const gumM = new THREE.MeshPhysicalMaterial({ color: "#E8899A", roughness: 0.45, clearcoat: 0.3 });
const baseM = new THREE.MeshStandardMaterial({ color: "#D9707F", roughness: 0.6 });
// arcades (mm)
function arch(upper) {
  const W = upper ? [8.5, 6.5, 7.5, 7, 6.5, 10, 9, 8.5] : [5.5, 6, 7, 7, 7.5, 11, 10.5, 10];
  const Hh = upper ? [10.5, 9, 10, 8.5, 7.5, 7, 6.5, 6] : [9, 9.5, 11, 8.5, 8, 7, 6.5, 6];
  const BL = upper ? [7, 6, 8, 9, 9, 11, 11, 10] : [6, 6, 7.5, 8, 8.5, 10.5, 10, 9.5];
  const R0 = upper ? 17 : 14.5, A0 = 1.05;
  const pts = []; for (let i = 0; i <= 200; i++) { const a = (i / 200) * A0; pts.push([R0 * Math.sin(a), R0 * Math.cos(a)]); }
  const dx = Math.cos(A0) * 1.1, dz = -Math.sin(A0), nn = Math.hypot(dx, dz), last = pts[200];
  for (let i = 1; i <= 400; i++) pts.push([last[0] + (dx / nn) * i * 0.2, last[1] + (dz / nn) * i * 0.2]);
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = (s) => { let i = cum.findIndex((c) => c >= s); if (i <= 0) i = 1; const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1]); const p = pts[i - 1], q = pts[i]; return { x: p[0] + (q[0] - p[0]) * f, z: p[1] + (q[1] - p[1]) * f, a: Math.atan2(q[0] - p[0], q[1] - p[1]) }; };
  const out = []; let s = 0;
  W.forEach((w, k) => { const c = at(s + w / 2); out.push({ n: k + 1, w, h: Hh[k], bl: BL[k], ...c }); s += w + 0.2; });
  return out;
}
const GAP = 1.2;
const teeth = [];
const capG = new THREE.CapsuleGeometry(0.5, 1, 8, 20);
const sphG = new THREE.SphereGeometry(0.5, 24, 16);
for (const upper of [true, false]) for (const side of [-1, 1]) for (const t of arch(upper)) {
  const g = new THREE.Group();
  const x = side * t.x, z = t.z - 8, ang = side * t.a;
  g.position.set(x, 0, z);
  g.rotation.y = ang; // eix local z = direcció de l'arcada → x local = vestibulolingual
  const crown = new THREE.Mesh(capG, enamel);
  const yc = upper ? GAP + t.h / 2 : -GAP - t.h / 2;
  crown.scale.set(t.bl, t.h / 2, t.w * 0.98); crown.position.y = yc;
  if (t.n <= 2) crown.scale.x = t.bl * 0.75;
  g.add(crown);
  // geniva (tros)
  const gum = new THREE.Mesh(capG, gumM);
  const gh = 9;
  gum.scale.set(t.bl * 1.28, gh / 2, (t.w + 0.6) * 1.05);
  gum.position.y = upper ? GAP + t.h + gh / 2 - 2.6 : -GAP - t.h - gh / 2 + 2.6;
  g.add(gum);
  scene.add(g);
  teeth.push({ g, x, z, upper, home: g.position.clone() });
}
// pla frontal: entre canins i premolars
const z3 = teeth.filter((t) => !t.upper).map((t) => t.z);
const ZF = (() => { const a = arch(false), b = arch(true); return ((a[2].z + a[3].z) / 2 + (b[2].z + b[3].z) / 2) / 2 - 8; })();
function plane(w, h, color) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }));
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 }));
  g.add(m); g.add(e); g.userData.mats = [m.material, e.material]; scene.add(g); return g;
}
const pS = plane(60, 50, "#2563EB"); pS.rotation.y = Math.PI / 2; pS.position.set(0, 0, -6);
const pF = plane(62, 50, "#16A34A"); pF.position.set(0, 0, ZF);
const pT = plane(62, 60, "#EAB308"); pT.rotation.x = -Math.PI / 2; pT.position.set(0, 0, -6);
const planeVis = (p, k, s) => { p.visible = k > 0.001; p.userData.mats[0].opacity = 0.32 * k; p.userData.mats[1].opacity = 0.95 * k; p.scale.set(1, Math.max(0.001, s), 1); };
// càmeres (posició, objectiu)
const CAMS = {
  intro: [[40, 58, 96], [0, -1, -16]],
  sag: [[28, 72, 114], [0, -1, -16]],
  fro: [[120, 42, 34], [0, -1, -14]],
  tra: [[78, 26, 84], [0, 0, -15]],
};
const lab = [document.getElementById("L3a"), document.getElementById("L3b")];
const tagA = document.getElementById("t3a"), tagB = document.getElementById("t3b");
function setLabel(i, v) { const p = v.clone().project(camera); lab[i].style.left = ((p.x + 1) / 2 * 1120).toFixed(1) + "px"; lab[i].style.top = ((1 - p.y) / 2 * ${CH}).toFixed(1) + "px"; }
function render(t) {
  if (t < K.start - 0.5 || t > K.end + 1.2) return;
  // càmera
  let cp = CAMS.intro, w;
  const mix = (a, b, k) => [a[0].map((v, i) => lerp(v, b[0][i], k)), a[1].map((v, i) => lerp(v, b[1][i], k))];
  cp = mix(CAMS.intro, CAMS.sag, ss(K.sag - 0.6, K.sag + 0.6, t));
  cp = mix(cp, CAMS.fro, ss(K.fro - 0.6, K.fro + 0.9, t));
  cp = mix(cp, CAMS.tra, ss(K.tra - 0.6, K.tra + 0.9, t));
  const orb = Math.sin(t * 0.35) * 2.5;
  camera.position.set(cp[0][0] + orb, cp[0][1], cp[0][2] - orb * 0.4);
  camera.lookAt(cp[1][0], cp[1][1], cp[1][2]);
  // aparició del model
  const ap = ss(K.start, K.start + 1.0, t);
  scene.scale.setScalar(lerp(0.75, 1, ap));
  scene.rotation.y = (1 - ap) * -0.6;
  // plans
  const kS = ss(K.sag, K.sag + 0.6, t) * (1 - ss(K.fro - 0.5, K.fro, t));
  const kF = ss(K.fro, K.fro + 0.6, t) * (1 - ss(K.tra - 0.5, K.tra, t));
  const kT = ss(K.tra, K.tra + 0.6, t);
  planeVis(pS, kS, ss(K.sag, K.sag + 0.7, t)); planeVis(pF, kF, ss(K.fro, K.fro + 0.7, t)); planeVis(pT, kT, ss(K.tra, K.tra + 0.7, t));
  // separació de meitats
  const dS = 5 * ss(K.sagSplit, K.sagSplit + 0.8, t) * (1 - ss(K.fro - 0.5, K.fro, t));
  const dF = 9 * ss(K.froSplit, K.froSplit + 0.8, t) * (1 - ss(K.tra - 0.5, K.tra, t));
  const dT = 5 * ss(K.traSplit, K.traSplit + 0.8, t);
  for (const q of teeth) {
    q.g.position.set(q.home.x + Math.sign(q.x) * dS, q.home.y + (q.upper ? 1 : -1) * dT, q.home.z + (q.z > ZF ? 1 : -1) * dF);
  }
  // etiquetes
  const ph = t < K.fro - 0.3 ? 0 : t < K.tra - 0.3 ? 1 : 2;
  if (ph === 0) { tagA.textContent = "DRETA"; tagB.textContent = "ESQUERRA"; tagA.style.background = tagB.style.background = "#2563EB"; setLabel(0, new THREE.Vector3(-26, 18, -8)); setLabel(1, new THREE.Vector3(26, 18, -8)); }
  if (ph === 1) { tagA.textContent = "ANTERIOR · llavis"; tagB.textContent = "POSTERIOR · faringe"; tagA.style.background = tagB.style.background = "#16A34A"; setLabel(0, new THREE.Vector3(-4, 22, ZF + 16)); setLabel(1, new THREE.Vector3(10, 22, ZF - 38)); }
  if (ph === 2) { tagA.textContent = "SUPERIOR"; tagB.textContent = "INFERIOR"; tagA.style.background = tagB.style.background = "#CA8A04"; setLabel(0, new THREE.Vector3(0, 24, -6)); setLabel(1, new THREE.Vector3(0, -26, -6)); }
  renderer.render(scene, camera);
}
window.addEventListener("hf-seek", (e) => render(e.detail.time));
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady["three"] = Promise.resolve();
render(K.start + 2);
`;

// ───────────── escriptura ─────────────
function serialize() {
  const META = new Set(["duration", "ease", "repeat", "yoyo", "repeatDelay", "svgOrigin", "transformOrigin", "immediateRender"]);
  const objs = T.filter((o) => typeof o !== "string");
  const props = (o) => Object.keys(o.vars).filter((k) => !META.has(k));
  const byT = [...objs].sort((a, b) => a.t - b.t);
  byT.forEach((a, i) => {
    if (a.vars.repeat) return;
    for (let j = i + 1; j < byT.length; j++) {
      const b = byT[j];
      if (b.t >= a.t + a.vars.duration) break;
      if (JSON.stringify(b.sel) !== JSON.stringify(a.sel) || b.t <= a.t || b.vars.repeat) continue;
      if (props(b).some((k) => props(a).includes(k))) { a.vars.duration = Math.max(0.04, r2(b.t - a.t)); break; }
    }
  });
  return T.map((o) => typeof o === "string" ? o
    : o.from ? `tl.fromTo(${JSON.stringify(o.sel)}, ${JSON.stringify(o.from)}, ${JSON.stringify({ immediateRender: false, ...o.vars })}, ${r2(o.t)});`
    : `tl.to(${JSON.stringify(o.sel)}, ${JSON.stringify(o.vars)}, ${r2(o.t)});`).join("\n  ");
}

const html = `<!doctype html>
<html lang="ca">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W_}, height=${H_}" />
<script src="assets/vendor/gsap.min.js"></script>
<style>${CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W_}" data-height="${H_}" data-fps="30">
  <div id="punchz" style="position:absolute;inset:0;transform-origin:50% 50%">
    <div id="clinicL">${A.clinic()}
    <div id="screenL">
      <div id="ui"><div class="top"><i style="background:#F87171"></i><i style="background:#FBBF24"></i><i style="background:#34D399"></i><b>Clínica dental · Pacient 0127</b></div>
        <div class="side"><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div></div>
      <div id="content">${page1}${page2}${page3}</div>
    </div></div>
    ${KW}
  </div>
  <div id="fade"></div>
  <audio id="soundtrack" class="clip" src="assets/voz.wav" data-start="0" data-duration="${DUR}" data-track-index="2" data-volume="1"></audio>
</div>
<script>
  const tl = gsap.timeline({ paused: true });
  ${serialize()}
  window.__timelines["main"] = tl;
</script>
<script type="module">${THREE_JS}</script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, "index.html"), html);
console.log(`OK · ${DUR}s · ${T.length} instruccions · K3`, K3json);
