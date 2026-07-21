## Why

El flujo actual permite guardar snapshots de parámetros, pero solo se muestran como una lista de texto en el sidebar. Para un artista generativo, la curación es un proceso visual: necesita ver las variaciones una al lado de la otra, compararlas y quedarse con las mejores. Una lista de nombres no permite esa comparación. Sin previews visuales guardados con cada snapshot, el usuario tiene que recordar qué combinación de valores producía qué resultado.

## What Changes

- **Preview visual al guardar snapshot:** cuando el usuario guarda un snapshot, se captura un screenshot del canvas del iframe y se sube a Supabase Storage. La URL se guarda en una nueva columna `preview_url` de la tabla `snapshots`.
- **Vista grid del canvas:** el área principal del workspace puede alternar entre el iframe del sketch (modo sketch) y un grid de miniaturas de snapshots (modo grid). Dos tabs en la esquina superior izquierda del canvas permiten cambiar entre ambos modos.
- **Curación básica en el grid:** cada miniatura tiene un checkbox para selección múltiple, y al hacer hover muestra acciones de favorita (estrella) y borrar (papelera con confirmación). Al seleccionar varios snapshots, aparece una barra de acciones bulk: borrar selección y marcar favoritas.

## Capabilities

### New Capabilities
- `snapshot-preview`: captura de screenshot del canvas al guardar un snapshot y persistencia en Supabase Storage.
- `snapshot-grid-view`: vista de cuadrícula de snapshots con miniaturas visuales en el área principal del canvas.
- `snapshot-curation`: acciones de curación (favorita, borrar, selección múltiple, acciones bulk).

### Modified Capabilities
- `sketch-workspace`: el workspace pasa a soportar dos modos (sketch/grid) en el área principal del canvas.

## Impact

- **Base de datos:** migración para añadir columna `preview_url` (text, nullable) a la tabla `snapshots`.
- **Supabase Storage:** nuevo bucket `snapshot-previews` para almacenar las imágenes de preview.
- **Frontend:** nuevo componente `SnapshotGrid`, nuevo componente `CanvasTabs`, modificación de `SketchViewer` para soportar el toggle de modos, modificación de `WorkspacePage` para manejar el modo activo y la captura de previews.
- **Shared types:** extender tipo `Snapshot` con campo `previewUrl`.
