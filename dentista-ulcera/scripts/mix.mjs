// Mescla final: veu + efectes (assets/sfx-cues.json) + música molt baixa → assets/mix.wav a −14 LUFS.
//   node scripts/mix.mjs
// Cada efecte es col·loca perquè el seu pic caigui 1 fotograma després de la imatge.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const A = (p) => path.join(ROOT, p);
const cues = JSON.parse(fs.readFileSync(A("assets/sfx-cues.json"), "utf8"));
const peaks = JSON.parse(fs.readFileSync(A("assets/sfx/peaks.json"), "utf8"));
const DUR = parseFloat(fs.readFileSync(A("index.html"), "utf8").match(/data-composition-id="main"[^>]*data-duration="([\d.]+)"/)[1]);
const FRAME = 1 / 30;
const START_ALIGNED = new Set(["keys", "rub"]); // aquests comencen amb l'acció, no tenen pic

const inputs = [`-i "${A("assets/voz.wav")}"`, `-stream_loop -1 -i "${A("assets/music/music.mp3")}"`];
let f = "";
// Veu.
f += `[0:a]aresample=48000,apad=whole_dur=${DUR}[v];`;
// Música: molt baixa, entra suau i surt amb fosa; mai silenci total.
f += `[1:a]aresample=48000,atrim=0:${DUR},loudnorm=I=-34:TP=-6:LRA=11,afade=t=in:d=1.2,afade=t=out:st=${(DUR - 1.8).toFixed(2)}:d=1.8,` +
  `lowpass=f=9000[m];`;
const mixIn = ["[v]", "[m]"];
cues.forEach((c, i) => {
  const shift = START_ALIGNED.has(c.file) ? 0 : (peaks[c.file] ?? 0) - FRAME;
  const t = Math.max(0, c.t - shift);
  inputs.push(`-i "${A(`assets/sfx/${c.file}.wav`)}"`);
  const ms = Math.round(t * 1000);
  f += `[${i + 2}:a]aresample=48000,volume=${c.vol},adelay=${ms}|${ms}[s${i}];`;
  mixIn.push(`[s${i}]`);
});
f += `${mixIn.join("")}amix=inputs=${mixIn.length}:normalize=0:dropout_transition=0,atrim=0:${DUR}[pre]`;
fs.writeFileSync(A("audio/mix-filter.txt"), f);
const pre = A("audio/mix-pre.wav");
execSync(`ffmpeg -y -loglevel error ${inputs.join(" ")} -filter_complex_script "${A("audio/mix-filter.txt")}" -map "[pre]" -ac 2 -ar 48000 "${pre}"`);

// Normalització a −14 LUFS en dues passades (pic real ≤ −1,5 dBTP).
const m = execSync(`ffmpeg -hide_banner -i "${pre}" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`).toString();
const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
execSync(
  `ffmpeg -y -loglevel error -i "${pre}" -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000 -ar 48000 "${A("assets/mix.wav")}"`,
);
const chk = execSync(`ffmpeg -hide_banner -i "${A("assets/mix.wav")}" -af ebur128=peak=true -f null - 2>&1`).toString();
const I = chk.match(/I:\s+([-\d.]+) LUFS/g)?.pop();
const TP = chk.match(/Peak:\s+([-\d.]+) dBFS/g)?.pop();
console.log(`mix.wav · ${DUR}s · ${cues.length} efectes · ${I} · true peak ${TP}`);
