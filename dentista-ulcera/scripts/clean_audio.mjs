// Neteja la gravació: treu trams indicats (preses repetides, arrencades en fals)
// i escurça els silencis a 0,25 s com a màxim. No accelera la veu.
//
//   node scripts/clean_audio.mjs audio/original.m4a [cuts.json]
//
// cuts.json (opcional): [[inici, final], ...] en segons de l'original, trams a eliminar.
// Escriu assets/voz.wav (48 kHz mono) i assets/voz-map.json (trams conservats).

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.resolve(process.argv[2] || path.join(ROOT, "audio/original.m4a"));
const cutsPath = process.argv[3];
const cuts = cutsPath && fs.existsSync(cutsPath) ? JSON.parse(fs.readFileSync(cutsPath, "utf8")) : [];
const MAX_GAP = 0.25;
const PAD = 0.06; // marge que es conserva a tocar de la veu

const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${src}"`).toString());
const log = execSync(`ffmpeg -hide_banner -i "${src}" -af silencedetect=noise=-38dB:d=0.12 -f null - 2>&1`).toString();
const ss = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
const se = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);

// Trams de veu.
let speech = [];
let cur = 0;
for (let i = 0; i < ss.length; i++) {
  if (ss[i] > cur) speech.push([cur, ss[i]]);
  cur = se[i] ?? dur;
}
if (cur < dur) speech.push([cur, dur]);
// Treu els trams marcats com a talls.
for (const [a, b] of cuts) {
  speech = speech.flatMap(([s, e]) => {
    if (e <= a || s >= b) return [[s, e]];
    const out = [];
    if (s < a) out.push([s, a]);
    if (e > b) out.push([b, e]);
    return out;
  });
}
speech = speech.filter(([s, e]) => e - s > 0.04);
// Afegeix marges i limita el silenci entre trams.
const keep = [];
speech.forEach(([s, e], i) => {
  const prevEnd = i ? speech[i - 1][1] : null;
  let a = Math.max(0, s - PAD), b = Math.min(dur, e + PAD);
  if (i === 0) a = Math.max(0, s - 0.12);
  if (i === speech.length - 1) b = Math.min(dur, e + 0.35);
  keep.push([a, b, prevEnd]);
});
// Silenci a afegir entre trams: el real, però com a màxim MAX_GAP (descomptant marges).
const parts = [];
let filter = "";
let outT = 0;
const map = [];
keep.forEach(([a, b], i) => {
  if (i > 0) {
    const realGap = a - keep[i - 1][1];
    const gap = Math.max(0, Math.min(realGap, MAX_GAP - 2 * PAD));
    if (realGap < 0) { a = keep[i - 1][1]; }
    if (gap > 0.001) {
      filter += `anullsrc=r=48000:cl=mono,atrim=0:${gap.toFixed(4)}[g${i}];`;
      parts.push(`[g${i}]`);
      outT += gap;
    }
  }
  filter += `[0:a]atrim=${a.toFixed(4)}:${b.toFixed(4)},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${Math.max(0, b - a - 0.012).toFixed(4)}:d=0.012[s${i}];`;
  parts.push(`[s${i}]`);
  map.push({ src: [+a.toFixed(3), +b.toFixed(3)], out: +outT.toFixed(3) });
  outT += b - a;
});
filter += `${parts.join("")}concat=n=${parts.length}:v=0:a=1,aresample=48000[out]`;
fs.writeFileSync(path.join(ROOT, "audio/clean-filter.txt"), filter);
execSync(
  `ffmpeg -y -loglevel error -i "${src}" -filter_complex_script "${path.join(ROOT, "audio/clean-filter.txt")}" -map "[out]" -ac 1 -ar 48000 -c:a pcm_s16le "${path.join(ROOT, "assets/voz.wav")}"`,
);
fs.writeFileSync(path.join(ROOT, "assets/voz-map.json"), JSON.stringify(map, null, 1));
const outDur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${path.join(ROOT, "assets/voz.wav")}"`).toString());
console.log(`original ${dur.toFixed(2)} s → net ${outDur.toFixed(2)} s · ${keep.length} trams de veu · ${cuts.length} talls`);
