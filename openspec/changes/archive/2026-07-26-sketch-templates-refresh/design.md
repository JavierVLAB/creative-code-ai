## Decisión: p5.js-svg como excepción documentada al contrato

`front/src/components/workspace/SketchViewer.tsx` inyecta hoy un único `<script>` (p5.js 1.11.3 vía cdnjs) en el `srcDoc` del iframe. Se añade una segunda línea con el addon `p5.js-svg` (CDN, ej. jsDelivr), después del script de p5.js:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.js-svg@1.5.1/dist/p5.svg.js"></script>
```

**Nota de incertidumbre real**: no tengo forma de verificar en este momento que la versión exacta de `p5.js-svg` publicada en jsDelivr sea 100% compatible con p5 1.11.3 sin probarlo en el navegador. La tarea de implementación incluye comprobar en runtime que `createCanvas(w, h, SVG)` funciona y que no rompe ningún sketch existente que no la usa (los sketches que no piden `SVG` siguen usando el renderer normal — el addon es aditivo, no sustituye nada).

Esto es una ampliación del runtime compartido documentado en `sketch-contract` (marcado "inmutable por diseño"). Se trata como excepción explícita: no cambia ninguna regla existente del contrato, solo añade una capacidad opcional (`SVG` como tercer argumento de `createCanvas`) que ya es nativa de p5.js — el addon solo la implementa.

## Decisión: exportación SVG vía bridge postMessage, no descarga directa desde el iframe

El iframe usa `sandbox="allow-scripts"` (sin `allow-downloads` ni `allow-same-origin`). Una descarga disparada directamente dentro de un iframe sandboxed sin `allow-downloads` no es fiable entre navegadores. El proyecto ya resuelve un problema análogo para PNG: `CAPTURE_CANVAS` → `CAPTURED_CANVAS` (ver `SketchViewer.tsx` líneas 70-84 y `front/src/lib/sketch-preview.ts`), donde el padre pide una captura y el iframe responde con un `dataUrl`, y es el padre quien decide qué hacer con ella.

Se añade el mismo patrón para SVG:

- **App → iframe**: `{ type: 'EXPORT_SVG' }`
- **iframe → App**: `{ type: 'EXPORTED_SVG', svg: string | null }` — el sketch expone una función `window.__exportSVG` (o similar) que los dos sketches SVG (plotter y mosaico de arcos) implementan llamando a `save()`/`saveSvg()` de `p5.js-svg` sobre un elemento en memoria, o serializando el `SVGElement` del canvas directamente con `XMLSerializer` si el addon expone el nodo DOM.
- El padre recibe el string SVG y dispara la descarga real desde el documento de nivel superior (`Blob` + `<a download>`), fuera del sandbox — igual que ya se hace para el PNG.
- Se añade un botón "Exportar SVG" en el sidebar (`ParamsControls` o `Sidebar`), visible solo si el sketch actual lo soporta. Detección: el `config_yaml`/plantilla puede declarar `supports_svg_export: true` en sus metadatos, o más simple, el botón se muestra siempre para plantillas con `renderer: p5js` (el botón no hace nada si el sketch no implementa `__exportSVG` — el padre trata `svg: null`/timeout como "no soportado" y no rompe la UI).

**Alcance**: esto toca `SketchViewer.tsx` (nuevo case en el listener existente) y probablemente un botón nuevo en el sidebar — no toca el backend ni el agente.

## Decisión: control de imagen — usar la tabla `assets` ya existente + selector

**Corrección sobre una afirmación previa**: se dijo que el proyecto no tenía ningún sistema de assets. Es falso — `supabase/migrations/20260623000000_initial_schema.sql` ya define `public.assets` (`id`, `project_id`, `user_id`, `name`, `url`, `mime_type`, `size_bytes`, `created_at`) con RLS de select/insert/delete por dueño, sin usar hoy en ningún flujo. Al descubrirlo, se replanteó con Javi: dado que la tabla y sus políticas ya existen, el coste real de un selector de "imágenes ya subidas" es solo el bucket de Storage + el hook + la UI — no hace falta tabla nueva. Se confirma: **sí, sistema completo con selector**.

### Nuevo tipo de control `image` en `config.yaml` (extensión aditiva de `sketch-contract`)

```yaml
imagen_fuente:
  type: image
  label: Imagen de origen
