# Spec: agent-chat

Define los requisitos del panel de chat del agente dentro del workspace.

---

### Requirement: El panel de chat muestra el historial de mensajes de la sesión
La app SHALL renderizar una lista de mensajes ordenados cronológicamente. Los mensajes del usuario se alinean a la derecha; los del agente a la izquierda. La lista hace scroll automático al mensaje más reciente.

#### Scenario: Primera sesión en el proyecto
- **WHEN** el usuario abre el workspace por primera vez
- **THEN** el chat aparece vacío con un mensaje de bienvenida del sistema ("Hola, soy tu asistente de arte generativo...")

#### Scenario: Mensajes enviados en la sesión
- **WHEN** el usuario envía un mensaje y el agente responde
- **THEN** ambos mensajes aparecen en el historial con su rol y contenido

### Requirement: El input permite enviar mensajes al agente
La app SHALL mostrar un campo de texto y un botón de envío. El usuario puede enviar presionando Enter o haciendo clic en el botón. El input se limpia tras enviar.

#### Scenario: Envío con Enter
- **WHEN** el usuario escribe un mensaje y pulsa Enter
- **THEN** el mensaje se envía y el input queda vacío

#### Scenario: Input vacío
- **WHEN** el usuario intenta enviar sin texto
- **THEN** no se hace ninguna llamada al backend

### Requirement: El chat muestra estado de carga mientras el agente procesa
La app SHALL deshabilitar el input y mostrar un indicador de carga mientras espera la respuesta del agente. No se pueden enviar mensajes concurrentes.

#### Scenario: Agente procesando
- **WHEN** hay una llamada en vuelo al backend
- **THEN** el input está deshabilitado y el botón muestra un spinner

#### Scenario: Respuesta recibida
- **WHEN** el backend devuelve respuesta
- **THEN** el input se habilita y el mensaje del agente aparece en el historial

### Requirement: El chat muestra errores de red de forma amable
La app SHALL mostrar un mensaje de error en el chat si la llamada al backend falla (timeout, 5xx, red caída). El error no rompe el workspace.

#### Scenario: Error de red
- **WHEN** la llamada a `POST /agent` falla
- **THEN** aparece un mensaje en el chat ("No pude conectar con el agente, inténtalo de nuevo") y el input se habilita

### Requirement: El chat envía el contexto actual del sketch al agente
Cada mensaje del usuario SHALL enviarse a `POST /agent` con Bearer token de Supabase y con el contexto completo del sketch actual.

#### Scenario: Envío al backend
- **WHEN** el usuario envía un mensaje desde el workspace
- **THEN** la app llama a `POST /agent`
- **THEN** el body incluye `projectId`, `message`, `sketchJs`, `configYaml`, `renderer` y opcionalmente `previousResponse`
- **THEN** el header incluye `Authorization: Bearer <supabase-jwt>`

### Requirement: El chat muestra preguntas aclaratorias del agente
Cuando la respuesta incluye `pendingQuestion`, la app SHALL mostrar la pregunta como un mensaje del agente y bloquear el input con el placeholder "Responde la pregunta del agente...".

#### Scenario: Agente pide aclaración
- **WHEN** la respuesta incluye `pendingQuestion`
- **THEN** el mensaje del agente muestra la pregunta y el input tiene un placeholder diferente

### Requirement: El banner de sugerencia de memoria permite aprobar o ignorar
Cuando la respuesta incluye `memorySuggestion`, la app SHALL mostrar un banner encima del input con el texto sugerido y dos botones: "Guardar" y "Ignorar". Al guardar, escribe el texto en `projects.memory`. El banner desaparece tras la acción o al enviar el siguiente mensaje.

#### Scenario: Agente sugiere una nota de memoria
- **WHEN** la respuesta incluye `memorySuggestion`
- **THEN** aparece el banner con el texto y los botones

#### Scenario: Usuario aprueba la sugerencia
- **WHEN** el usuario hace clic en "Guardar"
- **THEN** la app actualiza `projects.memory` en Supabase y el banner desaparece

#### Scenario: Usuario ignora la sugerencia
- **WHEN** el usuario hace clic en "Ignorar" o envía un nuevo mensaje
- **THEN** el banner desaparece sin guardar nada
