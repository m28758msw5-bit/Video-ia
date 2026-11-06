# Cómo rehacer «Com es repara el teixit? — Regeneració»

Horizontal 1920×1080 a 30 fps, 42,4 s. Fondo claro, bloque de mucosa en corte y lupa a nivel celular (formato inspirado en el vídeo de referencia).
Audio: la voz de la usuaria **con sus propios efectos de sonido** (de su montaje), recortada al final y normalizada a −14 LUFS. Sin subtítulos ni música.

## Cómo está sincronizado

- **Palabras**: `assets/transcript.json` (Whisper large-v3 en catalán, con las correcciones confirmadas: segons, mitjançant el qual, migren, protectora). En el generador, `P("palabra", n)` = cuándo se dice.
- **Efectos de sonido del audio**: tabla `FX` en `scripts/build.mjs` (detectados separando agudos >6 kHz —purpurina, glockenspiel— y graves <110 Hz —golpe—). Los títulos y las apariciones caen sobre esos efectos.

## Rehacer

```bash
cd regeneracio-cellular
# audio (si cambia la grabación)
ffmpeg -i audio/referencia.mp4 -vn -ac 1 -ar 16000 audio/veu16k.wav
npx hyperframes transcribe audio/veu16k.wav --language ca --model large-v3
#   → copiar las palabras a assets/transcript.json y corregir las que Whisper oiga mal
ffmpeg -i audio/referencia.mp4 -vn -af "atrim=0:41.7,afade=t=out:st=41.3:d=0.4,apad=whole_dur=42.4" -ar 48000 -ac 2 audio/audio-pre.wav
#   → normalizar a −14 LUFS con loudnorm (dos pasadas) → assets/audio.wav

node scripts/build.mjs
npx hyperframes check
npx hyperframes render -o renders/regeneracio-cellular.mp4
```

## Cambiar cosas (`scripts/build.mjs`)

| Qué | Dónde |
| --- | --- |
| Títulos (texto, estilo, posición) | Lista `TXT`. Estilos: `yellow`, `white`, `pinkbox`, `list`. |
| Momentos de los efectos del audio | Tabla `FX`. |
| Células de la lupa (filas, hueco de la herida) | `ROWS` y `GAP`. |
| Colores | Objeto `C`. |
