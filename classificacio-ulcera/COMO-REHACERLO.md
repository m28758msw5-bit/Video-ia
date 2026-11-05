# Cómo rehacer «Com classifiquem la lesió?»

Infografía médica animada, horizontal 1920×1080 a 30 fps, **sin voz, sin subtítulos y sin música** (solo efectos discretos). 71 s.
Animación 2D con HyperFrames (HTML + GSAP); todas las ilustraciones (boca, lengua, silueta, corte del tejido) son vectoriales y se generan desde el código.

## Requisitos

```bash
node -v   # 22 o superior
ffmpeg -version
npx hyperframes doctor
```

## Rehacer el vídeo

```bash
cd classificacio-ulcera
node scripts/build.mjs        # escribe index.html, compositions/world.html y assets/sfx-cues.json
node scripts/mix.mjs          # pista de efectos → assets/sfx-mix.wav (pico a −3 dB)
node scripts/build.mjs        # vuelve a escribir index.html con la pista de efectos
npx hyperframes check
npx hyperframes render -o renders/classificacio-lesio.mp4
```

Prueba rápida de un trozo: `node scripts/build.mjs --until 15` (luego vuelve a `node scripts/build.mjs`).

Comprobaciones:

```bash
ffmpeg -i renders/classificacio-lesio.mp4 -vf blackdetect=d=0.03:pix_th=0.1 -an -f null - 2>&1 | grep black_start   # sin negros
npx hyperframes snapshot --at 1.6,10.5,15.8,25.5,37,40,48.6,54,64,69.5                                         # capturas
```

## Cambiar cosas (`scripts/build.mjs`)

| Qué | Dónde |
| --- | --- |
| Momento en que empieza cada escena | Tabla `B` al principio (segundos). `cardGap` = separación entre las 4 tarjetas. |
| Textos de los criterios y de las clasificaciones | Lista `CRIT` (`k`, `short`, `res`). |
| Textos de cada escena | Función `world()` (filas `row(...)`, etiquetas, notas). |
| Colores | Objeto `C`. |
| Efectos de sonido | Llamadas `sfx(...)`; para quitarlos todos, borra `assets/sfx-mix.wav` y vuelve a ejecutar `node scripts/build.mjs`. |

Estructura: un único lienzo 2D con una sola cámara. La pregunta y las 4 tarjetas están en el centro; cada criterio tiene su escena a la derecha (1 · Origen, 2 · Duración, 3 · Distribución, 4 · Tipo de alteración) y la cámara viaja de una a otra siguiendo el camino de puntos.

Efectos de sonido: Mixkit (licencia Mixkit). Iconos: Phosphor.
