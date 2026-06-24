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
