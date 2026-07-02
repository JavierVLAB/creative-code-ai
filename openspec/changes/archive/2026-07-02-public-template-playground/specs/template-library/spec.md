## ADDED Requirements

### Requirement: El sistema define plantillas publicadas
El sistema SHALL almacenar plantillas de sketches como recursos separados de los proyectos de usuario. Cada plantilla SHALL incluir al menos titulo, descripcion, `sketch_js`, `config_yaml`, renderer, estado de publicacion y metadatos opcionales de presentacion.

#### Scenario: Plantilla publicada valida
- **WHEN** una plantilla tiene `is_published = true` y contiene `sketch_js` y `config_yaml` validos
- **THEN** el sistema la puede mostrar en la biblioteca publica de plantillas

#### Scenario: Plantilla no publicada
- **WHEN** una plantilla tiene `is_published = false`
- **THEN** el sistema no la muestra en el playground publico

### Requirement: Las plantillas iniciales vienen del proyecto antiguo
El sistema SHALL importar como plantillas iniciales los sketches `demo`, `bezier-noise` y `particulas` desde `/Users/javiervillarroel/Documents/Proyectos/curateartai/app/public`.

#### Scenario: Seed de plantillas iniciales
- **WHEN** las migraciones o seeds del change se aplican
- **THEN** existen plantillas publicadas para "Circulo con lineas", "Espiral Bezier" y "Particulas conectadas"

### Requirement: Las plantillas son solo lectura para visitantes
Los visitantes anonimos SHALL poder leer solo plantillas publicadas. Los visitantes anonimos MUST NOT crear, actualizar ni borrar plantillas.

#### Scenario: Visitante lee plantillas publicadas
- **WHEN** un visitante sin sesion abre el playground
- **THEN** puede consultar las plantillas con `is_published = true`

#### Scenario: Visitante intenta modificar plantillas
- **WHEN** un visitante sin sesion intenta insertar, actualizar o borrar una plantilla
- **THEN** Supabase bloquea la operacion
