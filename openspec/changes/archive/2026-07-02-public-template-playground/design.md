## Context

El README ya recoge H7 y Ticket 5: un playground publico de plantillas sin IA. El producto actual separa rutas autenticadas (`/app`) de login/signup y el workspace trabaja sobre filas `projects`, guardando cambios de agente y editor en Supabase.

El proyecto antiguo localizado en `/Users/javiervillarroel/Documents/Proyectos/curateartai/app/public` contiene tres sketches compatibles con el contrato actual (`config.yaml` + `sketch.js` con `window.__SKETCH__` y `postMessage`):

- `demo`: "Circulo con lineas"
- `bezier-noise`: "Espiral Bezier"
- `particulas`: "Particulas conectadas"

Estos tres sketches seran las plantillas iniciales del playground.

## Goals / Non-Goals

**Goals:**

- Crear una biblioteca de plantillas publicadas legible desde una ruta publica.
- Importar los tres sketches del proyecto antiguo como datos iniciales.
- Exponer `/playground` sin login.
- Reutilizar el visor y los controles del workspace actual en modo efimero.
- Garantizar que el playground no escribe en `projects`, `snapshots`, `assets`, `memory` ni `updated_at`.
- Mostrar la IA deshabilitada en el playground publico.

**Non-Goals:**

- No habilitar IA en playground.
- No implementar tokens de demo invitada.
- No crear un panel administrativo de plantillas.
- No implementar todavia "crear proyecto desde plantilla" para usuarios registrados, aunque el modelo debe dejarlo viable.
- No cambiar el contrato del sketch.

## Decisions

### Decision 1: Plantillas como entidad separada de proyectos

Crear una entidad `templates` separada de `projects`. Las plantillas son ejemplos publicados y curados; los proyectos siguen siendo trabajo privado de usuarios.

Alternativa considerada: usar una cuenta demo con proyectos reales. Se descarta porque mezcla sesiones, permisos, historial y riesgo de escritura accidental sobre los ejemplos.

### Decision 2: Lectura publica controlada

Las plantillas publicadas (`is_published = true`) podran leerse sin sesion desde el frontend con la clave publica de Supabase. La escritura de plantillas no forma parte de la UI publica; los inserts/seeds se gestionan por migracion o proceso administrativo.

Alternativa considerada: servir plantillas solo como archivos estaticos. Es mas simple para MVP, pero dificulta que luego las mismas plantillas alimenten busqueda, etiquetas, thumbnails y creacion de proyectos reales.

### Decision 3: Workspace efimero por estado local

El playground cargara `sketch_js` y `config_yaml` de la plantilla en estado local. Los controles modifican `values` y envian `SKETCH_UPDATE`; si en el futuro hay editor publico, sus cambios tambien quedaran locales.

Alternativa considerada: crear proyectos temporales en Supabase. Se descarta porque contradice el objetivo de no persistencia y complica limpieza, RLS y costes.

### Decision 4: Reutilizar piezas del workspace sin activar persistencia

El visor, parser de config y controles deben reutilizarse. La pagina de playground debe pasar callbacks no persistentes o un modo explicito que impida llamar a los hooks de proyecto, snapshots o agente.

Alternativa considerada: duplicar un workspace simplificado. Se descarta porque duplicaria contrato de sketch, parser y comportamiento de controles.

### Decision 5: IA visible pero deshabilitada

El playground publico mostrara el espacio de IA como deshabilitado o sustituido por una CTA. Esto comunica la direccion futura sin abrir todavia coste, abuso o aislamiento de threads.

Alternativa considerada: ocultar completamente la IA. Es mas simple, pero pierde parte del posicionamiento del producto y no prepara la demo invitada con token.

## Risks / Trade-offs

- [Risk] Lectura publica de plantillas expone codigo de sketches publicados. -> Mitigacion: solo publicar sketches curados, sin secretos ni assets privados.
- [Risk] Un modo workspace compartido puede persistir por accidente si reutiliza hooks actuales. -> Mitigacion: separar explicitamente `persisted project mode` de `ephemeral template mode` y probar que no llama a updates/inserts.
- [Risk] Las plantillas antiguas pueden divergir del contrato actual. -> Mitigacion: validar `config.yaml`, `renderer` y protocolo `SKETCH_READY`/`SKETCH_UPDATE` al importarlas.
- [Risk] Thumbnails pueden no existir en el proyecto antiguo. -> Mitigacion: permitir `thumbnail_url` nulo inicialmente o generar thumbnails en una tarea separada dentro del mismo change si el runtime lo permite.
- [Risk] La ruta publica podria confundirse con el workspace autenticado. -> Mitigacion: UI y copy claros: "Playground", "no se guarda", "crea cuenta para guardar".

## Migration Plan

1. Crear migracion para `templates` con RLS y politica de lectura publica solo para `is_published = true`.
2. Seed/importar las tres plantillas iniciales desde el proyecto antiguo.
3. Implementar el listado publico `/playground`.
4. Implementar apertura de plantilla en modo efimero reutilizando visor y controles.
5. Deshabilitar IA y snapshots en este modo.
6. Validar que recargar restaura la plantilla original y que no hay escrituras en tablas de usuario.

Rollback: despublicar plantillas (`is_published = false`) o retirar la ruta `/playground`. La tabla `templates` no afecta a proyectos existentes.

## Open Questions

- Confirmar si las plantillas se gestionaran inicialmente solo por migraciones/seeds o si Javi quiere un flujo manual posterior.
- Confirmar si `thumbnail_url` queda vacio en MVP o si generamos capturas durante la implementacion.
