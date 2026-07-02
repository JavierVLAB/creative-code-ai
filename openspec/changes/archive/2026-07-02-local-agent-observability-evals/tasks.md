## 1. Observabilidad local de Mastra

- [x] 1.1 Verificar qué dependencias de observability/evals de Mastra faltan en `backend/package.json` y documentar cuáles debe instalar Javi.
- [x] 1.2 Configurar observabilidad local en `backend/src/mastra/index.ts` manteniendo separado el storage principal del backend y el storage local de observabilidad.
- [x] 1.3 Asegurar que una llamada local a `POST /agent` genera una traza visible en Mastra Studio con workflow, agente y tool calls.

## 2. Batería local inicial de evaluación

- [x] 2.1 Definir 5 preguntas representativas para el agente cubriendo al menos conversación directa, cambio de parámetros, cambio de sketch y un caso ambiguo.
- [x] 2.2 Crear el artefacto local necesario para ejecutar esa batería en desarrollo (dataset, script o configuración equivalente dentro del backend).
- [x] 2.3 Añadir el criterio observable esperado para cada una de las 5 preguntas para que la revisión local sea consistente.

## 3. Revisión local en Mastra

- [x] 3.1 Ejecutar la batería local como dataset/experiment y comprobar que las 5 ejecuciones quedan revisables en Mastra.
- [x] 3.2 Verificar que para cada ejecución se puede inspeccionar al menos la respuesta final, las tools usadas y la traza asociada dentro de Studio.
- [x] 3.3 Documentar brevemente el flujo local de uso: arrancar backend, lanzar evaluación y revisar trazas/resultados en Mastra.
