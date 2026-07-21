# snapshot-grid-curation Specification

## Purpose

Definir los requisitos del sistema de curación de snapshots: captura de previews visuales, vista de cuadrícula de miniaturas, selección múltiple y acciones de curación (favorita, borrar).

## Requirements

---

### Requirement: La app captura un preview visual al guardar un snapshot
Cuando el usuario guarda un snapshot, la app SHALL capturar un screenshot del canvas del iframe y subirlo a Supabase Storage. La URL del preview se guarda en la columna `preview_url` de la tabla `snapshots`.

#### Scenario: Snapshot guardado con preview exitoso
- **WHEN** el usuario guarda un snapshot
- **THEN** la app accede al canvas del iframe vía `contentWindow`
- **THEN** llama a `canvas.toDataURL('image/png')` para obtener la imagen
- **THEN** sube el Blob a Supabase Storage en la ruta `{userId}/{projectId}/{snapshotId}.png`
- **THEN** guarda el snapshot con `preview_url` en la tabla `snapshots`

#### Scenario: Captura de preview falla
- **WHEN** el canvas no está disponible o la subida a Storage falla
- **THEN** el snapshot se guarda igualmente sin preview (`preview_url = null`)
- **THEN** no se muestra error al usuario

### Requirement: El workspace soporta dos modos de visualización
El área principal del workspace SHALL alternar entre el iframe del sketch (modo sketch) y un grid de miniaturas de snapshots (modo grid). Dos tabs en la esquina superior izquierda del canvas permiten cambiar entre ambos modos.

#### Scenario: Cambio a modo grid
- **WHEN** el usuario hace click en el tab de grid
- **THEN** el iframe del sketch se oculta
- **THEN** se muestra el grid de miniaturas de snapshots
- **THEN** se ocultan el explorador de archivos y los controles de parámetros

#### Scenario: Cambio a modo sketch
- **WHEN** el usuario hace click en el tab de sketch
- **THEN** el grid de miniaturas se oculta
- **THEN** se muestra el iframe del sketch
- **THEN** se restauran el explorador de archivos y los controles de parámetros

### Requirement: El grid muestra miniaturas de snapshots
El grid SHALL renderizar una cuadrícula responsive de miniaturas de snapshots. Cada miniatura muestra el preview visual del snapshot (si existe) y su label.

#### Scenario: Grid con snapshots que tienen preview
- **WHEN** el modo grid está activo y hay snapshots con `preview_url`
- **THEN** cada miniatura muestra la imagen del preview con aspect-ratio 1:1
- **THEN** el label del snapshot se muestra debajo de la imagen

#### Scenario: Grid con snapshots sin preview
- **WHEN** un snapshot no tiene `preview_url`
- **THEN** la miniatura muestra un placeholder con icono de imagen y el label del snapshot

#### Scenario: Grid vacío
- **WHEN** no hay snapshots guardados
- **THEN** el grid muestra un mensaje "Sin snapshots guardados"

### Requirement: El grid soporta selección múltiple
El grid SHALL permitir selección múltiple de snapshots mediante checkboxes. El usuario puede seleccionar varios snapshots para acciones bulk.

#### Scenario: Selección de un snapshot
- **WHEN** el usuario hace click en la miniatura de un snapshot
- **THEN** el snapshot se selecciona (marcado con checkbox)
- **THEN** si ya estaba seleccionado, se deselecciona

#### Scenario: Selección múltiple con tecla modifier
- **WHEN** el usuario hace click en una miniatura con Cmd/Ctrl presionado
- **THEN** se añade a la selección sin deselectar los demás

#### Scenario: Selección de uno deselecciona otros (sin modifier)
- **WHEN** el usuario hace click en una miniatura sin Cmd/Ctrl
- **THEN** se seleccióna solo ese snapshot (los demás se deseleccionan)

### Requirement: El grid muestra acciones de curación en hover
Cada miniatura SHALL mostrar acciones de curación al hacer hover: favorita (estrella) y borrar (papelera).

