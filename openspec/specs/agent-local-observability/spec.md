## Purpose

Definir el comportamiento esperado para la observabilidad local y la revisión de evaluaciones del agente en Mastra Studio durante desarrollo.

## Requirements

### Requirement: El desarrollador puede inspeccionar trazas locales del agente
El backend SHALL configurar observabilidad local de Mastra para que, en desarrollo, cada llamada real al agente genere una traza visible en Mastra Studio con el flujo completo de ejecución.

#### Scenario: Llamada local al agente visible en Studio
- **WHEN** el desarrollador ejecuta el backend en local y lanza una llamada a `POST /agent`
- **THEN** Mastra Studio muestra una traza de esa ejecución
- **THEN** la traza incluye al menos la ejecución del workflow, la llamada al agente y las tool calls realizadas

#### Scenario: Fallo de tool visible en la traza
- **WHEN** una tool falla durante una llamada local del agente
- **THEN** la traza refleja el fallo y el paso donde ocurrió

### Requirement: El desarrollador dispone de una batería local inicial de 5 preguntas
El sistema SHALL definir una batería local inicial de 5 preguntas representativas para evaluar el comportamiento del agente durante desarrollo. Estas preguntas MUST cubrir al menos conversación directa, cambio de parámetros, cambio de sketch y un caso ambiguo que requiera aclaración o validación explícita del comportamiento esperado.

#### Scenario: Batería inicial disponible
- **WHEN** el desarrollador prepara una evaluación local del agente
- **THEN** dispone de 5 preguntas concretas listas para ejecutar
- **THEN** cada pregunta tiene un objetivo observable que permita juzgar si el agente actuó correctamente

### Requirement: El desarrollador puede revisar la evaluación local en Mastra
El flujo de desarrollo SHALL permitir ejecutar la batería local y revisar sus resultados en Mastra, de forma que el desarrollador pueda inspeccionar la respuesta del agente y las trazas asociadas antes de desplegar cambios.

#### Scenario: Revisión local de resultados
- **WHEN** el desarrollador ejecuta la batería local de 5 preguntas
- **THEN** puede revisar en Mastra las ejecuciones correspondientes
- **THEN** puede comprobar para cada una la respuesta final y las tools utilizadas

### Requirement: Las evaluaciones definidas en este change son solo locales
La batería de evaluación introducida en este change SHALL formar parte del flujo local de desarrollo y MUST NOT ejecutarse como parte del runtime de producción.

#### Scenario: Evaluaciones fuera del runtime de producción
- **WHEN** el backend se despliega en producción
- **THEN** las 5 preguntas de evaluación no se ejecutan automáticamente sobre tráfico real
