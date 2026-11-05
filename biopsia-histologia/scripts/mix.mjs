// Pista d'àudio: només efectes discrets (sense música ni veu) → assets/sfx-mix.wav
//   node scripts/mix.mjs
// Cada efecte es col·loca perquè el seu pic caigui 1 fotograma després de la imatge.
// Com que és una pista gairebé buida, no es normalitza a −14 LUFS (pujaria massa
// els efectes): es deixa el pic real a −3 dBTP.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const A = (p) => path.join(ROOT, p);
const cues = JSON.parse(fs.readFileSync(A("assets/sfx-cues.json"), "utf8"));
const peaks = JSON.parse(fs.readFileSync(A("assets/sfx/peaks.json"), "utf8"));
const DUR = parseFloat(fs.readFileSync(A("index.html"), "utf8").match(/data-composition-id="main"[^>]*data-duration="([\d.]+)"/)[1]);
const inputs = [`-f lavfi -t ${DUR} -i anullsrc=r=48000:cl=stereo`];
let f = "";
const ins = ["[0:a]"];
cues.forEach((c, i) => {
  const t = Math.max(0, c.t - (peaks[c.file] ?? 0) + 1 / 30);
  inputs.push(`-i "${A(`assets/sfx/${c.file}.wav`)}"`);
  const ms = Math.round(t * 1000);
  f += `[${i + 1}:a]aresample=48000,volume=${c.vol},adelay=${ms}|${ms}[s${i}];`;
  ins.push(`[s${i}]`);
});
f += `${ins.join("")}amix=inputs=${ins.length}:normalize=0:dropout_transition=0,atrim=0:${DUR}[pre]`;
fs.writeFileSync(A("assets/mix-filter.txt"), f);
const pre = A("assets/sfx-pre.wav");
execSync(`ffmpeg -y -loglevel error ${inputs.join(" ")} -filter_complex_script "${A("assets/mix-filter.txt")}" -map "[pre]" -ac 2 -ar 48000 "${pre}"`);
const mx = parseFloat(execSync(`ffmpeg -hide_banner -i "${pre}" -af volumedetect -f null - 2>&1`).toString().match(/max_volume: ([-\d.]+) dB/)[1]);
const gain = -3 - mx;
execSync(`ffmpeg -y -loglevel error -i "${pre}" -af volume=${gain.toFixed(2)}dB -ar 48000 "${A("assets/sfx-mix.wav")}"`);
fs.unlinkSync(pre);
console.log(`sfx-mix.wav · ${DUR}s · ${cues.length} efectes · pic −3 dB (guany ${gain.toFixed(1)} dB)`);
