# Cómo rehacer «Biòpsia i estudi histològic»

Infografía de fisiopatología, continuación directa del vídeo anterior. Horizontal 1920×1080 a 30 fps, 120 s.
Fondo oscuro, letra blanca fina (Inter 300), detalles en turquesa y azul eléctrico. **Sin voz, sin subtítulos y sin música**: solo las frases indicadas en pantalla y efectos de sonido discretos.

## Rehacer

```bash
cd biopsia-histologia
node scripts/build.mjs        # index.html, compositions/world.html, assets/sfx-cues.json
node scripts/mix.mjs          # efectos → assets/sfx-mix.wav (pico −3 dB)
node scripts/build.mjs        # index.html con la pista de efectos
npx hyperframes check
npx hyperframes render -o renders/biopsia-histologia.mp4
```

Prueba de un trozo: `node scripts/build.mjs --until 25`.

## Cambiar cosas (`scripts/build.mjs`)

| Qué | Dónde |
| --- | --- |
| Frases en pantalla (texto exacto) y palabras en turquesa | Lista `PHRASES` (`t`, `acc`). `scene` dice en qué escena se lee. |
| Tiempo de lectura | `READ` = 1,4 s + 0,3 s por palabra; `GAP` entre frases; `TRAVEL` = viaje de cámara entre escenas. Todo el calendario se recalcula solo. |
| Colores | Objeto `C`. |
| Tamaño y estilo de la letra | CSS `.ph` (46 px, peso 300). |
| Ilustraciones | `buildWorld()`: lengua de líneas, bloque de tejido y punzón, vial, microscopio, campos microscópicos (`field`/`epithelium`), neoplasia, benigna/maligna con vasos sanguíneo y linfático, ciclo final. |
| Quitar los efectos | Borra `assets/sfx-mix.wav` y vuelve a ejecutar `node scripts/build.mjs`. |

Escenas (una sola cámara que viaja): 1 exploración y causa → 2 biopsia → 3 laboratorio → 4 campo microscópico → 5 normal vs alterado → 6 división controlada → 7 neoplasia → 8/9 benigna y maligna → 10 la biopsia detecta → 11 lesión que no cicatriza → estudio.

Efectos: Mixkit (licencia Mixkit).