```

- No lleva `min`/`max`/`options` — solo `label`.
- El valor que recibe el sketch en `params.imagen_fuente` es siempre un **string URL** (http(s) o data URL), nunca un objeto File. El sketch la usa con `loadImage(url, cb)`.
- `front/src/lib/controls.ts` añade un tercer `if (m.type === 'image')` → `Control` de `kind: 'image'`, con solo `key`/`label`.
- `front/src/lib/types.ts` añade `ImageControl` a la unión `Control`.

### Componente `ControlImage.tsx` (nuevo, en `ParamsControls`)

- Muestra miniatura de la imagen elegida si `value` no está vacío, si no un placeholder "Sin imagen".
- Dos acciones: botón "Subir imagen" (`<input type="file" accept="image/*">` oculto) y botón "Elegir de las subidas" que despliega una lista simple (miniatura + nombre) de los `assets` del proyecto.
- Comportamiento según contexto (se distingue por si hay `projectId` real o no — el playground no tiene proyecto persistido):
  - **Workspace autenticado** (`projectId` presente): "Subir imagen" sube a Supabase Storage (`{project_id}/{asset_id}.<ext>`, sin sobreescribir — cada subida es un archivo nuevo), inserta una fila en `public.assets` (`name`, `url`, `mime_type`, `size_bytes`, `project_id`, `user_id`) y llama `onControlChange(key, url)`. "Elegir de las subidas" lista `assets` del proyecto (`useProjectAssets(projectId)`) y al seleccionar una simplemente hace `onControlChange(key, asset.url)` — sin subir nada.
  - **Playground público** (`projectId` ausente/null): solo está disponible "Subir imagen", y no toca Supabase — se lee con `FileReader` a `dataURL` en memoria (coherente con "el playground no persiste nada" de `public-playground`, que ya prohíbe escribir en `assets`) y se llama `onControlChange(key, dataUrl)` directamente. No hay "elegir de las subidas" en el playground (nada persiste).
- Validación mínima: solo `image/*`, límite de tamaño razonable (ej. 5 MB) rechazado con mensaje inline, sin backend.

### Bucket de Storage (público, mismo patrón que `snapshot-previews`) + RLS

El proyecto ya tiene precedente de bucket público para contenido no sensible ligado a un proyecto (`snapshot-previews`, usado en `front/src/lib/sketch-preview.ts` vía `getPublicUrl`). Se sigue el mismo patrón por consistencia, en vez de un bucket privado con signed URLs: el objeto es servible por URL directa (UUID de proyecto + UUID de asset, no listable ni adivinable), y la tabla `assets` (con su RLS ya existente) sigue siendo la única vía para *descubrir* qué URLs existen por proyecto.

Migración nueva `supabase/migrations/<timestamp>_add_sketch_uploads_bucket.sql`:

```sql
insert into storage.buckets (id, name, public)
values ('sketch-uploads', 'sketch-uploads', true)
on conflict (id) do nothing;

-- Ruta de objeto: {project_id}/{asset_id}.<ext>
create policy "sketch_uploads_owner_write"
on storage.objects for insert
with check (
  bucket_id = 'sketch-uploads'
  and exists (
    select 1 from public.projects
    where projects.id::text = (storage.foldername(name))[1]
      and projects.user_id = auth.uid()
  )
);

create policy "sketch_uploads_owner_delete"
on storage.objects for delete
using (
  bucket_id = 'sketch-uploads'
  and exists (
    select 1 from public.projects
    where projects.id::text = (storage.foldername(name))[1]
      and projects.user_id = auth.uid()
  )
);
```

Lectura de objetos: al ser un bucket público, el `select` de `storage.objects` no hace falta acotarlo por RLS (Supabase sirve el archivo por URL pública sin pasar por RLS de la tabla); el control de "quién puede ver qué" real está en la tabla `assets`, que ya tiene su propia RLS (`select own`).

- Fuera de alcance explícito: borrado de imágenes desde la UI (la policy de `delete` queda lista para cuando se implemente, pero esta iteración no añade el botón), cuota por usuario (Storage ya tiene límites de plan de Supabase).

## Plantillas nuevas — diseño de cada sketch

### 1. Tramado estocástico para serigrafía (`tramado-serigrafia`)

- Control `imagen_fuente` (`type: image`) + `resolucion` (`range`, tamaño de celda de muestreo en px), `umbral` (`range` 0-255), `contraste` (`range`), `intensidad` (`range` 0-1, mezcla entre imagen original y tramada), `invertir` (`select` sí/no), `algoritmo` (`select`: `floyd-steinberg` / `atkinson` / `estocastico`).
- Sin imagen cargada: `background` gris + texto "Sube una imagen desde el panel de parámetros".
- Con imagen: se carga a un `p5.Graphics` oculto a la resolución de trabajo, se recorre en escala de grises aplicando el algoritmo elegido, y se dibuja el resultado como puntos/píxeles negros sobre fondo blanco en el canvas visible (reescalado a tamaño de canvas completo).
- No usa `SVG` — es puro raster, exportable ya con el `CAPTURE_CANVAS`/PNG existente, sin tocar nada nuevo ahí.

### 2. Espiral de ruido Perlin para plotter (`espiral-plotter`)

Técnica confirmada por búsqueda (ver conversación): para cada vuelta de un espiral se recorre el ángulo `θ` de `0` a `2π`, y el radio en cada punto es `radioBase + noise(cos(θ)·escala, sin(θ)·escala, vuelta·0.1) * amplitud`, con `radioBase` creciendo un poco en cada vuelta completa — genera un trazo continuo, orgánico, sin auto-intersecciones bruscas.
- Controles: `vueltas` (`range`), `escala_ruido` (`range`), `amplitud` (`range`), `semilla` (`range`, para variar resultado), `grosor_trazo` (`range`, grosor visual en pantalla — no afecta al SVG exportado, que es trazo vectorial puro sin relleno).
- `draw()` traza la polilínea completa con `beginShape()`/`vertex()`/`endShape()`, `noFill()`, un único `stroke()`. `noLoop()` tras el primer render (es una composición estática, no una animación).
- Implementa `window.__exportSVG` usando `createGraphics(w, h, SVG)` de `p5.js-svg`: redibuja la misma geometría sobre ese graphics y serializa su SVG.

### 3. Flow field de ruido Perlin (`flow-field-perlin`)

- El clásico: un grid de ángulos derivado de `noise(x, y)` (mapeado a `[0, 2π]`), y N líneas/partículas que avanzan siguiendo el ángulo del campo en su posición.
- Controles: `n_lineas` (`range`), `escala_ruido` (`range`), `velocidad` (`range`), `longitud_traza` (`range`, pasos por línea), `color_linea` (`select`, paleta hex).
- Modo estático (se traza una vez y `noLoop()`), coherente con que es una plantilla de composición, no una animación en bucle — evita el coste de mantener el `draw()` corriendo indefinidamente en el playground público.
- No usa SVG (no lo pidió Javi para esta) — solo raster.

### 4. Mosaico de arcos (`mosaico-arcos`)

Adaptación del sketch que aportó Javi, reescrita completa:
- Se elimina toda dependencia de `OPC.*` (slider/toggle/palette/api de OpenProcessing) — los parámetros pasan a `config.yaml` estándar: `tamano_grid` (`range`), `paleta` (`select`, 3 colores hex, varias opciones predefinidas), `grosor_linea` (`range`), `semilla` (`range`), `solo_lineas` (`select` sí/no).
- Se simplifica la geometría: en vez de la función `encontrarPuntosInterseccion` (cálculo de intersección de dos circunferencias, usado para dos arcos secundarios de radio `4s/5` y `3s/5` cuyo único propósito visual era añadir un tercer y cuarto arco concéntrico), cada tile dibuja únicamente los dos arcos principales de Truchet (radio `s`, centrados en esquinas opuestas) — el patrón de mosaico continuo depende solo de esos dos arcos; los arcos adicionales eran una variación estética, no estructural. Resultado: mismo lenguaje visual (mosaico de arcos tipo Truchet), bastante menos código y sin trigonometría de intersección de círculos.
- Cada tile es uno de dos patrones (arcos concéntricos vs. líneas rectas paralelas), elegido aleatoriamente con semilla fija por sesión (`randomSeed(semilla)`), rotado aleatoriamente en múltiplos de 90°.
- Implementa `window.__exportSVG` igual que el sketch de plotter: redibuja el grid completo sobre un `createGraphics(w, h, SVG)`.
- Nombres de función y variables en español, comentarios explicando el porqué de cada decisión geométrica (ej. por qué solo 2 arcos y no 4).

## Migraciones (orden)

1. `..._delete_extra_templates.sql` — `delete from public.templates where slug in ('ondas-perlin', 'mandala-geometrico', 'lluvia-de-cuadrados', 'campo-de-vectores');`
2. `..._add_sketch_uploads_bucket.sql` — bucket + policy (ver arriba).
3. `..._add_refreshed_templates.sql` — `insert into public.templates (...) values (...) on conflict (slug) do update ...` con las 4 plantillas nuevas, mismo patrón que las migraciones existentes.

## Specs afectadas

- **Modificada**: `openspec/specs/sketch-contract/spec.md` — nuevo tipo de control `image`, y nota sobre el addon `p5.js-svg` disponible en el runtime.
- **Modificada**: `openspec/specs/sketch-workspace/spec.md` — nuevo requirement sobre el control de imagen (subida/reemplazo) y sobre el flujo de exportación SVG vía `EXPORT_SVG`/`EXPORTED_SVG`.
- **Modificada**: `openspec/specs/supabase-patterns/spec.md` — nuevo bucket de Storage con RLS (no solo tablas).
- **Modificada**: `openspec/specs/template-library/spec.md` — contenido publicado cambia (no el comportamiento).

## Fuera de alcance (explícito)

- Borrado de imágenes desde la UI y gestión de cuota por asset — la policy de `delete` queda lista pero sin botón en esta iteración.
- Soporte three.js en `buildSrcdoc` — deuda técnica conocida y ajena a este change (ver `2026-07-26-sketch-creation-origins/design.md`).
- Cuota o límite de Storage a nivel de usuario — se confía en los límites del plan de Supabase.