#### Scenario: Hover sobre una miniatura
- **WHEN** el usuario hace hover sobre una miniatura
- **THEN** aparecen los botones de favorita y borrar en la esquina superior derecha
- **THEN** el borde de la miniatura cambia a un color más visible

#### Scenario: Marcar como favorita
- **WHEN** el usuario hace click en el botón de estrella
- **THEN** la estrella se marca en amarillo
- **THEN** el snapshot se persiste como favorito en la BD (`is_favorite = true`)

#### Scenario: Estrella persistente en favoritas
- **WHEN** un snapshot tiene `is_favorite = true`
- **THEN** la miniatura muestra una estrella amarilla siempre (no solo en hover)

#### Scenario: Borrar un snapshot
- **WHEN** el usuario hace click en el botón de papelera
- **THEN** se muestra un diálogo de confirmación
- **THEN** solo se borra si el usuario confirma

### Requirement: El grid muestra indicador de selección con borrado bulk
Cuando hay snapshots seleccionados, el grid SHALL mostrar un indicador flotante en la parte inferior con contador y acciones.

#### Scenario: Selección activa
- **WHEN** hay al menos un snapshot seleccionado
- **THEN** aparece un indicador flotante centrado en la parte inferior del grid
- **THEN** muestra el contador de seleccionados
- **THEN** muestra botones de "Cancelar" y "Borrar"

#### Scenario: Acción bulk de borrado
- **WHEN** el usuario hace click en "Borrar" con selección activa
- **THEN** se muestra un diálogo de confirmación
- **THEN** al confirmar, se borran todos los snapshots seleccionados
- **THEN** la selección se limpia

#### Scenario: Cancelar selección
- **WHEN** el usuario hace click en "Cancelar"
- **THEN** se limpia la selección
- **THEN** el indicador se oculta

### Requirement: El grid permite cargar un snapshot
El usuario SHALL poder cargar los valores de un snapshot desde el grid haciendo click en la imagen de la miniatura.

#### Scenario: Click en imagen de una miniatura
- **WHEN** el usuario hace click en la imagen de una miniatura
- **THEN** los valores del snapshot se cargan en los controles
- **THEN** el modo cambia a sketch
- **THEN** el sketch se actualiza con los nuevos valores

#### Scenario: Cmd/Ctrl + click en imagen
- **WHEN** el usuario hace Cmd/Ctrl + click en la imagen
- **THEN** el snapshot se selecciona/deselecciona sin cargar sus valores

### Requirement: La app muestra un diálogo de confirmación para borrado
La app SHALL mostrar un diálogo de confirmación antes de borrar snapshots, tanto individuales como bulk.

#### Scenario: Confirmación de borrado
- **WHEN** el usuario intenta borrar uno o más snapshots
- **THEN** se muestra un overlay oscuro con card centrada
- **THEN** el card muestra título, mensaje y botones "Cancelar" y "Borrar"
- **THEN** al confirmar, se ejecuta el borrado
- **THEN** al cancelar, se cierra el diálogo sin borrar

### Requirement: La tabla snapshots soporta preview_url
La tabla `snapshots` de Supabase SHALL tener una columna `preview_url` (text, nullable) para almacenar la URL de la imagen de preview.

#### Scenario: Migración de la columna
- **WHEN** se aplica la migración `20260721000000_add_snapshot_preview_url.sql`
- **THEN** la columna `preview_url` se añade a la tabla `snapshots`
- **THEN** la columna es nullable (snapshots existentes no tienen preview)

### Requirement: Supabase Storage almacena previews de snapshots
La app SHALL usar un bucket de Supabase Storage llamado `snapshot-previews` para almacenar las imágenes de preview de snapshots.

#### Scenario: Subida de preview
- **WHEN** se captura un preview exitosamente
- **THEN** el archivo se sube a la ruta `{userId}/{projectId}/{snapshotId}.png`
- **THEN** el bucket es privado (accesible solo vía URL firmada o pública según configuración)

#### Scenario: RLS del bucket
- **WHEN** un usuario intenta subir un archivo
- **THEN** solo puede subir en su propia carpeta (`{userId}/...`)
