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

### Requirement: El workspace tiene un panel de chat placeholder
La app SHALL mostrar un panel lateral con el texto "Agente próximamente" en lugar del chat. El panel ocupa el espacio reservado para el agente y no tiene funcionalidad interactiva en este change.

#### Scenario: Panel placeholder visible
- **WHEN** el usuario abre el workspace
- **THEN** el panel de chat muestra un mensaje de placeholder sin controles interactivos

### Requirement: La app solo procesa mensajes de su propio iframe
La app SHALL verificar `event.source === iframeRef.current?.contentWindow` antes de procesar cualquier mensaje `postMessage`.

#### Scenario: Mensaje de origen desconocido
- **WHEN** llega un `postMessage` de un origen diferente al iframe del sketch
- **THEN** la app ignora el mensaje sin error
