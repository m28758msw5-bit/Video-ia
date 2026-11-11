# Cómo rehacer «Per què algunes cèl·lules no paren de dividir-se?»

Horizontal 1920×1080 a 30 fps, 73 s. Fondo verde menta #DDF7DE, ilustraciones (células, ciclo celular, semáforo, ADN, apoptosis, mutación, neoplasia), pocas palabras clave.
Voz de la usuaria + efectos de sonido (Mixkit), sin música ni subtítulos.

- Transcripción corregida: `assets/transcript.json` (segueixen, massa greu, neoplàsies). `P("palabra", n)` = cuándo se dice.

```bash
cd video6
node scripts/build.mjs && node scripts/mix.mjs && node scripts/build.mjs
npx hyperframes check
npx hyperframes render -o renders/cicle-cellular.mp4
```
