# Cómo rehacer «A la consulta» (3D)

Horizontal 1920×1080 a 30 fps, 34 s. Escena 3D con Three.js (r160, en `assets/vendor`): clínica con luces y sombras, figuras 3D articuladas
(paciente y dentista), interior de la boca con la úlcera y la dent afilada, e interior del organismo (células y vaso sanguíneo).
Voz de la usuaria con silencios añadidos (3 s al inicio, 2 s tras la 1.ª frase, 2 s tras la 2.ª, 3 s al final) + efectos de sonido (Mixkit). Solo 3 palabras en pantalla.

```bash
cd video5
node scripts/build.mjs        # index.html (escena 3D + títulos) y assets/sfx-cues.json
node scripts/mix.mjs          # voz + efectos → assets/mix.wav (−14 LUFS)
node scripts/build.mjs
npx hyperframes check
npx hyperframes render -o renders/consulta-3d.mp4     # ~10 min (WebGL por software)
```

- El 3D se dibuja en cada fotograma desde el tiempo (`hf-seek` → `render(t)`), así que el render es determinista.
- Momentos clave: objeto `K` en `scripts/build.mjs` (salen de las palabras: `P("úlcera")`, `P("quatre")`…).
- Audio con silencios: `assets/voz.wav` y `assets/transcript.json` (tiempos ya recolocados; «fragment» corregido a «fregament»).
