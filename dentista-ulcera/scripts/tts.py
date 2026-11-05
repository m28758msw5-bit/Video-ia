"""Veu sintètica en català amb Piper (veu upc_ona).

    .venv/bin/python scripts/tts.py [guion.txt]

Sintetitza cada línia del guió per separat i les uneix amb 0,25 s de silenci.
Escriu assets/voz.wav (48 kHz mono) i assets/voz-lines.json (inici/final de cada línia).
"""
import json, sys, wave, subprocess, pathlib
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODEL = ROOT / "audio/tts-model/ca_ES-upc_ona-medium.onnx"
GAP = 0.25
LENGTH_SCALE = 0.98  # ritme natural de la veu (1 = normal); fixat perquè el vídeo duri ~56 s

lines = [l.strip() for l in open(sys.argv[1] if len(sys.argv) > 1 else ROOT / "guion.txt", encoding="utf8") if l.strip()]
voice = PiperVoice.load(str(MODEL))
cfg = SynthesisConfig(length_scale=LENGTH_SCALE, noise_scale=0.6, noise_w_scale=0.7)
tmp = ROOT / "audio/tts-lines"
tmp.mkdir(exist_ok=True)
files = []
for i, line in enumerate(lines):
    f = tmp / f"l{i:02d}.wav"
    with wave.open(str(f), "wb") as w:
        voice.synthesize_wav(line, w, syn_config=cfg)
    # retalla silencis de les vores de cada línia
    g = tmp / f"t{i:02d}.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(f), "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse",
        "-ar", "48000", "-ac", "1", str(g)], check=True)
    files.append(g)

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))

t = 0.15
meta, inputs, filt = [], [], ""
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=mono", "-t", str(GAP), str(tmp / "gap.wav")], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=mono", "-t", "0.15", str(tmp / "lead.wav")], check=True)
seq = [tmp / "lead.wav"]
for i, f in enumerate(files):
    d = dur(f)
    meta.append({"line": i, "text": lines[i], "start": round(t, 3), "end": round(t + d, 3)})
    seq.append(f)
    t += d
    seq.append(tmp / ("gap.wav" if i < len(files) - 1 else "lead.wav"))
    t += GAP if i < len(files) - 1 else 0.15
lst = tmp / "list.txt"
lst.write_text("".join(f"file '{p}'\n" for p in seq))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", str(ROOT / "assets/voz.wav")], check=True)
(ROOT / "assets/voz-lines.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
print(f"voz.wav: {dur(ROOT / 'assets/voz.wav'):.2f} s · {len(lines)} línies")
