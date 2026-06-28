## Context

El proyecto de referencia (`curateartai/app`) es una app funcional monolítica con la UI completa. La misión de este change es portar esa UI al nuevo proyecto manteniendo la arquitectura refactorizada (Supabase para datos, multi-página con auth). El código del original se puede copiar y adaptar libremente.

## Goals / Non-Goals

**Goals:**
- Reproducir el layout flotante del original exactamente
- Portar todos los componentes UI del workspace
- Adaptar la persistencia de File System API → Supabase
- Chat UI completa pero desconectada del backend (stub)

**Non-Goals:**
- Conectar el chat al backend Mastra (eso es `frontend-agent`)
- Generar sketch desde descripción / `NewSketchModal` (requiere agente conectado)
- Panel de settings de IA (proveedor, modelo, API key) — el backend gestiona el LLM, no el cliente
- Carga de ejemplos estáticos desde `public/examples/` (la biblioteca es Supabase)

## Decisions

### 1. Layout: canvas como backdrop, paneles flotantes con `position: absolute`

El workspace es `position: relative; width: 100%; height: 100%`. El `SketchViewer` ocupa el 100% como fondo. Encima:
- `FileExplorerPanel`: `position: absolute; top: 12px; right: 12px; bottom: 12px; zIndex: 10; pointerEvents: none` (el panel interno tiene `pointerEvents: auto`)
- `Sidebar`: fuera del canvas (en un `div` con `padding: 12px` a la derecha del canvas), como en el original — no es `position: absolute` sino una columna flex con padding para el efecto visual flotante

El `EditorPanel` (cuando está abierto) aparece entre el canvas y la sidebar en el flex row.

Esto replica el layout del original exactamente.

### 2. FileExplorerPanel: sin File System Access API

El original usa `FileSystemDirectoryHandle`. En el nuevo, los archivos del proyecto vienen del estado de `WorkspacePage` (`project.sketch_js`, `project.config_yaml`). El panel muestra solo esos dos archivos. El botón "Abrir carpeta" se elimina; en su lugar hay un enlace de navegación a la biblioteca.

Los botones de "Nuevo sketch con IA" y "Descargar ZIP" se mantienen pero se implementan en pasos posteriores (el ZIP desde strings en memoria es trivial; el "Nuevo sketch" requiere el agente).

### 3. EditorPanel: guarda en Supabase en vez de File System API

Cuando el usuario edita `sketch.js` o `config.yaml` en el editor, el cambio se persiste en `projects.sketch_js` / `projects.config_yaml` via `supabase.from('projects').update(...)`. Se usa un debounce de 1.5s para no saturar Supabase en cada keystroke.

El editor recarga el iframe al detectar cambios en `sketch.js` (igual que el original con `handleExecuteSketch`). Cambios en `config.yaml` regeneran los controles.

### 4. SnapshotsPanel: guarda en Supabase `snapshots` table

En el original, los snapshots se guardan como JSON en el File System. En el nuevo se usan `supabase.from('snapshots').insert(...)`. Al montar el workspace, se cargan los snapshots existentes del proyecto. El schema ya existe (`snapshots` con `project_id`, `label`, `values`).

### 5. ChatPanel: UI completa, envío stub

El `ChatPanel` tiene toda la UI (historial, scroll automático, input, spinner). El botón de envío está deshabilitado con un tooltip "Conectando con el agente...". Se define la interfaz `ChatMessage` en `types.ts`. `frontend-agent` solo necesita activar el envío y conectar `useAgent`.

### 6. Copiar y adaptar componentes del original

Estos se copian del original y se adaptan (cambios mínimos de imports, props y tokens CSS):
- `Sidebar.tsx`: quitar prop `aiSettings`/`onAiSettingsChange` (no hay settings de LLM en el cliente), adaptar tipos
- `ParamsControls.tsx` → `front/src/components/workspace/ParamsControls.tsx`
- `CanvasModule.tsx` (extraído de `AiSection.tsx` del original, que mezcla canvas y chat)
- `SnapshotsPanel.tsx`: cambiar `saveSnapshots` (File System) por Supabase insert/select
- `ChatPanel.tsx` y `ChatMessage.tsx`: copiar de `chat/ChatPanel.tsx` y `chat/MessageContent.tsx`
- `MemoryProposalCard.tsx`: copiar de `Sidebar.tsx` (está inlined allí)
- `FileExplorerPanel.tsx`: copiar estructura, eliminar lógica File System, simplificar a lista de 2 archivos
- `EditorPanel.tsx`: copiar, cambiar `onFileChange` para persistir en Supabase

### 7. Tokens CSS: usar los del proyecto nuevo

El proyecto ya tiene tokens CSS en `front/src/index.css` del change `design-system-tokens`. Se usan directamente. Si falta algún token del original (`--sidebar-width`, `--size-icon-btn`, etc.), se añade al archivo de tokens.

## Risks / Trade-offs

- **[Trade-off] FileExplorerPanel simplificado** → Solo muestra `sketch.js` y `config.yaml`. El original muestra el árbol completo del directorio. Aceptable para el MVP; se puede ampliar cuando se añada soporte de assets.

- **[Riesgo] Tokens CSS del original no presentes en el nuevo** → Algunos `--var` del original pueden no existir. Verificar y añadir los que falten en el paso de layout.

- **[Trade-off] Debounce en el editor** → 1.5s de delay antes de guardar en Supabase. El usuario podría cerrar la pestaña antes del save. Aceptable para MVP; se puede añadir un indicador "guardando..." si hace falta.
