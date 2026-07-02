## 1. Datos de plantillas

- [x] 1.1 Revisar el schema actual de Supabase y definir la tabla `templates` con campos minimos: `id`, `slug`, `title`, `description`, `sketch_js`, `config_yaml`, `renderer`, `thumbnail_url`, `tags`, `is_published`, `created_at`, `updated_at`.
- [x] 1.2 Crear migracion SQL para `templates` con RLS habilitado, lectura publica solo de filas publicadas y sin escrituras anonimas.
- [x] 1.3 Importar como seed inicial los sketches del proyecto antiguo: `demo`, `bezier-noise` y `particulas`.
- [x] 1.4 Validar que los tres `config.yaml` importados parsean correctamente y que sus `sketch.js` siguen el contrato `window.__SKETCH__` + `postMessage`.

## 2. Acceso a plantillas en frontend

- [x] 2.1 Añadir tipos TypeScript para `Template` y helpers de mapeo desde Supabase.
- [x] 2.2 Crear hook o modulo de lectura de plantillas publicadas desde Supabase.
- [x] 2.3 Cubrir el listado de plantillas con tests unitarios o de integracion ligera, incluyendo estado vacio y error de carga.

## 3. Workspace efimero

- [x] 3.1 Separar en el workspace el modo persistente de proyecto y el modo efimero de plantilla.
- [x] 3.2 Reutilizar visor, parser de `config.yaml` y controles visuales en modo efimero.
- [x] 3.3 Garantizar que en modo efimero los cambios de controles actualizan solo estado local e iframe.
- [x] 3.4 Deshabilitar snapshots, memoria, guardado de proyecto y acciones del agente en modo efimero.

## 4. Ruta publica `/playground`

- [x] 4.1 Añadir `/playground` al router fuera de `ProtectedRoute`.
- [x] 4.2 Crear la pagina publica con listado de plantillas publicadas.
- [x] 4.3 Permitir seleccionar una plantilla y abrirla en el workspace efimero.
- [x] 4.4 Mostrar texto/estado claro de que el playground no guarda cambios.
- [x] 4.5 Mostrar IA deshabilitada y CTA hacia login/registro para guardar un proyecto propio.

## 5. Verificacion

- [x] 5.1 Verificar que un visitante sin sesion puede abrir `/playground` y no es redirigido a `/login`.
- [x] 5.2 Verificar que `/app` sigue protegido para visitantes sin sesion.
- [x] 5.3 Verificar que mover controles en las tres plantillas actualiza el sketch.
- [x] 5.4 Verificar que recargar la pagina restaura los valores originales de la plantilla.
- [x] 5.5 Verificar que el playground no escribe en `projects`, `snapshots`, `assets`, `memory` ni `updated_at`.
- [x] 5.6 Ejecutar validacion OpenSpec de `template-library`, `public-playground`, `auth-flow` y `sketch-workspace`.
