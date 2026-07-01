## MODIFIED Requirements

### Requirement: El workspace aplica los cambios del agente al sketch
El workspace SHALL reaccionar a la respuesta del agente actualizando las columnas del proyecto en Supabase y refrescando el iframe y los controles según qué cambió.

- Solo `appliedSketchJs` → reinyectar `srcdoc` (iframe se reinicia con el código nuevo)
- Solo `appliedConfigYaml` → guardar config en `projects.config_yaml`, regenerar controles, enviar `SKETCH_RESTART` al iframe
- Ambos → guardar ambos en `projects.sketch_js` / `projects.config_yaml`, reinyectar `srcdoc`, luego enviar `SKETCH_INIT` con la nueva config

#### Scenario: Agente modifica solo el código
- **WHEN** la respuesta del agente incluye `appliedSketchJs` pero no `appliedConfigYaml`
- **THEN** el workspace guarda el código en `projects.sketch_js`
- **THEN** reinyecta el iframe con el nuevo `srcdoc` y envía `SKETCH_INIT` con la config actual

#### Scenario: Agente modifica solo la configuración
- **WHEN** la respuesta incluye `appliedConfigYaml` pero no `appliedSketchJs`
- **THEN** el workspace valida el YAML y lo guarda en `projects.config_yaml`
- **THEN** regenera los controles visuales desde el nuevo config
- **THEN** envía `SKETCH_RESTART` al iframe con la nueva config y los valores actuales

#### Scenario: Agente modifica ambos
- **WHEN** la respuesta incluye tanto `appliedConfigYaml` como `appliedSketchJs`
- **THEN** el workspace guarda ambos valores en `projects.sketch_js` y `projects.config_yaml`
- **THEN** reinyecta el iframe con el nuevo código y envía `SKETCH_INIT` con la nueva config

#### Scenario: Agente no modifica el sketch
- **WHEN** la respuesta solo incluye `response` (respuesta conversacional)
- **THEN** el workspace no modifica el iframe ni los controles

#### Scenario: Agente devuelve configuración inválida
- **WHEN** la respuesta incluye `appliedConfigYaml` que no se puede parsear
- **THEN** el workspace muestra un error en el chat
- **THEN** no persiste `config_yaml` ni aplica cambios parciales al iframe

### Requirement: El workspace actualiza `updated_at` del proyecto tras cambios del agente
Cuando el agente modifica cualquier archivo del sketch, la app SHALL actualizar `projects.updated_at` en Supabase para que la biblioteca de proyectos muestre la fecha correcta.

#### Scenario: Sketch actualizado por el agente
- **WHEN** el workspace guarda `projects.sketch_js` y/o `projects.config_yaml`
- **THEN** también actualiza `projects.updated_at = now()` para el proyecto actual
