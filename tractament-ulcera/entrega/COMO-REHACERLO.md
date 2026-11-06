# Cómo rehacer «Nucli 8 · Recursos terapèutics — Tractament de l'úlcera»

Horizontal 1920×1080 a 30 fps, 77 s (ritmo lento: `SLOW = 1.4`). Tarjetas solo con título + idea corta (`SHOW_THEORY`, `SHOW_EX` = false; los textos completos siguen en la lista `S`). Fondo claro e ilustración realista (mismo estilo que «Biòpsia i estudi histològic»).
Sin voz, sin música y sin subtítulos: en cada tipo de tratamiento aparece primero la frase teórica y después la tarjeta con las palabras clave y el ejemplo aplicado al caso, mientras a la derecha se ve la acción. Efectos de sonido discretos.

## Rehacer

```bash
cd tractament-ulcera
node scripts/build.mjs        # index.html, compositions/world.html, assets/sfx-cues.json
node scripts/mix.mjs          # efectos → assets/sfx-mix.wav (pico −3 dB)
node scripts/build.mjs
npx hyperframes check
npx hyperframes render -o renders/tractament-ulcera.mp4
```

## Cambiar cosas (`scripts/build.mjs`)

| Qué | Dónde |
| --- | --- |
| Textos (frase teórica, título, subtítulo, ejemplo), color y tiempos de cada escena | Lista `S` al principio (`t` y `end` en segundos, como la tabla del guion). |
| Título inicial | `#title` (en el HTML que genera el script). |
| Frase final | `#final`. |
| Colores | Objeto `C`. |
| Quitar los efectos | Borra `assets/sfx-mix.wav` y ejecuta `node scripts/build.mjs`. |

Escenas: 1 título · 2 tratamiento etiológico (turbina que pule la vora afilada) · 3 sintomático (ibuprofeno y menos dolor e inflamación) · 4 medidas no farmacológicas (alimentos irritantes fuera, cepillado) · 5 evitar el tabaco (mucosa irritada → mucosa que se recupera) · 6 seguimiento (calendario de visitas y evolución) · 7 si no mejora → revalorar.

Efectos: Mixkit (licencia Mixkit). Iconos: Phosphor. Ilustraciones generadas con código.
