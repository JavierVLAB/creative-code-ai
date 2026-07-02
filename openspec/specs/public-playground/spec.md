# public-playground Specification

## Purpose

Definir la experiencia publica de playground para probar plantillas sin login, en modo efimero y sin persistencia de datos de usuario.

## Requirements

### Requirement: El playground publico lista plantillas sin login
La app SHALL exponer una ruta publica `/playground` accesible sin sesion. La ruta SHALL mostrar las plantillas publicadas disponibles para probar.

#### Scenario: Visitante abre el playground
- **WHEN** un visitante sin sesion navega a `/playground`
- **THEN** la app muestra la biblioteca de plantillas publicadas

#### Scenario: No hay plantillas publicadas
- **WHEN** el visitante abre `/playground` y no hay plantillas publicadas
- **THEN** la app muestra un estado vacio sin romper la UI

### Requirement: El visitante abre una plantilla en modo efimero
La app SHALL permitir abrir una plantilla publicada en un workspace efimero. El workspace efimero SHALL cargar `sketch_js`, `config_yaml`, renderer y valores iniciales desde la plantilla seleccionada.

#### Scenario: Apertura de plantilla
- **WHEN** el visitante selecciona una plantilla publicada
- **THEN** la app muestra el sketch en el visor aislado
- **THEN** la app genera controles desde el `config_yaml` de la plantilla

#### Scenario: Recarga de pagina
- **WHEN** el visitante modifica controles y recarga la pagina
- **THEN** la plantilla vuelve a cargarse con sus valores originales

### Requirement: El playground publico no persiste cambios de visitante
El playground publico SHALL mantener los cambios del visitante solo en estado local de la sesion. La app MUST NOT escribir en `projects`, `snapshots`, `assets`, `memory` ni actualizar `updated_at` durante el uso del playground publico.

#### Scenario: Control modificado en playground
- **WHEN** el visitante mueve un control en el playground
- **THEN** el sketch se actualiza en tiempo real
- **THEN** no se realiza ninguna escritura de usuario en Supabase

### Requirement: La IA esta deshabilitada en el playground publico
El playground publico SHALL mostrar la funcionalidad de IA como deshabilitada o no disponible. La app MUST NOT llamar a `POST /agent` desde `/playground` en este change.

#### Scenario: Visitante ve el panel de IA
- **WHEN** el visitante abre una plantilla en el playground publico
- **THEN** la UI indica que la IA no esta disponible en el playground publico

#### Scenario: Visitante intenta usar IA
- **WHEN** el visitante intenta enviar una instruccion de IA desde el playground publico
- **THEN** la app no llama a `POST /agent`

### Requirement: El playground ofrece guardar mediante cuenta
El playground publico SHALL ofrecer una llamada a crear cuenta o iniciar sesion para guardar trabajo en un proyecto propio.

#### Scenario: Visitante quiere guardar
- **WHEN** el visitante decide guardar o continuar desde una plantilla
- **THEN** la app lo dirige a login o registro
