## Why

Hoy, "crear un proyecto nuevo" solo hace `insert({ name, user_id })` en `projects` (`front/src/hooks/useProjects.ts`). `sketch_js` y `config_yaml` quedan en `null`, y el `WorkspacePage` los carga como cadena vacía (`project.sketch_js ?? ''`). El usuario aterriza en un workspace sin canvas, sin controles y sin ningún punto de partida — tiene que escribir código a mano en el editor o improvisar con el chat sin saber si el agente puede arrancar de cero de forma fiable.

Al mismo tiempo, ya existe una tabla `templates` (usada hoy solo por el playground público efímero, `front/src/pages/PlaygroundPage.tsx`) con 3 plantillas publicadas. Esa infraestructura está completamente desconectada del flujo de creación de proyectos de un usuario autenticado — el propio spec `template-library` ya anticipaba esto como "futuros flujos de creación desde plantilla".

Para la entrega final del proyecto se necesita que crear un sketch nuevo ofrezca claramente sus tres caminos naturales: empezar en blanco, pedírselo al agente, o partir de una plantilla existente — y que la biblioteca de plantillas tenga más variedad que las 3 actuales para que esa tercera vía tenga sentido.

## What Changes

- **Origen "en blanco" corregido**: un proyecto nuevo arranca con un `sketch.js`/`config.yaml` mínimos y válidos (cumplen `sketch-contract`: canvas, `params`, listener `postMessage`, emite `SKETCH_READY`) en vez de cadenas vacías. Esto es la base necesaria para que el workspace no aterrice roto y para que el agente pueda editarlo desde el primer turno.
- **Origen "pedírselo al agente"**: el mismo modal de creación (sin pasos ni pantallas separadas) muestra, al marcar esta opción, un campo de texto para describir el sketch deseado. Al crear el proyecto (con el boilerplate en blanco de base), la app navega al workspace y envía automáticamente esa descripción como primer mensaje del chat, reutilizando el flujo de `edit_params`/`edit_sketch` ya existente — sin tools nuevas en el backend.
- **Origen "copiar plantilla"**: el mismo modal muestra, al marcar esta opción, una lista simple (sin miniaturas) de las plantillas publicadas (reutilizando `templates` y `usePublishedTemplates`). Al crear, el proyecto se inicializa con el `sketch_js`/`config_yaml` de la plantilla elegida.
- **Más contenido de plantillas**: se añaden varias plantillas nuevas publicadas a la tabla `templates` (contenido, no infraestructura), con variedad de técnicas y renderer (incluye al menos una en three.js, hoy las 3 existentes son todas p5.js), para que el playground y el nuevo selector de plantillas tengan una biblioteca real donde elegir.

## Capabilities

### Modified Capabilities
- `project-library`: la creación de proyecto pasa a soportar tres orígenes (blanco / IA / plantilla) en vez de solo un nombre.
- `template-library`: las plantillas publicadas se vuelven reutilizables también desde el flujo de creación de proyectos de usuario autenticado, no solo desde el playground público.

## Impact

- **Frontend**: `CreateProjectDialog` rediseñado con selector de origen; nuevo hook/lógica en `useProjects.createProject` para aceptar el origen elegido; `WorkspacePage` recibe y envía el prompt inicial pendiente tras la navegación.
- **Backend**: ninguno — no se añaden tools ni endpoints nuevos. `edit_params`/`edit_sketch` ya validan solo la salida del LLM, no exigen que el sketch de entrada sea no-trivial.
- **Base de datos**: sin migraciones de esquema. Solo contenido nuevo (INSERTs) en `templates`.
- **Contenido**: nuevo boilerplate mínimo válido en `front/src/lib/` (o `shared/`) para el origen en blanco; nuevos sketches de plantilla (varios, ver `tasks.md`).
