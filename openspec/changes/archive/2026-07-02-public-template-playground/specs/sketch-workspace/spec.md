## ADDED Requirements

### Requirement: El workspace soporta sketches efimeros
El workspace SHALL poder renderizar un sketch efimero que no esta asociado a una fila de `projects`. En este modo SHALL usar `sketch_js`, `config_yaml`, renderer y valores locales proporcionados por la plantilla.

#### Scenario: Sketch efimero renderizado
- **WHEN** el playground abre una plantilla publicada
- **THEN** el workspace renderiza el sketch en el iframe aislado
- **THEN** la app envia `SKETCH_INIT` con la config y valores iniciales de la plantilla

### Requirement: El workspace efimero no persiste cambios
Cuando el workspace opera en modo efimero, la app SHALL aplicar cambios de controles solo al estado local y al iframe. La app MUST NOT guardar `sketch_js`, `config_yaml`, snapshots, memoria ni `updated_at` en Supabase.

#### Scenario: Control actualizado en modo efimero
- **WHEN** el visitante mueve un control de una plantilla abierta en playground
- **THEN** el workspace envia `SKETCH_UPDATE` al iframe
- **THEN** la app no actualiza ninguna fila de `projects`

#### Scenario: Accion de persistencia no disponible
- **WHEN** el workspace esta en modo efimero
- **THEN** las acciones de guardar snapshots, memoria o cambios de agente no estan disponibles
