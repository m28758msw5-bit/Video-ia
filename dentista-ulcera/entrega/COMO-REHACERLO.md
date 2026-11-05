# Cómo rehacer «La ferida que no es cura»

Vídeo vertical 1080×1920 a 30 fps, animado en 2D con HyperFrames (HTML + GSAP). La voz es sintética en catalán (Piper, voz `upc_ona`). Todo se genera a partir de `guion.txt`: si cambias una frase, repite los pasos 2 a 6 y el vídeo se rehace solo.

## Requisitos (una sola vez)

```bash
node -v            # 22 o superior
python3 --version  # 3.x
ffmpeg -version

cd dentista-ulcera
npx hyperframes skills          # skills de HyperFrames
npx hyperframes doctor          # comprueba el entorno

# Voz catalana (Piper) en un entorno virtual propio
python3 -m venv .venv
.venv/bin/pip install piper-tts
mkdir -p audio/tts-model
for f in ca_ES-upc_ona-medium.onnx ca_ES-upc_ona-medium.onnx.json; do
  curl -L -o audio/tts-model/$f "https://huggingface.co/rhasspy/piper-voices/resolve/main/ca/ca_ES/upc_ona/medium/$f"
done
```

`npx hyperframes transcribe` descarga el modelo Whisper `large-v3` (3 GB) la primera vez.

## Rehacer el vídeo

```bash
cd dentista-ulcera

# 1. Edita el guion: una frase por línea, sin saltos de línea dentro de una frase.
#    (guion.txt)

# 2. Voz sintética → assets/voz.wav
.venv/bin/python scripts/tts.py
#    Ritmo y pausas: LENGTH_SCALE y GAP al principio de scripts/tts.py
#    (ahora 1.10 y 0.38 s: frases dichas con calma).

# 3. Momento exacto de cada palabra (en catalán: --language ca)
ffmpeg -y -i assets/voz.wav -ar 16000 -ac 1 audio/voz16k.wav
npx hyperframes transcribe audio/voz16k.wav --language ca --model large-v3
cp audio/transcript.json assets/transcript.json

# 4. Alinea el guion con la transcripción → assets/words.json
#    Muestra las palabras que faltan, sobran o se han oído distinto.
node scripts/align.mjs assets/transcript.json

# 5. Genera la animación y la mezcla de sonido
node scripts/build.mjs     # escribe index.html, compositions/*.html y assets/sfx-cues.json
node scripts/mix.mjs       # voz + efectos + música → assets/mix.wav a −14 LUFS
node scripts/build.mjs     # vuelve a escribir index.html apuntando a mix.wav

# 6. Comprueba y renderiza
npx hyperframes check
npx hyperframes render -o renders/video-FINAL.mp4
npx hyperframes render -o renders/video-SIN-SUBTITULOS.mp4 --variables '{"captions":false}'
```

Prueba rápida de un trozo (por ejemplo, los primeros 8 s):

```bash
node scripts/build.mjs --until 8.5
npx hyperframes render -o renders/prova-8s.mp4
node scripts/build.mjs        # vuelve a la versión completa
```

## Comprobaciones finales

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 renders/video-FINAL.mp4                    # duración = voz
ffmpeg -i renders/video-FINAL.mp4 -vf blackdetect=d=0.03:pix_th=0.1 -an -f null - 2>&1 | grep black_start  # sin negros
ffmpeg -i renders/video-FINAL.mp4 -af ebur128=peak=true -vn -f null - 2>&1 | grep -E "I:|Peak:"           # ≈ −14 LUFS
npx hyperframes snapshot --at 0.7,4.9,13.2,17.1,23.1,27.5,31.6,40.8,44.9,56.1,58.8                      # capturas
```

## Qué hace cada archivo

| Archivo | Para qué |
| --- | --- |
| `guion.txt` | El guion aprobado. Una frase por línea. |
| `scripts/tts.py` | Voz sintética en catalán, frase a frase, con pausas fijas. |
| `scripts/align.mjs` | Une el guion con la transcripción de Whisper (tiempos reales, ortografía del guion). |
| `scripts/build.mjs` | El generador: dibuja el mundo 2D, los personajes y la cámara, y pega cada animación a su palabra con `P("palabra", n)`. |
| `scripts/mix.mjs` | Coloca cada efecto en su momento (el pico, un fotograma después de la imagen), añade la música baja y normaliza a −14 LUFS. |
| `scripts/clean_audio.mjs` | Limpia una grabación propia: quita silencios largos (máx. 0,25 s) y tramos marcados. Solo si vuelves a usar tu voz. |
| `assets/sfx/`, `assets/music/` | Efectos y música gratuitos de Mixkit (licencia Mixkit). |
| `assets/icons/` | Iconos Phosphor (bold). |

### Cambiar cosas del generador (`scripts/build.mjs`)

- **Duración mínima**: `const TARGET = 56`. El vídeo dura lo que dure la voz, y nunca menos de 56 s.
- **Respuestas del paciente y ficha clínica**: las listas `questions`, `history` y `measures`.
- **Colores**: el objeto `C`.
- **Palabras resaltadas en los subtítulos**: el objeto `KEY` (azul, rojo y verde).
- **Momentos de cada animación**: busca `P("palabra")`. La n-ésima vez que se dice una palabra es `P("palabra", n)`.

### Usar tu propia grabación en lugar de la voz sintética

```bash
node scripts/clean_audio.mjs audio/original.m4a [cortes.json]   # → assets/voz.wav
# y sigue desde el paso 3
```
