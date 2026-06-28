## 1. Preparación y tipos

- [x] 1.1 Verificar qué tokens CSS del original faltan en `front/src/index.css`: `--sidebar-width`, `--size-icon-btn`, `--padding-section`, `--radius-lg`, `--font-size-title`, `--font-size-xs`, `--font-size-input`. Añadir los que falten — todos ya existen en el design system, nada que añadir
- [x] 1.2 Verificar que `@codemirror/lang-javascript` y `@codemirror/lang-yaml` están en `front/package.json`. Si faltan, notificar a Javi para que ejecute `pnpm add @codemirror/lang-javascript @codemirror/lang-yaml` en `front/` — ambas presentes (+ `js-yaml`, `@uiw/react-codemirror`)
- [x] 1.3 Añadir a `front/src/lib/types.ts` los tipos: `ChatMessage { id, role, content, timestamp }`, `Snapshot { id, projectId, label, values, createdAt }` (si no existen ya) — añadidos `ChatMessage`, `Snapshot`, `ParamValues`. `ChatMessage` sigue el modelo real del prototipo (sin `timestamp`, no usado por la UI)

## 2. Layout del workspace

- [x] 2.1 Reestructurar `front/src/pages/WorkspacePage.tsx`: canvas como `flex:1 position:relative`, columna derecha con `padding: 12px` para el efecto flotante de la sidebar, `EditorPanel` entre canvas y sidebar cuando hay archivo activo
- [x] 2.2 Eliminar `ChatPlaceholder.tsx` y `ControlPanel.tsx` (reemplazados en pasos siguientes) — borrados por Javi
- [x] 2.3 Verificar que el workspace ocupa `height: calc(100vh - var(--topbar-height))` y no tiene scroll horizontal — `overflow: hidden` en el contenedor

## 3. ParamsControls y CanvasModule

- [x] 3.1 Crear `front/src/components/workspace/CanvasModule.tsx` — controles de width/height del canvas con botón "Aplicar"; copiar de `AiSection.tsx` del original (la sección de canvas está inline allí); al aplicar, actualizar `config.yaml` en Supabase — componente "tonto": emite `onApply({width,height})`; la persistencia en config.yaml la hace `WorkspacePage`. Nota: state local no se resincroniza si cambian las props → usar `key` desde el padre al cambiar de proyecto/sketch
- [x] 3.2 Crear `front/src/components/workspace/ParamsControls.tsx` — agrupa `CanvasModule` + controles de parámetros generados desde `config.yaml`; copiar de `curateartai/app/src/components/controls/ParamsControls.tsx` adaptando imports y tokens — adaptado al modelo `Control[]` del nuevo (reutiliza `ControlSlider`/`ControlSelect`, absorbe `ControlPanel`)

## 4. SnapshotsPanel

- [x] 4.1 Crear `front/src/components/workspace/SnapshotsPanel.tsx` — formulario para guardar snapshot con label + lista de snapshots cargables; copiar de `curateartai/app/src/components/modules/SnapshotsPanel.tsx` — componente "tonto" (`{snapshots, onSave, onLoad}`); persistencia en WorkspacePage (4.2-4.4)
- [x] 4.2 En `WorkspacePage`: cargar snapshots del proyecto al montar con `supabase.from('snapshots').select('*').eq('project_id', id).order('created_at')`
- [x] 4.3 Guardar snapshot con `supabase.from('snapshots').insert({ project_id, label, values })` — `user_id` = dueño del proyecto (RLS)
- [x] 4.4 Cargar snapshot: aplicar `values` al estado local y enviar `SKETCH_UPDATE` al iframe (igual que el original)

## 5. ChatPanel (UI sin agente)

- [x] 5.1 Crear `front/src/components/workspace/ChatMessage.tsx` — renderiza un mensaje con rol (usuario/agente) y contenido; copiar de `curateartai/app/src/components/chat/MessageContent.tsx` adaptando tokens — export `ChatMessageItem` (evita colisión con el tipo `ChatMessage`)
- [x] 5.2 Crear `front/src/components/workspace/ChatPanel.tsx` — historial de mensajes, scroll automático al último, input de texto, botón de envío deshabilitado con tooltip "Conectando con el agente..."; copiar de `curateartai/app/src/components/chat/ChatPanel.tsx` adaptando; la prop `onSend` es opcional (si no se pasa, el input queda deshabilitado)
- [x] 5.3 Crear `front/src/components/workspace/MemoryProposalCard.tsx` — tarjeta con texto editable, botones "Añadir" / "Editar" / "Ignorar"; copiar de `Sidebar.tsx` del original (está inlined allí)

## 6. FileExplorerPanel

