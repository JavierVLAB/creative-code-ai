## Architecture Decision: Preview persistido en Storage, grid client-side

El preview del snapshot se guarda como imagen en Supabase Storage al momento de guardar. El grid de visualización es completamente client-side — renderiza las miniaturas desde las URLs de Storage sin necesidad de backend adicional.

## Data Model

### Migración: columna `preview_url` en `snapshots`

```sql
ALTER TABLE snapshots ADD COLUMN preview_url text;
```

Columna nullable — los snapshots existentes no tienen preview. El grid los muestra sin miniatura hasta que se vuelvan a guardar.

### Bucket de Storage: `snapshot-previews`

- **Bucket:** `snapshot-previews` (privado, accesible solo vía URL firmada o pública según configuración)
- **Ruta del objeto:** `{user_id}/{project_id}/{snapshot_id}.png`
- **RLS del bucket:** el usuario solo puede subir/borrar en su propia carpeta

### Tipo `Snapshot` en `shared/types.ts`

```typescript
interface Snapshot {
  id: string
  projectId: string
  label: string
  values: ParamValues
  previewUrl?: string   // ← nueva campo
  createdAt: string
}
```

## Componentes

### 1. `CanvasTabs` (nuevo componente)

Tabs flotantes en la esquina superior izquierda del canvas. Dos botones con iconos:

- **Icono grid** (4 cuadros): activa modo grid
- **Icono lapiz**: activa modo sketch

Estilo: fondo `var(--bg2)`, borde `var(--line)`, border-radius `var(--radius-sm)`, sombra `var(--shadow-sm)`. El tab activo tiene fondo `var(--bg3)` y color `var(--t1)`. Los tabs inactivos tienen color `var(--t3)`.

Posicionamiento: `position: absolute`, `top: var(--space-3)`, `left: var(--space-3)`, `z-index: 10`.

### 2. `SnapshotGrid` (nuevo componente)

Grid de miniaturas que reemplaza al iframe del sketch en modo grid.

**Props:**
```typescript
interface SnapshotGridProps {
  snapshots: Snapshot[]
  selectedIds: Set<string>
  onSelect: (id: string, multi: boolean) => void
  onLoad: (snapshot: Snapshot) => void
  onToggleFavorite: (id: string) => void
  onDelete: (ids: string[]) => void
}
```

**Layout:**
- Grid responsive: 2 columnas en el ancho mínimo del canvas, 3-4 columnas en anchos mayores
- Gap: `var(--space-3)`
- Padding: `var(--space-4)`
- Scroll vertical si el contenido excede el área

**Cada miniatura (card):**
- Aspect-ratio 1:1 con `object-fit: cover` para la imagen
- Fondo `var(--bg2)`, borde `var(--line)`, border-radius `var(--radius-md)`
- **Checkbox:** posicionado en la esquina superior izquierda, fondo `var(--bg0)` con borde, tamaño 18px
- **Label:** debajo de la imagen, texto `var(--font-size-xs)` color `var(--t2)`, truncado con ellipsis
- **Hover:** el borde cambia a `var(--t3)`, aparecen las acciones
- **Acciones (hover):** contenedor en la esquina superior derecha con fondo `var(--bg0)` translúcido
  - Estrella (favorita): icono star, color `var(--t3)` → `#fbbf24` cuando está activa
  - Papelera (borrar): icono trash, color `var(--t3)` → `var(--color-error)` en hover
- **Sin preview:** si `previewUrl` es null, mostrar un placeholder con icono de imagen y el label del snapshot

### 3. `BulkActionBar` (nuevo componente)

Barra que aparece cuando hay snapshots seleccionados. Se muestra como un banner fijo en la parte superior del grid.

**Props:**
```typescript
interface BulkActionBarProps {
  count: number
  onClearSelection: () => void
  onBulkDelete: () => void
  onBulkFavorite: () => void
}
```

**Estilo:** fondo `var(--bg2)`, borde inferior `var(--line)`, padding `var(--space-2) var(--space-4)`. Texto: "{N} seleccionados" a la izquierda, botones de acción a la derecha.

**Botones:** mismo estilo que los botones existentes del proyecto (ver `SnapshotsPanel`).

### 4. `ConfirmDialog` (nuevo componente)

Diálogo de confirmación para borrado. Overlay oscuro (`var(--overlay-bg)`) con card centrada.

**Props:**
```typescript
interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}
```

**Estilo:** card con fondo `var(--bg1)`, borde `var(--line)`, border-radius `var(--radius-lg)`, sombra `var(--shadow-md)`. Dos botones: "Cancelar" (estilo secundario) y "Borrar" (color `var(--color-error)`).

## Integración con el Workspace

### Modos del canvas

El `SketchViewer` recibe un prop `mode: 'sketch' | 'grid'`. En modo sketch se comporta como ahora. En modo grid se oculta el iframe y se renderiza `SnapshotGrid`.

`WorkspacePage` gestiona el estado `canvasMode` y lo pasa al `SketchViewer` y al `CanvasTabs`.

### Captura del preview al guardar snapshot

Cuando el usuario guarda un snapshot:

1. Acceder al iframe del sketch vía `iframeRef.current.contentWindow`
2. Encontrar el elemento `<canvas>` dentro del iframe
3. Llamar `canvas.toDataURL('image/png')`
4. Convertir el data URL a Blob
5. Subir a Supabase Storage en la ruta `{userId}/{projectId}/{snapshotId}.png`
6. Obtener la URL pública
7. Guardar el snapshot con `preview_url` en la tabla `snapshots`

Si la captura falla (canvas no disponible, error de Storage), el snapshot se guarda igual sin preview — la columna es nullable.

### Flujo de curación

1. El usuario guarda varios snapshots a lo largo de una sesión de exploración
2. Hace click en el tab de grid → el canvas cambia a la vista de miniaturas
3. Ve todas sus snapshots con previews visuales
4. Marca favoritas con la estrella (se guarda como snapshot existente con label actualizado o campo `is_favorite` futuro)
5. Borra las que no le gustan (confirmación antes de borrar)
6. Hace click en una miniatura → carga esos valores en el workspace y vuelve al modo sketch

## Spec que se crea

- **Nueva:** `openspec/specs/snapshot-grid-curation/spec.md` — define los requirements del grid, la captura de previews y las acciones de curación.
- **Modificada:** `openspec/specs/sketch-workspace/spec.md` — se anade el requirement del toggle sketch/grid.
