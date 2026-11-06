// Mescla: veu + efectes (assets/sfx-cues.json) → assets/mix.wav a −14 LUFS. Sense música.
//   node scripts/mix.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const A = (p) => path.join(ROOT, p);
const cues = JSON.parse(fs.readFileSync(A("assets/sfx-cues.json"), "utf8"));
const peaks = JSON.parse(fs.readFileSync(A("assets/sfx/peaks.json"), "utf8"));
const DUR = parseFloat(fs.readFileSync(A("index.html"), "utf8").match(/data-composition-id="main"[^>]*data-duration="([\d.]+)"/)[1]);
const START = new Set(["keys", "rub"]);
const inputs = [`-i "${A("assets/voz.wav")}"`];
let f = `[0:a]aresample=48000,apad=whole_dur=${DUR}[v];`;
const ins = ["[v]"];
cues.forEach((c, i) => {
  const t = Math.max(0, c.t - (START.has(c.file) ? 0 : (peaks[c.file] ?? 0) - 1 / 30));
  inputs.push(`-i "${A(`assets/sfx/${c.file}.wav`)}"`);
  const ms = Math.round(t * 1000);
  f += `[${i + 1}:a]aresample=48000,volume=${c.vol},adelay=${ms}|${ms}[s${i}];`;
  ins.push(`[s${i}]`);
});
f += `${ins.join("")}amix=inputs=${ins.length}:normalize=0:dropout_transition=0,atrim=0:${DUR}[pre]`;
fs.writeFileSync(A("assets/mix-filter.txt"), f);
const pre = A("assets/mix-pre.wav");
execSync(`ffmpeg -y -loglevel error ${inputs.join(" ")} -filter_complex_script "${A("assets/mix-filter.txt")}" -map "[pre]" -ac 2 -ar 48000 "${pre}"`);
const m = execSync(`ffmpeg -hide_banner -i "${pre}" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`).toString();
const j = JSON.parse(m.slice(m.lastIndexOf("{"), m.lastIndexOf("}") + 1));
execSync(`ffmpeg -y -loglevel error -i "${pre}" -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true -ar 48000 "${A("assets/mix.wav")}"`);
fs.unlinkSync(pre);
const chk = execSync(`ffmpeg -hide_banner -i "${A("assets/mix.wav")}" -af ebur128=peak=true -f null - 2>&1`).toString();
console.log(`mix.wav · ${DUR}s · ${cues.length} efectes · ${chk.match(/I:\s+([-\d.]+) LUFS/g)?.pop()}`);
