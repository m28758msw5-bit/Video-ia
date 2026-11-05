// Alinea les paraules del guió (guion.txt) amb la transcripció de Whisper
// (assets/transcript.json) i escriu assets/words.json: cada paraula del guió
// amb el seu inici i final reals. Així els subtítols fan servir l'ortografia
// del guió i els temps de la veu.
//
//   node scripts/align.mjs [transcript.json] [guion.txt]
//
// Mode provisional (sense transcripció): node scripts/align.mjs --silences
// reparteix les paraules dins dels trams de veu detectats amb silencedetect.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const scriptPath = path.join(ROOT, "guion.txt");
const outPath = path.join(ROOT, "assets", "words.json");

export const norm = (w) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/l·l/g, "ll")
    .replace(/[^a-z0-9]/g, "");

function scriptWords() {
  const lines = fs.readFileSync(scriptPath, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  const out = [];
  lines.forEach((line, li) => {
    line.split(/\s+/).forEach((tok) => {
      if (!norm(tok)) return;
      out.push({ text: tok, line: li });
    });
  });
  return out;
}

// Similitud entre dues paraules normalitzades (0..1), per Levenshtein.
function sim(a, b) {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (!m || !n) return 0;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

function alignToTranscript(sw, tw) {
  // Needleman-Wunsch: guió (files) contra transcripció (columnes).
  const n = sw.length, m = tw.length;
  const GAP = -0.6;
  const S = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const B = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) { S[i][0] = i * GAP; B[i][0] = 1; }
  for (let j = 1; j <= m; j++) { S[0][j] = j * GAP; B[0][j] = 2; }
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const s = sim(norm(sw[i - 1].text), norm(tw[j - 1].text));
      const diag = S[i - 1][j - 1] + (s * 2 - 0.8);
      const up = S[i - 1][j] + GAP; // paraula del guió que no surt a la veu
      const left = S[i][j - 1] + GAP; // paraula de la veu que no és al guió
      if (diag >= up && diag >= left) { S[i][j] = diag; B[i][j] = 0; }
      else if (up >= left) { S[i][j] = up; B[i][j] = 1; }
      else { S[i][j] = left; B[i][j] = 2; }
    }
  const pairs = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    const b = B[i][j];
    if (i > 0 && j > 0 && b === 0) { pairs.push([i - 1, j - 1]); i--; j--; }
    else if (i > 0 && (j === 0 || b === 1)) { pairs.push([i - 1, null]); i--; }
    else { pairs.push([null, j - 1]); j--; }
  }
  pairs.reverse();
  const out = sw.map((w) => ({ ...w }));
  const missing = [], extra = [], changed = [];
  for (const [si, ti] of pairs) {
    if (si != null && ti != null) {
      out[si].start = tw[ti].start;
      out[si].end = tw[ti].end;
      out[si].heard = tw[ti].text;
      if (norm(sw[si].text) !== norm(tw[ti].text)) changed.push(`«${sw[si].text}» → s'ha sentit «${tw[ti].text}» (${tw[ti].start.toFixed(2)} s)`);
    } else if (si != null) missing.push(sw[si].text);
    else extra.push(`«${tw[ti].text}» (${tw[ti].start.toFixed(2)} s)`);
  }
  // Paraules del guió sense temps: interpola entre veïnes.
  for (let k = 0; k < out.length; k++) {
    if (out[k].start != null) continue;
    let a = k - 1; while (a >= 0 && out[a].end == null) a--;
    let b = k + 1; while (b < out.length && out[b].start == null) b++;
    const t0 = a >= 0 ? out[a].end : 0;
    const t1 = b < out.length ? out[b].start : t0 + 0.4;
    const span = b - a - 1;
    const step = (t1 - t0) / (span + 1);
    out[k].start = t0 + step * (k - a - 0.5);
    out[k].end = out[k].start + step * 0.8;
    out[k].interpolated = true;
  }
  return { words: out, report: { missing, extra, changed } };
}

function provisionalFromSilences(sw, audio) {
  const log = execSync(`ffmpeg -hide_banner -i "${audio}" -af silencedetect=noise=-35dB:d=0.18 -f null - 2>&1`).toString();
  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audio}"`).toString());
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const segs = [];
  let cur = 0;
  for (let k = 0; k < starts.length; k++) {
    if (starts[k] > cur + 0.05) segs.push([cur, starts[k]]);
    cur = ends[k] ?? dur;
  }
  if (cur < dur - 0.05) segs.push([cur, dur]);
  const total = segs.reduce((a, s) => a + s[1] - s[0], 0);
  const chars = sw.reduce((a, w) => a + norm(w.text).length + 2, 0);
  // Reparteix per caràcters al llarg del temps de veu.
  let acc = 0;
  const at = (x) => {
    let rem = x;
    for (const s of segs) { const L = s[1] - s[0]; if (rem <= L) return s[0] + rem; rem -= L; }
    return dur;
  };
  return sw.map((w) => {
    const L = ((norm(w.text).length + 2) / chars) * total;
    const o = { ...w, start: +at(acc).toFixed(3), end: +at(acc + L * 0.85).toFixed(3), provisional: true };
    acc += L;
    return o;
  });
}

const sw = scriptWords();
let result;
if (args[0] === "--silences") {
  const audio = args[1] || path.join(ROOT, "assets", "voz.wav");
  result = { words: provisionalFromSilences(sw, audio), report: { provisional: true } };
} else {
  const tPath = args[0] || path.join(ROOT, "assets", "transcript.json");
  const raw = JSON.parse(fs.readFileSync(tPath, "utf8"));
  const list = Array.isArray(raw) ? raw : raw.words || raw.segments?.flatMap((s) => s.words) || [];
  const tw = list
    .map((w) => ({ text: String(w.text ?? w.word ?? "").trim(), start: +w.start, end: +w.end }))
    .filter((w) => norm(w.text));
  result = alignToTranscript(sw, tw);
}
fs.writeFileSync(outPath, JSON.stringify(result.words, null, 1));
fs.writeFileSync(path.join(ROOT, "assets", "align-report.json"), JSON.stringify(result.report, null, 2));
console.log(`words.json: ${result.words.length} paraules`);
console.log(JSON.stringify(result.report, null, 2));