- [x] 6.1 Crear `front/src/components/workspace/FileExplorerPanel.tsx` — panel flotante (position: absolute en el workspace), toggle con icono de árbol; abierto muestra `sketch.js` y `config.yaml` como ítems clicables; copiar estructura visual de `curateartai/app/src/components/layout/FileExplorerPanel.tsx` eliminando toda la lógica de File System Access API y árbol de carpetas
- [x] 6.2 Al hacer clic en un archivo, se establece `activeFile` en `WorkspacePage` y se abre el `EditorPanel`
- [x] 6.3 Añadir enlace "← Biblioteca" que navega a `/app` (reemplaza el botón "Abrir carpeta" del original) — `navigate('/app')`

## 7. EditorPanel

- [x] 7.1 Crear `front/src/components/workspace/EditorPanel.tsx` — editor CodeMirror 6 con `lang-javascript` para `.js` y `lang-yaml` para `.yaml`; copiar de `curateartai/app/src/components/layout/EditorPanel.tsx` adaptando el guardado — componente "tonto": emite `onChange`, la persistencia con debounce va en `WorkspacePage` (7.2/7.3)
- [x] 7.2 Al cambiar `sketch.js`: debounce 1.5s → `supabase.from('projects').update({ sketch_js: content }).eq('id', projectId)` + reinyectar en iframe — al persistir se actualiza el estado y SketchViewer recarga el iframe
- [x] 7.3 Al cambiar `config.yaml`: debounce 1.5s → `supabase.from('projects').update({ config_yaml: content }).eq('id', projectId)` + regenerar controles con `parseConfig` — SketchViewer re-parsea y regenera controles vía `onControlsReady`

## 8. Sidebar

- [x] 8.1 Crear `front/src/components/workspace/Sidebar.tsx` — tarjeta flotante con toggle (cerrado: círculo hamburguesa; abierto: tarjeta con `border-radius`, `box-shadow`); contiene `ParamsControls`, `SnapshotsPanel`, `ChatPanel`; copiar de `curateartai/app/src/components/layout/Sidebar.tsx` quitando `aiSettings`/`onAiSettingsChange` (no hay settings de LLM en el cliente) y adaptando props — toggle con estado local; props passthrough hacia los hijos
- [x] 8.2 Integrar `MemoryProposalCard` dentro de `Sidebar` (aparece encima del chat cuando hay `memorySuggestion`)

## 9. DevPanel

- [x] 9.1 Crear `front/src/components/workspace/DevPanel.tsx` — panel de transparencia del orquestador (trace de ejecución), solo visible si `import.meta.env.DEV`; copiar de `curateartai/app/src/components/layout/DevPanel.tsx` adaptando tipos de `ExecutionTrace` si hace falta (puede dejarse como `any` por ahora, ya que el trace detallado viene del agente Mastra en `frontend-agent`)

## 10. Integración en WorkspacePage

- [x] 10.1 Conectar todos los componentes en `WorkspacePage.tsx`: `SketchViewer` como backdrop, `FileExplorerPanel` flotando encima, `EditorPanel` condicional, `Sidebar` en columna derecha con padding
- [x] 10.2 Pasar `project.name` al header de la `Sidebar`
- [x] 10.3 Pasar `memorySuggestion`, `onMemoryApprove`, `onMemoryIgnore` a la sidebar (estado local en `WorkspacePage`; la lógica real de guardar es `supabase.from('projects').update({ project_memory: newContent })`) — stub: `memorySuggestion` siempre null por ahora; la columna real es `memory` (no `project_memory`), la conexión real va en `frontend-agent`
- [x] 10.4 Asegurarse de que cuando el agente devuelva cambios (futuro `frontend-agent`), la `Sidebar` tenga las props preparadas para recibirlos (`onChatSend` tipada pero apuntando a un stub por ahora) — `onChatSend` opcional; omitido por ahora → chat deshabilitado

## 11. Tests y verificación

- [x] 11.1 Verificar visualmente: abrir un proyecto → ver sketch como fondo, sidebar flotante a la derecha, explorador flotante en esquina superior derecha — validado por Javi
- [x] 11.2 Verificar controles: mover un slider → sketch actualiza en tiempo real — validado
- [x] 11.3 Verificar editor: abrir `sketch.js`, editar una línea → iframe recarga; abrir `config.yaml`, editar un default → controles se regeneran — validado
- [x] 11.4 Verificar snapshots: guardar un snapshot con nombre → aparece en la lista; hacer clic en uno → los sliders vuelven a esos valores y el sketch actualiza — validado
- [x] 11.5 Verificar collapse: cerrar sidebar → aparece círculo con hamburguesa; abrirlo de nuevo → tarjeta completa — validado
- [x] 11.6 Ejecutar `pnpm typecheck` en `front/` sin errores — `tsc -b --noEmit` limpio (no hay script `typecheck`; el chequeo es `tsc -b`)
- [x] 11.7 Ejecutar `pnpm lint` en `front/` sin errores — limpio; tests 10/10 pasan
