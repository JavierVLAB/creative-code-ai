## 1. Base de datos y Storage

- [x] 1.1 Crear migración SQL: `ALTER TABLE snapshots ADD COLUMN preview_url text`
- [x] 1.2 Configurar bucket `snapshot-previews` en Supabase (privado, con políticas de acceso por usuario)
- [x] 1.3 Actualizar tipo `Snapshot` en `shared/types.ts` con campo `previewUrl`
- [x] 1.4 Actualizar tipo `SnapshotRow` en `front/src/lib/database.types` (se regenera o se anota manualmente)

## 2. Captura de preview al guardar snapshot

- [x] 2.1 Crear función `captureSketchPreview(iframeRef): Promise<Blob | null>` en `front/src/lib/sketch-preview.ts`
- [x] 2.2 Implementar acceso al canvas del iframe vía `contentWindow` y llamada a `toDataURL('image/png')`
- [x] 2.3 Crear función `uploadPreview Blob a Supabase Storage en la ruta `{userId}/{projectId}/{snapshotId}.png`
- [x] 2.4 Integrar captura + upload en `handleSnapshotSave` de `WorkspacePage.tsx`
- [x] 2.5 Guardar `preview_url` en la inserción del snapshot (si la captura falla, guardar sin preview)

## 3. Componente `CanvasTabs`

- [x] 3.1 Crear `front/src/components/workspace/CanvasTabs.tsx` con dos tabs (grid / sketch)
- [x] 3.2 Estilizar con tokens del proyecto: fondo `var(--bg2)`, borde, sombra, radius
- [x] 3.3 Posicionar absolute en la esquina superior izquierda del canvas
- [x] 3.4 Recibir prop `activeMode` y callback `onModeChange`

## 4. Componente `SnapshotGrid`

- [x] 4.1 Crear `front/src/components/workspace/SnapshotGrid.tsx` con grid responsive de miniaturas
- [x] 4.2 Implementar card de miniatura: imagen 1:1, label, checkbox en esquina
- [x] 4.3 Implementar hover: borde activo + acciones (estrella, papelera)
- [x] 4.4 Implementar placeholder para snapshots sin preview (icono + label)
- [x] 4.5 Implementar click en miniatura para cargar snapshot
- [x] 4.6 Implementar selección múltiple con checkbox

## 5. Componente `BulkActionBar`

- [x] 5.1 Crear `front/src/components/workspace/BulkActionBar.tsx`
- [x] 5.2 Mostrar contador de seleccionados + botones de acción (borrar, favorita)
- [x] 5.3 Estilizar como banner fijo en la parte superior del grid

## 6. Componente `ConfirmDialog`

- [x] 6.1 Crear `front/src/components/workspace/ConfirmDialog.tsx`
- [x] 6.2 Implementar overlay oscuro + card centrada con título, mensaje y botones
- [x] 6.3 Usar tokens del proyecto para consistencia visual

## 7. Integración en el Workspace

- [x] 7.1 Añadir estado `canvasMode: 'sketch' | 'grid'` en `WorkspacePage.tsx`
- [x] 7.2 Renderizar `CanvasTabs` sobre el canvas en `SketchViewer` o `WorkspaceLayout`
- [x] 7.3 Condicional: modo sketch → iframe normal; modo grid → `SnapshotGrid`
- [x] 7.4 Conectar `SnapshotGrid` con snapshots, selección, favoritas y borrado
- [x] 7.5 Integrar `BulkActionBar` en la vista del grid
- [x] 7.6 Integrar `ConfirmDialog` para borrado individual y bulk
- [x] 7.7 Ocultar `FileExplorerPanel` y `ParamsControls` en modo grid

## 8. Spec

- [x] 8.1 Crear `openspec/specs/snapshot-grid-curation/spec.md` con requirements y scenarios
- [x] 8.2 Actualizar `openspec/specs/sketch-workspace/spec.md` con requirement del toggle sketch/grid

## 9. Tests

- [x] 9.1 Test de `captureSketchPreview`: verifica que captura un Blob válido del canvas
- [x] 9.2 Test de `SnapshotGrid`: renderiza miniaturas, maneja selección y hover
- [x] 9.3 Test de `BulkActionBar`: muestra contador y ejecuta acciones
- [x] 9.4 Test de `ConfirmDialog`: muestra mensaje y ejecuta confirmar/cancelar
