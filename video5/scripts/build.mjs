// Generador del vídeo 3D «A la consulta» (Three.js, 1920×1080).
// Escriu index.html (escena 3D + títols) i assets/sfx-cues.json.
// L'escena 3D es dibuixa a cada fotograma des del temps (hf-seek): render(t) és pur.
//
//   node scripts/build.mjs && node scripts/mix.mjs && node scripts/build.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TR = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/transcript.json"), "utf8"));
const DUR = TR.total;
const LAG = 0.2; // Whisper marca les paraules una mica abans del so real
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
function P(word, n = 1) {
  const k = norm(word); let c = 0;
  for (const w of TR.words) if ((norm(w.text) === k || norm(w.text.split(/['’]/).pop()) === k) && ++c === n) return +(w.start + LAG).toFixed(3);
  throw new Error(`P(${word})`);
}

// Moments clau (s) — tot el 3D i els títols en depenen.
const K = {
  door: 0.2, walkEnd: 3.4, sit: 3.6, recline: 4.6, dentistMove: 4.2,
  lampOn: 6.6, faceCam: 6.4, mouthOpen: P("durant") - 0.2, mirror: P("l'exploració"),
  dive: P("observem") - 0.3, mouthScene: P("observem") + 0.25,
  ulcer: P("úlcera"), rub: P("fregament"), tooth: P("vora"), mucosa: P("mucosa"),
  pulse: P("lingual") + 0.8, cellsDive: P("però") - 0.6, cellsScene: P("però") - 0.05,
  question: P("organisme"), four: P("quatre"), end: DUR,
};

// Efectes de so (es mesclen amb scripts/mix.mjs).
const SFX = [
  { file: "door", t: K.door + 0.1, vol: 0.5 },
  { file: "steps", t: 0.6, vol: 0.45 },
  { file: "rub", t: K.recline, vol: 0.25 },
  { file: "click1", t: K.lampOn, vol: 0.55 },
  { file: "whoosh2", t: K.dive + 0.4, vol: 0.4 },
  { file: "pop1", t: K.ulcer, vol: 0.3 },
  { file: "rub", t: K.rub, vol: 0.25 },
  { file: "impact", t: K.pulse, vol: 0.35 },
  { file: "whoosh3", t: K.cellsDive + 0.4, vol: 0.4 },
  { file: "pop2", t: K.question, vol: 0.3 },
  ...[0, 1, 2, 3].map((i) => ({ file: i % 2 ? "pop2" : "pop1", t: K.four + i * 0.35, vol: 0.3 })),
];
fs.writeFileSync(path.join(ROOT, "assets/sfx-cues.json"), JSON.stringify(SFX, null, 1));

const hasMix = fs.existsSync(path.join(ROOT, "assets/mix.wav"));
const outline = (col, w, d) => [...Array.from({ length: 16 }, (_, a) => `${(Math.cos((a * Math.PI) / 8) * w).toFixed(1)}px ${(Math.sin((a * Math.PI) / 8) * w).toFixed(1)}px 0 ${col}`), `0 ${d}px 0 ${col}`].join(",");

const html = `<!doctype html>
<html lang="ca">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<script src="assets/vendor/gsap.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; overflow: hidden; background: #000; }
  #gl { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; display: block; }
  #fade { position: absolute; inset: 0; background: #12040A; opacity: 0; pointer-events: none; }
  .t { position: absolute; left: 0; right: 0; text-align: center; font-family: "Archivo Black", Inter, sans-serif; color: #fff; text-transform: uppercase; opacity: 0; white-space: nowrap; text-shadow: ${outline("#111827", 6, 10)}; }
  #tUlc { bottom: 90px; font-size: 92px; }
  #tUlc span { color: #FFD21F; }
  #tQ { top: 50%; margin-top: -150px; font-size: 300px; }
  #t4 { bottom: 90px; font-size: 104px; }
  #t4 span { color: #FFD21F; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1920" data-height="1080" data-fps="30">
  <canvas id="gl" width="1920" height="1080"></canvas>
  <div id="fade"></div>
  <div class="t" id="tUlc"><span>ÚLCERA</span> TRAUMÀTICA</div>
  <div class="t" id="tQ">?</div>
  <div class="t" id="t4"><span>4</span> CONCEPTES</div>
  <audio id="soundtrack" class="clip" src="${hasMix ? "assets/mix.wav" : "assets/voz.wav"}" data-start="0" data-duration="${DUR}" data-track-index="2" data-volume="1"></audio>
</div>
<script>
  // Títols i fosos (GSAP).
  const tl = gsap.timeline({ paused: true });
  const slam = (s, t, out) => { tl.fromTo(s, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, t); if (out) tl.to(s, { opacity: 0, duration: 0.3 }, out); };
  slam("#tUlc", ${K.ulcer}, ${K.rub + 0.6});
  slam("#tQ", ${K.question}, ${K.question + 2.4});
  slam("#t4", ${K.four}, ${DUR + 1});
  tl.fromTo("#fade", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.in" }, ${K.mouthScene - 0.35});
  tl.to("#fade", { opacity: 0, duration: 0.6, ease: "power2.out" }, ${K.mouthScene});
  tl.fromTo("#fade", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.in" }, ${K.cellsScene - 0.35});
  tl.to("#fade", { opacity: 0, duration: 0.7, ease: "power2.out" }, ${K.cellsScene});
  window.__timelines["main"] = tl;
</script>
<script type="module">
import * as THREE from "./assets/vendor/three.module.js";
const K = ${JSON.stringify(K)};
const DUR = ${DUR};

// ── utilitats deterministes ──
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, k) => a + (b - a) * k;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...o });
function mesh(geo, m, p = [0, 0, 0], parent) { const x = new THREE.Mesh(geo, m); x.position.set(...p); x.castShadow = true; x.receiveShadow = true; if (parent) parent.add(x); return x; }
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 16);

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(1920, 1080, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const camera = new THREE.PerspectiveCamera(38, 1920 / 1080, 0.02, 200);

// ═══════════ ESCENA 1 · la consulta ═══════════
const clinic = new THREE.Scene();
clinic.background = new THREE.Color("#DCE8EF");
clinic.fog = new THREE.Fog("#DCE8EF", 12, 26);
clinic.add(new THREE.HemisphereLight("#FFFFFF", "#B9C7D3", 0.9));
const sun = new THREE.DirectionalLight("#FFF4E6", 1.6);
sun.position.set(-4, 7, 5); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -7; sun.shadow.camera.right = 7; sun.shadow.camera.top = 7; sun.shadow.camera.bottom = -7; sun.shadow.bias = -0.0005; sun.shadow.radius = 4;
clinic.add(sun);
const rim = new THREE.DirectionalLight("#CFE8FF", 0.5); rim.position.set(5, 4, -6); clinic.add(rim);

// sala
const floor = mesh(new THREE.PlaneGeometry(20, 20), mat("#E9E3D8", { roughness: 0.35 }), [0, 0, 0], clinic); floor.rotation.x = -Math.PI / 2;
const wallM = mat("#F4F8FA", { roughness: 0.9 });
const back = mesh(new THREE.PlaneGeometry(20, 6), wallM, [0, 3, -4], clinic);
const left = mesh(new THREE.PlaneGeometry(20, 6), wallM, [-5, 3, 0], clinic); left.rotation.y = Math.PI / 2;
mesh(new THREE.BoxGeometry(20, 0.12, 0.05), mat("#9FB6C6"), [0, 0.06, -3.97], clinic);
// finestra (llum de dia)
mesh(new THREE.BoxGeometry(2.6, 1.7, 0.06), mat("#FFFFFF"), [2.4, 2.4, -3.96], clinic);
mesh(new THREE.PlaneGeometry(2.4, 1.5), new THREE.MeshBasicMaterial({ color: "#CFEAFB" }), [2.4, 2.4, -3.92], clinic);
mesh(new THREE.BoxGeometry(0.06, 1.5, 0.08), mat("#FFFFFF"), [2.4, 2.4, -3.9], clinic);
// mobles
const cab = mat("#FFFFFF", { roughness: 0.4 }), top = mat("#7FB7C9", { roughness: 0.3 });
mesh(new THREE.BoxGeometry(2.8, 0.9, 0.6), cab, [-2.4, 0.45, -3.6], clinic);
mesh(new THREE.BoxGeometry(2.9, 0.05, 0.66), top, [-2.4, 0.92, -3.6], clinic);
for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(0.3, 0.03, 0.02), mat("#94A3B8"), [-3.5 + i * 0.72, 0.7, -3.29], clinic);
mesh(new THREE.BoxGeometry(2.4, 0.7, 0.35), cab, [-2.4, 2.3, -3.8], clinic);
// planta
mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.45, 24), mat("#F8FAFC"), [4.0, 0.23, -3.2], clinic);
const R0 = rng(5);
for (let i = 0; i < 9; i++) { const l = mesh(new THREE.SphereGeometry(0.22 + R0() * 0.1, 16, 12), mat(i % 2 ? "#34D399" : "#10B981"), [4.0 + (R0() - 0.5) * 0.5, 0.75 + R0() * 0.6, -3.2 + (R0() - 0.5) * 0.4], clinic); l.scale.set(0.7, 1.3, 0.7); }
// porta (pivot a la frontissa)
const doorPivot = new THREE.Group(); doorPivot.position.set(-4.97, 0, 1.0); clinic.add(doorPivot);
mesh(new THREE.BoxGeometry(0.06, 2.2, 1.0), mat("#C8D6E0", { roughness: 0.5 }), [0, 1.1, 0.5], doorPivot);
mesh(new THREE.SphereGeometry(0.04, 12, 8), mat("#64748B", { metalness: 0.8, roughness: 0.3 }), [0.06, 1.05, 0.9], doorPivot);
mesh(new THREE.BoxGeometry(0.08, 2.3, 1.12), mat("#FFFFFF"), [-0.02, 1.1, 1.5], clinic).visible = false;

// cadira dental (mira cap a +z; capçal cap a -z)
const teal = mat("#14B8A6", { roughness: 0.45 }), white = mat("#F8FAFC", { roughness: 0.35 });
const chair = new THREE.Group(); chair.position.set(0.4, 0, 0); clinic.add(chair);
mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.06, 32), white, [0, 0.03, 0], chair);
mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.42, 24), white, [0, 0.24, 0], chair);
mesh(new THREE.BoxGeometry(0.62, 0.12, 0.6), teal, [0, 0.5, 0.05], chair);
mesh(new THREE.BoxGeometry(0.6, 0.1, 0.75), teal, [0, 0.42, 0.7], chair).rotation.x = 0.25;
const backPivot = new THREE.Group(); backPivot.position.set(0, 0.55, -0.25); chair.add(backPivot);
mesh(new THREE.BoxGeometry(0.62, 0.8, 0.12), teal, [0, 0.4, -0.04], backPivot);
mesh(new THREE.BoxGeometry(0.34, 0.2, 0.12), mat("#0F8F84"), [0, 0.92, -0.03], backPivot);
// llum de la cadira
const lampArm = new THREE.Group(); lampArm.position.set(1.3, 0, -0.9); clinic.add(lampArm);
mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 16), white, [0, 1.1, 0], lampArm);
mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 16), white, [-0.42, 2.18, 0.2], lampArm).rotation.z = Math.PI / 2.4;
const lampHead = mesh(new THREE.BoxGeometry(0.42, 0.12, 0.24), white, [-0.85, 2.0, 0.3], lampArm); lampHead.rotation.z = 0.4;
const lampFaceM = new THREE.MeshStandardMaterial({ color: "#E5E7EB", emissive: "#FFF4C8", emissiveIntensity: 0 });
mesh(new THREE.PlaneGeometry(0.36, 0.18), lampFaceM, [-0.85, 1.93, 0.3], lampArm).rotation.x = Math.PI / 2;
const spot = new THREE.SpotLight("#FFF6DD", 0, 6, 0.38, 0.6, 1.2); spot.position.set(0.45, 1.95, -0.6); clinic.add(spot); clinic.add(spot.target);
// carro amb instruments
mesh(new THREE.BoxGeometry(0.6, 0.04, 0.4), white, [1.45, 0.85, 0.45], clinic);
mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 12), mat("#94A3B8"), [1.45, 0.42, 0.45], clinic);
for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), mat("#CBD5E1", { metalness: 0.9, roughness: 0.3 }), [1.3 + i * 0.08, 0.88, 0.45], clinic).rotation.x = Math.PI / 2;

// ── personatges (figures 3D articulades) ──
function human({ skin, shirt, pants, hair, coat = false, mask = false, cap: hasCap = false }) {
  const root = new THREE.Group();
  const M = { skin: mat(skin, { roughness: 0.55 }), shirt: mat(shirt), pants: mat(pants), hair: mat(hair, { roughness: 0.8 }), shoe: mat("#334155") };
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const thigh = new THREE.Group(); thigh.position.set(0.1 * s, 0, 0); root.add(thigh);
    mesh(cap(0.075, 0.32), M.pants, [0, -0.22, 0], thigh);
    const knee = new THREE.Group(); knee.position.set(0, -0.44, 0); thigh.add(knee);
    mesh(cap(0.065, 0.3), M.pants, [0, -0.2, 0], knee);
    mesh(new THREE.BoxGeometry(0.11, 0.07, 0.24), M.shoe, [0, -0.42, 0.05], knee);
    legs.push({ thigh, knee });
  }
  const torso = new THREE.Group(); root.add(torso);
  mesh(cap(0.17, 0.36), M.shirt, [0, 0.3, 0], torso);
  if (coat) { const c = mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.6, 24, 1, true), M.shirt, [0, 0.08, 0], torso); c.material = mat(shirt); c.material.side = THREE.DoubleSide; }
  mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 12), M.skin, [0, 0.6, 0], torso);
  const head = new THREE.Group(); head.position.set(0, 0.76, 0); torso.add(head);
  mesh(new THREE.SphereGeometry(0.135, 32, 24), M.skin, [0, 0, 0], head).scale.set(1, 1.1, 1);
  const h = mesh(new THREE.SphereGeometry(0.142, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), M.hair, [0, 0.02, -0.012], head); h.rotation.x = -0.35;
  for (const s of [-1, 1]) {
    mesh(new THREE.SphereGeometry(0.018, 12, 8), mat("#1F2937", { roughness: 0.2 }), [0.045 * s, 0.02, 0.125], head);
    mesh(new THREE.SphereGeometry(0.03, 12, 8), M.skin, [0.135 * s, 0, 0], head);
  }
  mesh(new THREE.SphereGeometry(0.02, 12, 8), M.skin, [0, -0.02, 0.14], head);
  const mouth = mesh(new THREE.SphereGeometry(0.035, 16, 8), mat("#5B1A1A", { roughness: 0.9 }), [0, -0.075, 0.122], head);
  mouth.scale.set(1.2, 0.18, 0.5);
  if (mask) mesh(new THREE.SphereGeometry(0.14, 24, 12, -Math.PI * 0.35, Math.PI * 0.7, Math.PI * 0.5, Math.PI * 0.3), mat("#5EEAD4"), [0, 0, 0.005], head);
  if (hasCap) mesh(new THREE.SphereGeometry(0.15, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), mat("#14B8A6"), [0, 0.02, -0.01], head);
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(0.22 * s, 0.5, 0); torso.add(sh);
    mesh(cap(0.055, 0.22), M.shirt, [0, -0.15, 0], sh);
    const el = new THREE.Group(); el.position.set(0, -0.3, 0); sh.add(el);
    mesh(cap(0.048, 0.2), coat ? M.shirt : M.skin, [0, -0.13, 0], el);
    mesh(new THREE.SphereGeometry(0.055, 16, 12), coat ? mat("#93C5FD") : M.skin, [0, -0.3, 0], el);
    arms.push({ sh, el });
  }
  return { root, legs, arms, torso, head, mouth };
}
const patient = human({ skin: "#E9B48A", shirt: "#F28C28", pants: "#3557A6", hair: "#4A3222" });
const dentist = human({ skin: "#B97A56", shirt: "#FFFFFF", pants: "#0EA5A4", hair: "#1E1B18", coat: true, mask: true, cap: true });
clinic.add(patient.root, dentist.root);
// mirall dental a la mà de la dentista
const mirror = new THREE.Group();
mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 8), mat("#CBD5E1", { metalness: 0.9, roughness: 0.25 }), [0, -0.11, 0], mirror);
mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 24), mat("#FFFFFF", { metalness: 1, roughness: 0.05 }), [0, -0.23, 0], mirror);
dentist.arms[0].el.add(mirror); mirror.position.set(0, -0.32, 0.02); mirror.visible = false;

const HIP_STAND = 0.92;
function walkPose(H, phase, amp) {
  H.legs.forEach((l, i) => { const s = Math.sin(phase + i * Math.PI) * amp; l.thigh.rotation.x = s; l.knee.rotation.x = Math.max(0, -s) * 1.2; });
  H.arms.forEach((a, i) => { a.sh.rotation.x = -Math.sin(phase + i * Math.PI) * amp * 0.8; a.el.rotation.x = -0.2; });
}

// ═══════════ ESCENA 2 · dins la boca ═══════════
const mouthS = new THREE.Scene();
mouthS.background = new THREE.Color("#2A0710");
mouthS.fog = new THREE.Fog("#2A0710", 3, 9);
mouthS.add(new THREE.HemisphereLight("#FFE4E6", "#3B0A14", 1.3));
const mKey = new THREE.SpotLight("#FFF6DD", 9, 14, 0.7, 0.5, 1); mKey.position.set(0.6, 3.2, 3.2); mKey.castShadow = true; mKey.shadow.mapSize.set(1024, 1024); mouthS.add(mKey);
const tongueG = new THREE.SphereGeometry(1, 96, 64);
{ // papil·les: petit relleu determinista
  const p = tongueG.attributes.position, R = rng(17);
  const bumps = Array.from({ length: 260 }, () => { const a = R() * Math.PI * 2, b = Math.acos(2 * R() - 1); return V(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)); });
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); let d = 0; for (const b of bumps) { const q = v.distanceTo(b); if (q < 0.06) d += (0.06 - q) * 0.25; } v.multiplyScalar(1 + d); p.setXYZ(i, v.x, v.y, v.z); }
  tongueG.computeVertexNormals();
}
const tongueM = new THREE.MeshPhysicalMaterial({ color: "#EE8796", roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.35 });
const tongue = new THREE.Group(); mouthS.add(tongue);
const tMesh = mesh(tongueG, tongueM, [0, 0, 0], tongue); tMesh.scale.set(1.25, 0.42, 1.7);
mesh(new THREE.BoxGeometry(0.03, 0.02, 2.2), mat("#B94A5E", { roughness: 0.6 }), [0, 0.41, 0], tongue);
// úlcera al lateral dret
const ulcer = new THREE.Group(); ulcer.position.set(1.0, 0.27, 0.45); ulcer.rotation.set(0, 0, -0.75); tongue.add(ulcer);
const halo = mesh(new THREE.CircleGeometry(0.3, 40), new THREE.MeshStandardMaterial({ color: "#D9364A", roughness: 0.6, emissive: "#E11D48", emissiveIntensity: 0.1 }), [0, 0.0, 0], ulcer); halo.rotation.x = -Math.PI / 2; halo.scale.set(1, 0.7, 1);
const core = mesh(new THREE.CircleGeometry(0.18, 40), mat("#F1E2C6", { roughness: 0.8 }), [0, 0.006, 0], ulcer); core.rotation.x = -Math.PI / 2; core.scale.set(1, 0.65, 1);
// dents inferiors (arc) i dent afilada
const teethM = mat("#FBFAF4", { roughness: 0.25 });
const gum = mat("#D86A7E", { roughness: 0.5 });
const sharpPos = [];
for (let i = 0; i < 12; i++) {
  const a = Math.PI * (0.1 + 0.8 * (i / 11)), x = Math.cos(a) * 1.75, z = Math.sin(a) * 1.9 - 0.2;
  const sharp = i === 2;
  const tooth = mesh(new THREE.SphereGeometry(0.17, 24, 16), sharp ? mat("#FFF1F2", { roughness: 0.3 }) : teethM, [x, -0.05, z], mouthS); tooth.scale.set(0.95, sharp ? 1.25 : 1.1, 0.8);
  tooth.rotation.y = -a + Math.PI / 2;
  if (sharp) { sharpPos.push(V(x, 0.2, z)); for (let k = -1; k <= 1; k++) { mesh(new THREE.ConeGeometry(0.045, 0.14, 8), mat("#F8FAFC"), [k * 0.08, 0.17, 0], tooth); } }
  mesh(new THREE.BoxGeometry(0.34, 0.18, 0.32), gum, [x, -0.28, z], mouthS).rotation.y = -a + Math.PI / 2;
}
const palate = mesh(new THREE.SphereGeometry(3.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat("#9E3448", { roughness: 0.7, side: THREE.BackSide }), [0, -0.4, 0], mouthS);
const floorM = mesh(new THREE.CircleGeometry(3.4, 48), mat("#7F1D2D", { roughness: 0.8 }), [0, -0.38, 0], mouthS); floorM.rotation.x = -Math.PI / 2;
const mirror2 = new THREE.Group(); mouthS.add(mirror2);
mesh(new THREE.CylinderGeometry(0.04, 0.04, 3, 12), mat("#CBD5E1", { metalness: 0.4, roughness: 0.3 }), [0, 1.5, 0], mirror2);
const mHead = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 40), mat("#E2E8F0", { metalness: 0.35, roughness: 0.12 }), [0, 0, 0], mirror2); mHead.rotation.x = 0.6;
mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 40), mat("#94A3B8", { metalness: 0.5, roughness: 0.3 }), [0, 0, 0], mirror2).rotation.x = 0.6 + Math.PI / 2;
const ulcerLight = new THREE.PointLight("#FF2D55", 0, 2.5, 2); mouthS.add(ulcerLight);

// ═══════════ ESCENA 3 · dins l'organisme ═══════════
const cellsS = new THREE.Scene();
cellsS.background = new THREE.Color("#3B0C22");
cellsS.fog = new THREE.FogExp2("#3B0C22", 0.07);
cellsS.add(new THREE.HemisphereLight("#FBCFE8", "#2E0718", 0.9));
const cKey = new THREE.PointLight("#FFE4F0", 30, 30, 1.6); cKey.position.set(2, 3, 4); cellsS.add(cKey);
const RC = rng(29);
const cells = [];
const cellM = new THREE.MeshPhysicalMaterial({ color: "#F4A7C6", roughness: 0.35, transmission: 0.15, thickness: 0.5, clearcoat: 0.4 });
const nucM = mat("#5B3A9A", { roughness: 0.5 });
for (let i = 0; i < 110; i++) {
  const g = new THREE.Group();
  const r = 0.35 + RC() * 0.35;
  mesh(new THREE.SphereGeometry(r, 28, 20), cellM, [0, 0, 0], g).scale.set(1, 0.85 + RC() * 0.3, 1);
  mesh(new THREE.SphereGeometry(r * 0.42, 20, 14), nucM, [r * 0.15, 0, r * 0.1], g);
  g.position.set((RC() - 0.5) * 14, (RC() - 0.5) * 8, -RC() * 30);
  if (Math.abs(g.position.x) < 3.8 && Math.abs(g.position.y) < 2.4 && g.position.z > -14 && g.position.z < 0) g.position.x += (g.position.x < 0 ? -4 : 4);
  g.userData = { sp: 0.2 + RC() * 0.5, ph: RC() * 6.28 };
  cellsS.add(g); cells.push(g);
}
const vesselCurve = new THREE.CatmullRomCurve3([V(-9, -2.5, -4), V(-3, -1.5, -10), V(2, -2.2, -16), V(8, -1, -24)]);
mesh(new THREE.TubeGeometry(vesselCurve, 80, 0.7, 24), new THREE.MeshStandardMaterial({ color: "#E11D48", roughness: 0.4, transparent: true, opacity: 0.55 }), [0, 0, 0], cellsS);
const rbcs = Array.from({ length: 24 }, (_, i) => { const m = mesh(new THREE.TorusGeometry(0.18, 0.09, 12, 24), mat("#DC2626", { roughness: 0.35 }), [0, 0, 0], cellsS); m.userData.u = i / 24; return m; });
const orbs = ["#38BDF8", "#A78BFA", "#34D399", "#FBBF24"].map((c, i) => {
  const m = mesh(new THREE.SphereGeometry(0.42, 32, 24), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.6, roughness: 0.3 }), [0, 0, 0], cellsS);
  const l = new THREE.PointLight(c, 0, 6, 2); m.add(l); m.userData.light = l; m.visible = false; return m;
});

// ═══════════ render(t) ═══════════
function camKeys(t, keys) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const [t0, p0, l0] = keys[i], [t1, p1, l1] = keys[Math.min(i + 1, keys.length - 1)];
  const k = t1 > t0 ? ss(t0, t1, t) : 1;
  camera.position.set(lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), lerp(p0[2], p1[2], k));
  camera.lookAt(lerp(l0[0], l1[0], k), lerp(l0[1], l1[1], k), lerp(l0[2], l1[2], k));
}

function renderClinic(t) {
  // porta
  doorPivot.rotation.y = -1.4 * ss(K.door, K.door + 0.8, t) * (1 - ss(2.6, 3.4, t));
  // pacient: entra caminant (porta → costat de la cadira), s'asseu i es reclina
  const P = patient;
  const walkK = ss(0.5, K.walkEnd, t);
  const path = [V(-4.6, 0, 1.5), V(-2.2, 0, 1.3), V(-0.15, 0, 0.7)];
  const pos = walkK < 0.5 ? path[0].clone().lerp(path[1], walkK * 2) : path[1].clone().lerp(path[2], (walkK - 0.5) * 2);
  const sitK = ss(K.sit, K.sit + 0.9, t);
  const seat = V(0.4, 0.6, 0.05);
  P.root.position.set(lerp(pos.x, seat.x, sitK), lerp(HIP_STAND, seat.y, sitK), lerp(pos.z, seat.z, sitK));
  P.root.rotation.y = lerp(Math.PI / 2 - 0.25, 0, ss(K.sit - 0.4, K.sit + 0.5, t));
  if (t < K.sit) { walkPose(P, t * 7.5, 0.45 * (1 - ss(K.walkEnd - 0.4, K.walkEnd, t))); }
  else { walkPose(P, 0, 0); P.legs.forEach((l) => { l.thigh.rotation.x = -1.45 * sitK; l.knee.rotation.x = 0.35 * sitK; }); }
  // mà a la galta mentre camina (dolor)
  const cheek = 1 - ss(K.sit - 0.2, K.sit + 0.3, t);
  P.arms[1].sh.rotation.x = lerp(P.arms[1].sh.rotation.x, -1.25, cheek); P.arms[1].sh.rotation.z = lerp(0, 0.35, cheek); P.arms[1].el.rotation.x = lerp(-0.2, -2.1, cheek);
  if (t >= K.sit) { P.arms[0].sh.rotation.x = -0.25 * sitK; P.arms[1].sh.rotation.x = lerp(P.arms[1].sh.rotation.x, -0.25, sitK); }
  // reclinar cadira i tronc
  const rec = ss(K.recline, K.recline + 1.3, t);
  backPivot.rotation.x = -1.05 * rec;
  P.torso.rotation.x = -1.05 * rec;
  P.torso.position.z = -0.05 * rec;
  P.head.rotation.x = -0.15 * rec;
  // respiració
  P.torso.scale.y = 1 + Math.sin(t * 2.2) * 0.01;
  // boca oberta
  P.mouth.scale.y = lerp(0.18, 0.95, ss(K.mouthOpen, K.mouthOpen + 0.5, t));
  // dentista: s'acosta al capçal i es posa a explorar
  const D = dentist;
  const dK = ss(K.dentistMove, K.dentistMove + 1.6, t);
  D.root.position.set(lerp(2.6, 1.0, dK), HIP_STAND, lerp(1.2, -0.55, dK));
  D.root.rotation.y = lerp(-Math.PI / 2, -2.2, dK);
  if (t > K.dentistMove && t < K.dentistMove + 1.6) walkPose(D, t * 7.5, 0.4 * Math.sin(Math.PI * clamp((t - K.dentistMove) / 1.6)));
  else walkPose(D, 0, 0);
  const lean = ss(K.lampOn, K.mouthOpen + 0.5, t);
  D.torso.rotation.x = 0.35 * lean;
  D.arms[0].sh.rotation.x = lerp(D.arms[0].sh.rotation.x, -1.1, lean); D.arms[0].el.rotation.x = lerp(-0.2, -0.9, lean);
  D.arms[1].sh.rotation.x = lerp(D.arms[1].sh.rotation.x, -0.8, lean);
  mirror.visible = t > K.mirror;
  D.head.rotation.x = 0.25 * lean;
  D.torso.scale.y = 1 + Math.sin(t * 2 + 1) * 0.008;
  // llum
  const lk = ss(K.lampOn, K.lampOn + 0.25, t);
  lampFaceM.emissiveIntensity = 2.2 * lk; spot.intensity = 9 * lk;
  const headW = new THREE.Vector3(); P.head.getWorldPosition(headW);
  spot.target.position.copy(headW);
  // càmera
  camKeys(t, [
    [0, [-1.2, 1.7, 7.4], [-2.4, 1.1, 0.6]],
    [2.6, [0.4, 1.8, 6.6], [-0.8, 1.0, 0.4]],
    [4.4, [2.4, 1.9, 4.6], [0.3, 0.9, -0.1]],
    [K.faceCam, [2.4, 1.9, 4.6], [0.3, 0.9, -0.1]],
    [K.faceCam + 1.6, [headW.x + 0.9, headW.y + 0.7, headW.z + 0.9], [headW.x, headW.y, headW.z]],
    [K.dive - 0.2, [headW.x + 0.55, headW.y + 0.45, headW.z + 0.55], [headW.x, headW.y - 0.03, headW.z + 0.08]],
    [K.mouthScene, [headW.x + 0.06, headW.y + 0.08, headW.z + 0.18], [headW.x, headW.y - 0.07, headW.z + 0.12]],
  ]);
  renderer.render(clinic, camera);
}

function renderMouth(t) {
  const lt = t - K.mouthScene;
  // la llengua frega contra la dent afilada
  const rubK = ss(K.rub - 0.2, K.rub + 0.2, t) * (1 - ss(K.mucosa + 0.8, K.mucosa + 1.2, t));
  tongue.position.x = Math.sin(t * 6) * 0.08 * rubK + 0.04 * rubK;
  tongue.rotation.z = Math.sin(t * 6) * 0.03 * rubK;
  tongue.position.y = Math.sin(t * 1.4) * 0.015;
  // mirall que entra i surt
  const mk = ss(K.mouthScene, K.mouthScene + 1.0, t) * (1 - ss(K.rub - 0.6, K.rub, t));
  mirror2.position.set(lerp(3.5, 1.6, mk), lerp(2.5, 0.9, mk), lerp(2.5, 1.2, mk)); mirror2.rotation.set(0.5, 0, 0.7);
  // pols de l'úlcera
  const pk = ss(K.pulse - 0.3, K.pulse, t);
  halo.material.emissiveIntensity = 0.1 + pk * (1.2 + Math.sin(t * 7) * 0.6);
  ulcerLight.intensity = pk * (2.5 + Math.sin(t * 7) * 1.2);
  const uW = new THREE.Vector3(); ulcer.getWorldPosition(uW); ulcerLight.position.set(uW.x + 0.3, uW.y + 0.4, uW.z + 0.3);
  const s = sharpPos[0];
  camKeys(t, [
    [K.mouthScene, [0, 2.6, 4.6], [0, 0, 0]],
    [K.ulcer - 0.3, [0.4, 2.0, 3.4], [0.4, 0, 0.2]],
    [K.ulcer + 0.9, [2.1, 1.1, 1.9], [1.05, 0.1, 0.45]],
    [K.tooth - 0.3, [2.1, 1.1, 1.9], [1.05, 0.1, 0.45]],
    [K.tooth + 0.6, [s.x + 1.2, 0.9, s.z + 1.4], [lerp(1.05, s.x, 0.6), 0.1, lerp(0.45, s.z, 0.6)]],
    [K.mucosa, [s.x + 1.2, 0.9, s.z + 1.4], [lerp(1.05, s.x, 0.6), 0.1, lerp(0.45, s.z, 0.6)]],
    [K.mucosa + 1.0, [1.75, 0.7, 1.2], [1.1, 0.12, 0.45]],
    [K.cellsScene, [1.2, 0.2, 0.55], [1.1, 0.1, 0.45]],
  ]);
  renderer.render(mouthS, camera);
}

function renderCells(t) {
  const lt = t - K.cellsScene;
  cells.forEach((c, i) => { const u = c.userData; c.rotation.set(t * u.sp * 0.4, t * u.sp, 0); c.position.y += 0; c.children[0].scale.y = 0.9 + Math.sin(t * u.sp * 2 + u.ph) * 0.05; });
  rbcs.forEach((m) => { const u = (m.userData.u + t * 0.05) % 1; const p = vesselCurve.getPointAt(u); m.position.copy(p); m.rotation.set(t + u * 10, u * 6, 0); });
  cKey.intensity = 30 + 40 * ss(K.question + 1, K.four - 0.5, t);
  // quatre conceptes: esferes de llum que surten i es posen en fila
  orbs.forEach((o, i) => {
    const k = ss(K.four + i * 0.35, K.four + i * 0.35 + 0.9, t);
    o.visible = k > 0;
    const camP = V(0, 0, 6 - lt * 0.5);
    o.position.set(lerp(0, -1.95 + i * 1.3, k), lerp(-1.5, 0.2, k), camP.z - 4.2);
    o.scale.setScalar(lerp(0.2, 1, k) * (1 + Math.sin(t * 3 + i) * 0.04));
    o.userData.light.intensity = 6 * k;
  });
  camera.position.set(Math.sin(lt * 0.3) * 0.4, Math.cos(lt * 0.25) * 0.25, 6 - lt * 0.5);
  camera.lookAt(0, 0, camera.position.z - 6);
  renderer.render(cellsS, camera);
}

function render(t) {
  if (t < K.mouthScene) renderClinic(t);
  else if (t < K.cellsScene) renderMouth(t);
  else renderCells(t);
}
window.addEventListener("hf-seek", (e) => render(e.detail.time));
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["three"] = Promise.resolve();
render(0);
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, "index.html"), html);
console.log("OK", DUR, JSON.stringify(K));
