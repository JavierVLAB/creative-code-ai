## ADDED Requirements

### Requirement: El endpoint acepta requests autenticados
El servidor SHALL exponer `POST /api/agent`. Todos los requests DEBEN incluir el header `Authorization: Bearer <supabase-jwt>`. El servidor verifica el token con `@mastra/auth-supabase`. Requests sin token válido devuelven 401.

#### Scenario: Request con token válido
- **WHEN** el frontend envía `POST /api/agent` con un JWT de Supabase válido
- **THEN** el servidor procesa el request y devuelve 200 con la respuesta del agente

#### Scenario: Request sin token
- **WHEN** el frontend envía `POST /api/agent` sin header Authorization
- **THEN** el servidor devuelve 401 con `{ error: "Unauthorized" }`

#### Scenario: Request con token expirado
- **WHEN** el frontend envía un JWT caducado
- **THEN** el servidor devuelve 401 con `{ error: "Unauthorized" }`

### Requirement: El body del request define el contexto del agente
El body SHALL ser JSON con los campos: `projectId` (UUID del proyecto), `message` (instrucción del usuario en texto libre), `sketchJs` (código actual del sketch, string), `configYaml` (config.yaml actual, string), `renderer` (`"p5js"` | `"threejs"`). `threadId` es el mismo que `projectId`.

#### Scenario: Body completo válido
- **WHEN** el body incluye todos los campos requeridos con tipos correctos
- **THEN** el agente recibe el contexto completo y puede actuar

#### Scenario: Body incompleto
- **WHEN** falta `message` o `projectId`
- **THEN** el servidor devuelve 400 con `{ error: "Bad Request", details: "<campo faltante>" }`

### Requirement: La respuesta sigue el schema de salida del agente
El servidor SHALL devolver 200 con el objeto de salida estructurado del agente:

```
{
  response: string
  appliedConfigYaml?: string
  appliedSketchJs?: string
  memorySuggestion?: string
  pendingQuestion?: string
}
```

Siempre presente: `response`. El resto son opcionales según lo que el agente haya hecho.

#### Scenario: Respuesta solo conversacional
- **WHEN** el usuario hace una pregunta sin necesidad de editar el sketch
- **THEN** la respuesta incluye solo `response` (sin campos opcionales)

#### Scenario: Respuesta con sketch editado
- **WHEN** el agente modifica el sketch
- **THEN** la respuesta incluye `response` + `appliedSketchJs` con el código completo actualizado

#### Scenario: Error interno del agente
- **WHEN** el agente falla tras los reintentos definidos en los guardrails
- **THEN** el servidor devuelve 200 con `{ response: "<mensaje de error claro>", appliedConfigYaml: undefined, appliedSketchJs: undefined }`
- **THEN** nunca devuelve 500 por errores del LLM — los errores del agente van en `response`

### Requirement: El endpoint es idempotente respecto al thread
El backend usa `threadId = projectId` para gestionar el historial. Llamadas sucesivas al mismo `projectId` continúan el mismo thread de conversación, sin crear threads duplicados.

#### Scenario: Segunda llamada al mismo proyecto
- **WHEN** el usuario envía un segundo mensaje al mismo proyecto
- **THEN** el agente tiene acceso al historial del thread y puede referenciar mensajes anteriores
