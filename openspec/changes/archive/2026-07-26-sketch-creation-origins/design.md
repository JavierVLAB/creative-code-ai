## Decisión: un solo change, no dos

Se evaluó separar "flujo de creación con 3 orígenes" (infraestructura) de "nuevas plantillas" (contenido). Se descarta la separación: el origen "copiar plantilla" solo tiene sentido de probar/demostrar si hay más de 3 plantillas, y ambas partes se entregan juntas antes del mismo cierre de proyecto. Se mantienen como secciones de tareas separadas dentro del mismo change para poder verificar cada una de forma independiente.

## Decisión: no se crea ninguna tool de agente nueva

`edit_params` (`backend/src/mastra/tools/edit-params.ts`) y `edit_sketch` (`backend/src/mastra/tools/edit-sketch.ts`) validan únicamente la salida que devuelve el LLM (YAML parseable; `sketch.js` contiene `params` y `addEventListener`). No exigen que el `sketchJs`/`configYaml` de entrada sea ya válido o no-trivial. El árbol de decisión del agente (`agent-behavior` spec, "Cambio visual sin parámetro (nueva forma, animación, lógica) → edit_sketch (solo)") ya cubre "construir un sketch nuevo a partir de una instrucción" siempre que reciba un punto de partida razonable.

Por tanto, "pedirle al agente que lo haga desde cero" se resuelve con:
1. Un boilerplate en blanco válido como `sketch_js`/`config_yaml` inicial (para que el workspace no aterrice roto).
2. Reenviar la descripción del usuario como primer mensaje de chat tras crear el proyecto.

No hace falta un modo especial de "generación inicial" distinto de una edición normal.

## Boilerplate en blanco

Nuevo módulo `front/src/lib/blankSketch.ts`:

```typescript
export const BLANK_CONFIG_YAML = `name: nuevo-sketch

modules:
  canvas:
    width: 600
    height: 600
`

export const BLANK_SKETCH_JS = `// Sketch vacío — listo para empezar desde cero o pedirle cambios al agente.
let params = {}

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function draw() {
  background(20)
}

window.addEventListener('message', function(event) {
  const msg = event.data
  if (msg.type === 'SKETCH_INIT' || msg.type === 'SKETCH_RESTART') {
    if (msg.values) Object.assign(params, msg.values)
    if (msg.config?.modules?.canvas) {
      resizeCanvas(msg.config.modules.canvas.width ?? width, msg.config.modules.canvas.height ?? height)
    }
    redraw()
    return
  }
  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    redraw()
    return
  }
})
`
```

Cumple `sketch-contract` al pie de la letra (canvas primero, `params` presente, listener obligatorio, emite `SKETCH_READY`). `edit_sketch`/`edit_params` lo aceptan sin fricción como entrada.

## `useProjects.createProject` — nueva firma

```typescript
type ProjectOrigin =
  | { type: 'blank' }
  | { type: 'template'; templateId: string }

async function createProject(name: string, origin: ProjectOrigin = { type: 'blank' }): Promise<Project | null>
```

- `origin: 'blank'` → inserta con `sketch_js: BLANK_SKETCH_JS, config_yaml: BLANK_CONFIG_YAML`.
- `origin: 'template'` → primero resuelve la plantilla (ya cargada en memoria desde `usePublishedTemplates`, no hace falta round-trip extra) y copia `sketch_js`/`config_yaml` de la plantilla en el insert.
- El origen "IA" **no** es un tercer valor de `ProjectOrigin` — es siempre `{ type: 'blank' }` a nivel de datos; la diferencia es puramente de UI (ver abajo), porque el punto de partida en base de datos es el mismo boilerplate en blanco.

## `CreateProjectDialog` — rediseño

**Un único modal, sin pasos ni wizard.** Todo el formulario vive en la misma vista; según el origen elegido, aparece o desaparece una sección inline debajo, pero no hay navegación entre pantallas ni botones de "siguiente/atrás".

Orden dentro del modal:

1. **Input de nombre** (arriba, como hoy).
2. **Selector de origen**, debajo del nombre — 3 opciones (radio/chips, no cards grandes):
   - "Empezar en blanco"
   - "Que me ayude la IA"
   - "Desde una plantilla"
3. **Sección condicional**, inline, según la opción marcada en (2):
   - Blanco: no añade nada más.
   - IA: aparece un textarea "Describe el sketch que quieres" (placeholder: "ej. círculos concéntricos que pulsan con el tiempo").
   - Plantilla: aparece una **lista simple** de las plantillas publicadas (título por fila, sin miniaturas — reutiliza `usePublishedTemplates`, sin necesidad de un componente visual nuevo tipo grid).
4. Un único botón "Crear" al fondo, que envía todo junto (nombre + origen + lo que corresponda).

```typescript
interface CreateProjectDialogProps {
  onConfirm: (name: string, origin: ProjectOrigin, initialPrompt?: string) => void
  onCancel: () => void
}
```

`initialPrompt` solo se usa cuando el origen elegido en UI es "IA" (a nivel de dato sigue siendo `{ type: 'blank' }`). El botón "Crear" se deshabilita si falta el nombre, o si el origen es "plantilla" y no hay ninguna seleccionada.

### Por qué no un mini-chat dentro del modal

La memoria del agente es por proyecto (`threadId = project.id`), así que no puede haber conversación con el agente antes de que el proyecto exista. El modal solo recoge una descripción inicial (un campo de texto); la conversación real empieza en el chat del workspace, reutilizando el flujo normal de `handleChatSend` — no se duplica el chat dentro del modal.

## Flujo de creación → navegación → primer mensaje automático

En `ProjectsPage.tsx`, `handleCreate` pasa a:

```typescript
async function handleCreate(name: string, origin: ProjectOrigin, initialPrompt?: string) {
  const project = await createProject(name, origin)
  setShowCreate(false)
  if (!project) return
  navigate(`/app/projects/${project.id}`, initialPrompt ? { state: { initialPrompt } } : undefined)
}
```

En `WorkspacePage.tsx`, al montar, si `location.state?.initialPrompt` existe, se llama a `handleChatSend(initialPrompt)` una vez que `project` ya cargó (mismo patrón que el `useEffect` de carga existente) y se limpia el state de navegación para que un refresh no reenvíe el mensaje.

## Plantillas nuevas (contenido)

Se añaden como INSERTs en una migración de contenido (mismo patrón que `supabase/migrations/20260702120000_add_public_templates.sql`, `on conflict do update` por `slug`). Criterios:
- Todas en `p5js`. **Gap descubierto durante la implementación**: `buildSrcdoc` en `front/src/components/workspace/SketchViewer.tsx` inyecta siempre el `<script>` CDN de p5.js y nunca el de three.js — aunque `sketch-contract` documenta la detección de renderer por contenido (`THREE` → `threejs`), en la práctica un sketch three.js hoy se quedaría en blanco (`THREE` no definido). Añadir soporte real de three.js queda fuera de este change (decisión explícita de Javi, para no ampliar alcance justo antes del cierre de la entrega). Queda como deuda técnica conocida, no como algo que este change rompa.
- Variedad de técnica/tags para que el selector de plantillas no luzca repetitivo.
- Cada plantilla nueva sigue `sketch-contract` estrictamente (se valida a mano contra las reglas del contrato, igual que las 3 existentes).

## Specs afectadas

- **Modificada**: `openspec/specs/project-library/spec.md` — nuevo requirement sobre elegir origen al crear.
- **Modificada**: `openspec/specs/template-library/spec.md` — nuevo requirement sobre reutilización de plantillas en la creación de proyectos autenticados (hasta ahora solo hablaba del playground público).
