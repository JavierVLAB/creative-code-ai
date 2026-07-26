## Why

Las 4 plantillas añadidas en `supabase/migrations/20260726000000_add_more_templates.sql` (`ondas-perlin`, `mandala-geometrico`, `lluvia-de-cuadrados`, `campo-de-vectores`) se escribieron sin revisión creativa directa de Javi — el propio change que las introdujo (`2026-07-26-sketch-creation-origins`, tarea 5.3) lo deja anotado como deuda pendiente: "se rediseñarán en un change aparte con su input directo antes de considerarlas definitivas". Este change es ese rediseño.

Además, el runtime de sketches (`front/src/components/workspace/SketchViewer.tsx`) solo carga `p5.js` 1.11.3 vía CDN, sin el addon `p5.js-svg`. Dos de las plantillas nuevas que pide Javi (plotter y mosaico de arcos) necesitan generar SVG vectorial real, no solo capturas PNG del canvas — imprescindible para un plotter físico, que dibuja trazos, no píxeles.

## What Changes

- **Se eliminan 4 plantillas** (`ondas-perlin`, `mandala-geometrico`, `lluvia-de-cuadrados`, `campo-de-vectores`) vía una migración nueva de `DELETE FROM public.templates WHERE slug IN (...)`. No se toca ni se borra la migración `20260726000000_add_more_templates.sql` (puede que ya se aplicara en Supabase); la migración de borrado es una migración nueva y posterior.
- **Se mantienen intactas** las 3 plantillas originales (`demo`, `bezier-noise`, `particulas`) de `20260702120000_add_public_templates.sql`.
- **Se añade el addon `p5.js-svg`** al `srcDoc` del iframe en `SketchViewer.tsx` (script CDN adicional, después del de `p5.js`). Esto es una excepción documentada al `sketch-contract` (marcado "inmutable por diseño"): se amplía el runtime compartido, no se rompe el contrato existente — los sketches que no usan `SVG` como modo de canvas siguen funcionando exactamente igual.
- **Se añaden 4 plantillas nuevas de creative coding**, todas `p5js`, siguiendo `sketch-contract` al pie de la letra:
  1. **Tramado estocástico para serigrafía** — convierte una imagen (cargada por el propio usuario dentro del sketch, ver `design.md`) a blanco/negro puro vía dithering (Floyd-Steinberg o distribución estocástica), pensado como ayuda de preparación de fotolitos.
  2. **Trazos para pen-plotter** — dibujo geométrico generativo pensado para plotter (solo trazos, sin relleno raster), exportable a SVG real vía `p5.js-svg`.
  3. **Flow field de ruido Perlin** — el clásico de líneas/partículas siguiendo un campo de ángulos derivado de `noise()`.
  4. **Mosaico de arcos (Truchet)** — adaptación moderna del sketch de tiles con arcos que aportó Javi (grid de tiles rotados con arcos que forman patrones continuos), reescrito al contrato real del proyecto (nada de `OPC.slider`/`OPC.palette`, que pertenece a un runtime ajeno tipo OpenProcessing) y exportable a SVG.

## Capabilities

### Modified Capabilities
- `template-library`: cambia el contenido publicado de la biblioteca (7 → 3 + 4 nuevas = 7, pero con contenido distinto); no cambia ningún requirement de comportamiento.
- `sketch-contract`: se documenta la adición del addon `p5.js-svg` al runtime compartido del iframe como capacidad opcional (los sketches que no la usan no se ven afectados).

## Impact

- **Frontend**: `SketchViewer.tsx` — una línea nueva de `<script>` CDN en `buildSrcdoc`. Ningún otro archivo de frontend cambia.
- **Backend**: ninguno.
- **Base de datos**: una migración nueva de `DELETE` (4 filas) + una migración nueva de `INSERT ... on conflict (slug) do update` (4 plantillas nuevas). Sin cambios de esquema.
- **Contenido**: 4 sketches `sketch.js` + `config.yaml` nuevos, revisados con Javi antes de darlos por definitivos (a diferencia del change anterior).
