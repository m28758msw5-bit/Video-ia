# Cómo rehacer «Biòpsia i estudi histològic» (versión realista)

Horizontal 1920×1080 a 30 fps, 63,5 s. Fondo claro, ilustración médica con volumen y **fotografías histológicas reales** (ver `CREDITS.md`).
Sin voz, sin música y sin subtítulos: solo **palabras clave** grandes que entran con un golpe. Efectos de sonido discretos.

## Rehacer

```bash
cd biopsia-histologia
node scripts/build.mjs        # index.html, compositions/world.html, assets/sfx-cues.json
node scripts/mix.mjs          # efectos → assets/sfx-mix.wav (pico −3 dB)
node scripts/build.mjs
npx hyperframes check
npx hyperframes render -o renders/biopsia-histologia.mp4
```

## Cambiar cosas (`scripts/build.mjs`)

| Qué | Dónde |
| --- | --- |
| Momento de cada escena | Tabla `B` (segundos). |
| Palabras clave, cuándo salen, color y tamaño | Lista `KW` (`t`, `d`, `text`, `tone`, `big`). |
| Imágenes de microscopio | `assets/micro/*.jpg`; células resaltadas: `HL` (fracciones de la imagen). |
| Colores | Objeto `C`. |
| Quitar los efectos | Borra `assets/sfx-mix.wav` y ejecuta `node scripts/build.mjs`. |

La versión anterior (fondo oscuro y líneas neón, con frases) sigue en `scripts/build-v1-neo.mjs`.
