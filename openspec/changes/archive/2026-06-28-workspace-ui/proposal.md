## Why

El `WorkspacePage` actual usa un layout de dos columnas fijas (canvas | panel derecho) con borde entre ellos. El proyecto de referencia (`curateartai/app`) tiene una experiencia radicalmente distinta: el canvas ocupa todo el viewport como fondo, y los paneles flotan sobre él como tarjetas con sombra y border-radius. Además, el original tiene un explorador de archivos, un editor de código y un panel de snapshots que no se han portado.

El resultado es que la app nueva tiene la arquitectura correcta (Supabase, Mastra, auth) pero el workspace no se parece ni funciona como el producto real.

## What Changes

- **Layout del workspace**: canvas como backdrop completo, `Sidebar` flotante a la derecha (con padding y box-shadow), `FileExplorerPanel` flotante sobre el canvas (position: absolute, top-right), `EditorPanel` entre canvas y sidebar cuando hay un archivo activo
- **Sidebar**: toggle colapsable (círculo con hamburguesa cuando cerrado, tarjeta completa cuando abierto), contiene `ParamsControls`, `SnapshotsPanel` y `ChatPanel`
- **FileExplorerPanel**: muestra los archivos del proyecto (`sketch.js`, `config.yaml`) con toggle, sin File System Access API (los archivos vienen del estado de Supabase)
- **EditorPanel**: CodeMirror 6 con soporte JS y YAML; los cambios se guardan en Supabase (`projects.sketch_js` / `projects.config_yaml`)
- **ParamsControls**: sliders y selects generados desde `config.yaml`, incluyendo `CanvasModule` para width/height
- **SnapshotsPanel**: guardar y cargar combinaciones de parámetros, persistidos en Supabase (`snapshots` table)
- **ChatPanel**: UI completa (historial, input, spinner) pero envío deshabilitado — la conexión real al agente la hace el change `frontend-agent`
- **MemoryProposalCard**: tarjeta de aprobación de propuesta de memoria (aparece cuando el agente sugiere actualizar `project_memory`)
- **DevPanel**: panel de transparencia del orquestador, solo visible en modo desarrollo

## Capabilities

### New Capabilities

- `workspace-layout`: Canvas como fondo completo con paneles flotantes; experiencia de herramienta creativa en vez de web app genérica
- `file-explorer-panel`: Panel flotante que muestra `sketch.js` y `config.yaml` del proyecto activo; permite abrir en editor
- `editor-panel`: Editor CodeMirror 6 para editar `sketch.js` (JS) y `config.yaml` (YAML) con guardado en Supabase
- `snapshots-panel`: Guardar y restaurar combinaciones de parámetros del proyecto en Supabase

### Modified Capabilities

- `sketch-workspace`: El layout entero del workspace se reestructura; `SketchViewer` y los controles básicos existentes se integran en el nuevo layout
- `parameter-controls`: Los `ControlSlider` y `ControlSelect` existentes se agrupan en `ParamsControls` con `CanvasModule`; se añade persistencia a Supabase al cambiar el canvas
- `agent-chat`: La UI del chat (historial + input) se implementa completa; el envío queda deshabilitado hasta `frontend-agent`

## Impact

- **Archivos nuevos**: `front/src/components/workspace/Sidebar.tsx`, `front/src/components/workspace/FileExplorerPanel.tsx`, `front/src/components/workspace/EditorPanel.tsx`, `front/src/components/workspace/ParamsControls.tsx`, `front/src/components/workspace/CanvasModule.tsx`, `front/src/components/workspace/SnapshotsPanel.tsx`, `front/src/components/workspace/ChatPanel.tsx`, `front/src/components/workspace/ChatMessage.tsx`, `front/src/components/workspace/MemoryProposalCard.tsx`, `front/src/components/workspace/DevPanel.tsx`
- **Modificados**: `front/src/pages/WorkspacePage.tsx` (layout completo), `front/src/hooks/useSketch.ts` (adaptar si hace falta), `front/src/lib/types.ts` (añadir tipos de snapshot, mensaje de chat)
- **Eliminados**: `front/src/components/workspace/ChatPlaceholder.tsx`, `front/src/components/workspace/ControlPanel.tsx` (reemplazado por `ParamsControls`)
- **Dependencias nuevas**: ninguna nueva — CodeMirror 6 ya está en el proyecto; `js-yaml` ya está; `@codemirror/lang-javascript` y `@codemirror/lang-yaml` pueden estar, verificar
- **No se toca**: páginas de auth y biblioteca, `SketchViewer.tsx`, `ControlSlider.tsx`, `ControlSelect.tsx`, backend, Supabase schema
