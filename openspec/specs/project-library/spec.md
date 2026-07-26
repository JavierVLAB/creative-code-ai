# Spec: project-library

Define los requisitos de la biblioteca de proyectos del usuario.

---

### Requirement: El usuario puede ver su biblioteca de proyectos
La app SHALL mostrar todos los proyectos del usuario autenticado en una lista, ordenados por fecha de actualización descendente. Cada proyecto muestra su nombre y fecha de última modificación.

#### Scenario: Biblioteca con proyectos existentes
- **WHEN** el usuario navega a `/app`
- **THEN** la app consulta `projects` en Supabase filtrando por `user_id = auth.uid()`
- **THEN** muestra una tarjeta por cada proyecto con nombre y fecha

#### Scenario: Biblioteca vacía
- **WHEN** el usuario no tiene proyectos
- **THEN** la app muestra un estado vacío con un botón "Crear proyecto"

#### Scenario: Error de carga
- **WHEN** la consulta a Supabase falla
- **THEN** la app muestra un mensaje de error sin romper la UI

### Requirement: El usuario puede crear un proyecto nuevo
La app SHALL permitir crear un proyecto con un nombre. El proyecto se guarda en Supabase y el usuario es redirigido automáticamente al workspace del proyecto recién creado.

#### Scenario: Creación exitosa
- **WHEN** el usuario introduce un nombre y confirma
- **THEN** la app inserta una fila en `projects` con `user_id`, `name`, `created_at`, `updated_at`
- **THEN** redirige a `/app/projects/:id`

#### Scenario: Nombre vacío
- **WHEN** el usuario intenta crear sin nombre
- **THEN** la app muestra un error de validación y no hace la inserción

### Requirement: El usuario elige el origen del sketch al crear un proyecto
El diálogo de creación de proyecto SHALL ofrecer, en un único modal sin pasos, tres orígenes: empezar en blanco, pedirle una descripción a la IA, o copiar una plantilla publicada. El nombre se pide primero; el origen se elige debajo, en la misma vista.

#### Scenario: Origen en blanco
- **WHEN** el usuario crea un proyecto con el origen "en blanco" (por defecto)
- **THEN** la app inserta `sketch_js`/`config_yaml` con un boilerplate mínimo válido que cumple `sketch-contract`, no cadenas vacías

#### Scenario: Origen "que me ayude la IA"
- **WHEN** el usuario elige el origen "IA" y escribe una descripción del sketch deseado
- **THEN** el proyecto se crea con el mismo boilerplate en blanco
- **THEN** la app navega al workspace y envía automáticamente esa descripción como primer mensaje del chat

#### Scenario: Origen "desde una plantilla"
- **WHEN** el usuario elige el origen "plantilla" y selecciona una plantilla publicada de una lista simple (sin miniaturas) dentro del mismo modal
- **THEN** el proyecto se crea con el `sketch_js`/`config_yaml` de la plantilla elegida

#### Scenario: Botón Crear deshabilitado
- **WHEN** falta el nombre, o el origen es "plantilla" sin ninguna seleccionada
- **THEN** el botón "Crear" permanece deshabilitado

### Requirement: El usuario puede eliminar un proyecto
La app SHALL permitir eliminar un proyecto propio. La eliminación requiere confirmación explícita del usuario.

#### Scenario: Eliminación confirmada
- **WHEN** el usuario confirma la eliminación
- **THEN** la app elimina la fila de `projects` (RLS garantiza que solo puede borrar la suya)
- **THEN** el proyecto desaparece de la lista sin recargar la página

#### Scenario: Eliminación cancelada
- **WHEN** el usuario cancela en el diálogo de confirmación
- **THEN** no se realiza ninguna operación

### Requirement: El usuario puede abrir un proyecto existente
La app SHALL navegar al workspace del proyecto al hacer clic en su tarjeta.

#### Scenario: Navegación al proyecto
- **WHEN** el usuario hace clic en una tarjeta de proyecto
- **THEN** la app navega a `/app/projects/:id`
