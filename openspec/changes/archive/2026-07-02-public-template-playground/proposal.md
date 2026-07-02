## Why

CurateArtAI necesita una forma publica de probar ejemplos sin obligar a crear cuenta antes de entender el valor del producto. El playground tambien prepara la base de una biblioteca de plantillas reutilizable: los visitantes prueban ejemplos en modo efimero y los usuarios registrados podran iniciar proyectos reales desde esas mismas plantillas.

## What Changes

- Crear una capacidad de playground publico accesible sin login.
- Introducir una biblioteca de plantillas publicadas con `sketch_js`, `config_yaml`, metadatos y estado de publicacion.
- Importar como plantillas iniciales los sketches del proyecto antiguo `curateartai/app/public`: `demo`, `bezier-noise` y `particulas`.
- Permitir abrir una plantilla en un workspace efimero que reutiliza el visor y los controles actuales.
- Mantener todas las modificaciones del visitante en estado local: no se escriben proyectos, snapshots, memoria ni timestamps de usuario.
- Mostrar la IA deshabilitada en el playground publico y dejar la demo con IA por token fuera de este change.
- Mostrar una llamada a crear cuenta/iniciar sesion para guardar un proyecto propio desde una plantilla en una historia posterior.

## Capabilities

### New Capabilities

- `template-library`: Define las plantillas publicadas que sirven como ejemplos publicos y semillas para futuros proyectos.
- `public-playground`: Define la experiencia publica sin login para abrir plantillas en modo efimero y sin IA.

### Modified Capabilities

- `auth-flow`: Permitir una ruta publica `/playground` fuera de `ProtectedRoute`, manteniendo protegidas las rutas de usuario en `/app`.
- `sketch-workspace`: Permitir que el workspace opere sobre un sketch efimero no asociado a `projects` y sin persistencia Supabase.

## Impact

- Frontend: rutas publicas, listado de plantillas, modo playground del workspace, estado efimero, UI de IA deshabilitada y CTA de cuenta.
- Supabase: nueva tabla o fuente de datos para plantillas publicadas, con lectura publica controlada y escritura administrativa fuera del frontend publico.
- Datos iniciales: migracion o seed con las tres plantillas importadas desde el proyecto antiguo.
- Backend/Agente: sin cambios funcionales en este change; la IA por token queda para una propuesta futura.
- Tests: cobertura para lectura/listado de plantillas, ruta publica, no persistencia del playground y carga de los sketches importados.
