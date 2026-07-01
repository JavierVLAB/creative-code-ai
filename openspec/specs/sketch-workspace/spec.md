# Spec: sketch-workspace

Define los requisitos del workspace: iframe del sketch, controles generados desde config.yaml y protocolo postMessage.

---

### Requirement: El workspace renderiza el sketch en un iframe aislado
La app SHALL renderizar el sketch en un `<iframe>` con `sandbox="allow-scripts"`, inyectando el código vía `srcdoc`. El iframe no tiene acceso al DOM de la app, al localStorage del usuario ni a cookies.

#### Scenario: Sketch cargado correctamente
- **WHEN** el workspace carga un proyecto con sketch
- **THEN** el iframe recibe el HTML completo del sketch via `srcdoc`
- **THEN** la app envía `SKETCH_INIT` con `{ config, values }` al montar el iframe
- **THEN** el sketch emite `SKETCH_READY` y la app lo registra sin error visible

#### Scenario: Sketch sin archivos (proyecto vacío)
- **WHEN** el proyecto no tiene `sketch.js` asociado
- **THEN** el workspace muestra un sketch de demo (círculo p5.js con parámetro `radius`)
- **THEN** el usuario puede interactuar con los controles del demo

#### Scenario: Error en el sketch
- **WHEN** el iframe emite `SKETCH_ERROR`
- **THEN** la app muestra el mensaje de error sobre el iframe sin romper el workspace

### Requirement: La app genera controles desde `config.yaml`
La app SHALL parsear el `config.yaml` del proyecto y generar automáticamente controles visuales: sliders para `type: range`, chips o swatches para `type: select`.

#### Scenario: Parámetro range genera slider
- **WHEN** `config.yaml` define un módulo con `type: range`
- **THEN** el panel de controles muestra un slider con los valores `min`, `max`, `step` y `default`
- **THEN** el slider muestra la etiqueta `label` definida en el config

#### Scenario: Parámetro select con colores genera swatches
- **WHEN** `config.yaml` define un módulo `type: select` con opciones hexadecimales
- **THEN** el panel muestra swatches de color en lugar de chips de texto

#### Scenario: Parámetro select sin colores genera chips
- **WHEN** `config.yaml` define un módulo `type: select` con opciones no-hexadecimales
- **THEN** el panel muestra chips de texto seleccionables

### Requirement: Los controles actualizan el sketch en tiempo real
La app SHALL enviar `SKETCH_UPDATE` al iframe cada vez que el usuario mueve un control, sin recargar el iframe.

#### Scenario: Mover un slider
- **WHEN** el usuario arrastra un slider
- **THEN** la app envía `SKETCH_UPDATE` con `{ values: { [paramName]: newValue } }`
- **THEN** el sketch aplica el nuevo valor sin reiniciarse

#### Scenario: Seleccionar un chip/swatch
- **WHEN** el usuario selecciona una opción en un control `select`
- **THEN** la app envía `SKETCH_UPDATE` con el nuevo valor
- **THEN** el sketch aplica el cambio

### Requirement: La app solo procesa mensajes de su propio iframe
La app SHALL verificar `event.source === iframeRef.current?.contentWindow` antes de procesar cualquier mensaje `postMessage`.

#### Scenario: Mensaje de origen desconocido
- **WHEN** llega un `postMessage` de un origen diferente al iframe del sketch
- **THEN** la app ignora el mensaje sin error

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
