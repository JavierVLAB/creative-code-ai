## ADDED Requirements

### Requirement: README follows the delivery template
El README SHALL conservar las secciones requeridas por la plantilla de entrega: ficha, descripcion del producto, arquitectura, modelo de datos, API, historias de usuario, tickets de trabajo y pull requests.

#### Scenario: Reader reviews the delivery README
- **WHEN** una persona abre `readme.md`
- **THEN** encuentra las secciones 0 a 7 exigidas por la plantilla de entrega

### Requirement: README states unknown delivery details as pending
El README SHALL marcar como pendiente cualquier dato de entrega no confirmado, incluyendo URL publica, repositorio, despliegue, capturas/video y PRs si aplica.

#### Scenario: Deployment is not confirmed
- **WHEN** el despliegue final aun no esta disponible
- **THEN** el README indica que esta pendiente sin inventar URL ni proceso final

### Requirement: README reflects current architecture
El README SHALL describir la arquitectura actual con frontend React, backend Mastra, Supabase, ruta custom `POST /agent`, `projects.memory` y pnpm como gestor de paquetes.

#### Scenario: Technical reader checks architecture
- **WHEN** una persona revisa arquitectura, API e instalacion
- **THEN** la documentacion coincide con la rama actual y no describe la arquitectura antigua 100 % cliente

### Requirement: README includes product framing
El README SHALL incluir vision, problema, posicionamiento, usuarios objetivo, objetivos/no-objetivos y metricas de exito de forma compatible con la descripcion tecnica.

#### Scenario: Product reader checks value proposition
- **WHEN** una persona revisa la descripcion general
- **THEN** entiende que CurateArtAI separa exploracion, codigo y curacion de sketches generativos
