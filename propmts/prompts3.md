# CurateArtAI — Resumen de sesión (20-jul-2026)

En esta sesión reforzamos el arnés del proyecto antes de pasar al trabajo por pull requests.

Hicimos tres cosas principales:

- reorganizamos `AGENTS.md`, `CLAUDE.md` y `.agents/` para separar contrato del proyecto, operación diaria y playbooks reutilizables;
- redefinimos los subagentes como especialistas por dominio, no como agentes genéricos;
- ampliamos el catálogo de skills y añadimos hooks de advertencia para OpenSpec.

También se implementó el hook compartible en `.claude/settings.json`, con el script en `.claude/hooks/warn_openspec_scope.py`. El comportamiento es no bloqueante: avisa si se edita sin change activo o fuera del scope inferido.

---

# Sesión 21 julio 2026 — Snapshot Grid & Curation

## Cambio implementado: `snapshot-grid-curation`

Añadir vista de cuadrícula de snapshots con previews visuales, selección múltiple, favoritas y borrado.

### Lo que se hizo

- **Migración SQL**: columna `preview_url` en tabla `snapshots`
- **Bucket Supabase**: `snapshot-previews` creado manualmente desde el dashboard (RLS con policies por usuario)
- **Captura de previews**: postMessage desde el iframe — el sketch captura su propio canvas y lo devuelve al padre. Reintenta hasta 5 veces si el canvas no está listo
- **SnapshotGrid**: grid de miniaturas (160px fijos, centrado). Checkbox para selección, estrella persistente en favoritas, hover con acciones
- **Selección múltiple**: check siempre añade/quita de la selección. Cmd/Ctrl + click en imagen selecciona sin cargar
- **Borrado bulk**: indicador flotante abajo al centro (contador + Cancelar + Borrar) con ConfirmDialog
- **Favoritos**: estado local (Set de IDs). Estrella amarilla persistente en cards marcadas
- **Navegación**: botón "Grid" en SnapshotsPanel para entrar al grid, botón lápiz flotante para volver al sketch
- **Sidebar**: prop `showControls` para ocultar ParamsControls en modo grid

---

# Sesión 26 julio 2026 — Refresco de plantillas + exportación SVG

## Change: `sketch-templates-refresh` (archivado)

Se pidió reemplazar 4 plantillas insertadas en una sesión anterior sin revisión creativa directa, por 4 plantillas nuevas orientadas a técnicas de producción: tramado/dithering para serigrafía, espiral de ruido Perlin para plotter, flow field de Perlin clásico, y una adaptación de un sketch de mosaico de arcos tipo Truchet aportado por Javi.

### Lo que se construyó

- **Addon `p5.js-svg`** cargado en el runtime del iframe (`SketchViewer.tsx`), habilitando `createCanvas(w,h,SVG)`/`createGraphics(w,h,SVG)`.
- **Control `type: image`** nuevo en el contrato de `config.yaml`: componente `ControlImage.tsx` con "Subir" y "Galería" (elegir entre imágenes ya subidas al proyecto). Reutiliza la tabla `assets` (ya existía en el schema inicial, sin usar hasta ahora) + nuevo bucket público `sketch-uploads` con RLS por dueño del proyecto. En el playground público (efímero) cae a `FileReader`/data URL en memoria, sin tocar Supabase.
- **Exportación SVG real**: protocolo `EXPORT_SVG`/`EXPORTED_SVG` + chequeo previo barato `HAS_SVG_EXPORT`/`HAS_SVG_EXPORT_RESULT` (para mostrar el botón solo si el sketch realmente lo soporta). La descarga se dispara desde la página, nunca desde dentro del iframe sandboxed — mismo patrón que ya existía para capturar PNG de snapshots.
- **4 plantillas nuevas**, todas p5.js: `tramado-serigrafia` (dithering Floyd-Steinberg/Atkinson/estocástico), `espiral-plotter` (radio modulado por ruido Perlin, técnica confirmada por búsqueda web), `flow-field-perlin` (líneas sobre campo de ángulos), `mosaico-arcos` (adaptación del sketch de Javi: arcos concéntricos + `encontrarPuntosInterseccion`, sin las dependencias `OPC.*` del runtime original).
- **3 migraciones** de Supabase: borrado del contenido anterior sin revisar, bucket nuevo, e inserción del contenido final revisado.

### Bugs reales encontrados y corregidos durante las pruebas de Javi (varias rondas)

- `p5.js-svg@1.5.1` es incompatible con p5.js 1.11.x ("drawingContext is undefined") → subido a `1.6.0`.
- El SVG real en `p5.js-svg@1.6.0` vive en `g._renderer.svg`, no en `g.elt` (que es un objeto interno de la librería, no un nodo del DOM) — la extracción inicial buscaba en el lugar equivocado.
- El botón "Exportar SVG" se mostraba siempre (sin comprobar soporte real), y luego un `setSvgExportAvailable(false)` mal puesto en `sendInit`/`sendRestart` anulaba el resultado correcto del chequeo — quitado.
- Botón/textos no seguían los tokens de diseño del proyecto (`--btn-*`) y quedaba pegado a una línea divisoria innecesaria — se integró dentro del bloque de "Parámetros" en vez de ser una sección aparte.
- El mosaico de arcos: los dos ángulos de intersección no estaban ordenados, así que el hueco que da la sensación de "un arco pasa por debajo" no se producía y los arcos se cruzaban.
- "Snapshots desaparecidos" no era un bug: el playground público (`/playground`) tiene `showSnapshots={false}` a propósito (no persiste nada); Javi estaba probando ahí.

### Nota de proceso

Al revisar el alcance de "subir imagen", se descubrió que la tabla `assets` ya existía en el schema inicial sin usarse — se replanteó en vivo con Javi para aprovecharla (con selector de imágenes ya subidas) en vez de limitar el alcance a solo subir/reemplazar.

