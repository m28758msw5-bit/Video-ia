# Cómo rehacer «Trucs per entendre el llenguatge científic»

Horizontal 1920×1080 a 30 fps, 2 min 24 s. Fondo verde menta #DDF7DE (el del vídeo de la usuaria). Muy visual y con poco texto:
las palabras se construyen con bloques — prefijo (lila), raíz (azul), sufijo (naranja). Voz de la usuaria + efectos de sonido (Mixkit), sin música ni subtítulos.

- Transcripción: `assets/transcript.json` (Whisper large-v3 en catalán; tramo 82–87 s retranscrito y correcciones confirmadas: dentista, desxifrar, hipoglucèmia, neuràlgia, -ectomia, procediments, sialometria, segueixen).
- `P("palabra", n)` en el generador = cuándo se dice (también dentro de «amb-itis», «i-metria», etc.).

```bash
cd video4
node scripts/build.mjs        # world.html + assets/sfx-cues.json
node scripts/mix.mjs          # voz + efectos → assets/mix.wav (−14 LUFS)
node scripts/build.mjs
npx hyperframes check
npx hyperframes render -o renders/trucs-terminologia.mp4
```

Cambiar: raíces en `ROOTS`; bloques y etiquetas con `blk(...)` y `lbl(...)`; colores en `C`.
