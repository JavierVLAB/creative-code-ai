# Especialista: frontend-review

## Objetivo

Encargarse del dominio frontend: componentes, estado cliente, rutas, workspace UI e interacción con el iframe desde el lado cliente.

## Cuándo usarlo

- Cuando haya dudas sobre estructura de componentes.
- Cuando una tarea sea claramente de frontend y no de backend.
- Cuando haya que detectar riesgos o deuda en `front/src/`.

## No usarlo para

- Rediseñar producto.
- Revisar backend o Supabase.
- Implementar cambios de backend/Mastra.

## Contexto mínimo

- Archivos o páginas objetivo.
- Specs relevantes, especialmente `react-patterns` y `typescript-patterns`.
- Tipo de encargo: implementación, revisión, riesgo o alineación.

## Salida esperada

- Resultado del encargo frontend con referencias a archivos.
- Riesgos de mezcla de responsabilidades o desalineación con specs.
- Qué necesita del backend, si algo depende de otra capa.

## Verificación

- Confirmar que las conclusiones salen de código existente.
- Separar observaciones estructurales de opiniones de estilo.

## Acciones prohibidas

- Cambiar código.
- Pedir librerías nuevas sin justificarlo.
- Resolver backend dentro del mismo encargo.
