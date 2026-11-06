# Cómo rehacer «Exemple: el nen i la pizza»

Horizontal 1920×1080 a 30 fps, 27,3 s. Fondo claro, niño y estómago dibujados en 2D (personaje propio, no el del vídeo de referencia).
Audio: la voz de la usuaria con sus propios efectos, recortada y normalizada a −14 LUFS. Sin subtítulos ni música.

- Palabras: `assets/transcript.json` (Whisper large-v3 en catalán; «teologia» corregido a «etiologia»). `P("palabra", n)` en el generador.
- Glockenspiel de cada concepto (detectado en la banda aguda del audio): tabla `FX` — los títulos caen sobre él.

```bash
cd terminologia
node scripts/build.mjs
npx hyperframes check
npx hyperframes render -o renders/exemple-pizza.mp4
```

Títulos: lista `TITLES` en `scripts/build.mjs`.
