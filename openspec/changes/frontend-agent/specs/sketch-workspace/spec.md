## MODIFIED Requirements

### Requirement: El workspace aplica los cambios del agente al sketch
El workspace SHALL reaccionar a la respuesta del agente actualizando los archivos en Supabase Storage y refrescando el iframe y los controles según qué cambió.

- Solo `appliedSketchJs` → reinyectar `srcdoc` (iframe se reinicia con el código nuevo)
- Solo `appliedConfigYaml` → guardar config, regenerar controles, enviar `SKETCH_RESTART` al iframe
- Ambos → guardar ambos, reinyectar `srcdoc`, luego enviar `SKETCH_INIT` con la nueva config

#### Scenario: Agente modifica solo el código
- **WHEN** la respuesta del agente incluye `appliedSketchJs` pero no `appliedConfigYaml`
- **THEN** el workspace sube `sketch.js` a Supabase Storage en `{userId}/{projectId}/sketch.js`
- **THEN** reinyecta el iframe con el nuevo `srcdoc` y envía `SKETCH_INIT` con la config actual

#### Scenario: Agente modifica solo la configuración
- **WHEN** la respuesta incluye `appliedConfigYaml` pero no `appliedSketchJs`
- **THEN** el workspace sube `config.yaml` a Storage en `{userId}/{projectId}/config.yaml`
- **THEN** regenera los controles visuales desde el nuevo config
- **THEN** envía `SKETCH_RESTART` al iframe con la nueva config y los valores actuales

#### Scenario: Agente modifica ambos
- **WHEN** la respuesta incluye tanto `appliedConfigYaml` como `appliedSketchJs`
- **THEN** el workspace sube ambos archivos a Storage
- **THEN** reinyecta el iframe con el nuevo código y envía `SKETCH_INIT` con la nueva config

#### Scenario: Agente no modifica el sketch
- **WHEN** la respuesta solo incluye `response` (respuesta conversacional)
- **THEN** el workspace no modifica el iframe ni los controles

### Requirement: El workspace actualiza `updated_at` del proyecto tras cambios del agente
Cuando el agente modifica cualquier archivo del sketch, la app SHALL actualizar `projects.updated_at` en Supabase para que la biblioteca de proyectos muestre la fecha correcta.

#### Scenario: Sketch actualizado por el agente
- **WHEN** el workspace sube uno o ambos archivos del sketch a Storage
- **THEN** también actualiza `projects.updated_at = now()` para el proyecto actual
