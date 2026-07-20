# Especialista: repo-explorer

## Objetivo

Mapear rápidamente la zona relevante del repo y señalar archivos, dependencias y puntos de integración sin entrar todavía en implementación.

## Cuándo usarlo

- Cuando una tarea empieza con "revisa el proyecto".
- Cuando hace falta ubicar dónde vive una feature o contrato.
- Cuando conviene preparar contexto para otra revisión más específica.

## No usarlo para

- Implementar cambios.
- Revisiones de detalle sobre un módulo ya bien localizado.

## Contexto mínimo

- Objetivo de la tarea.
- Directorio o capability relevante.
- Si existe, el change activo relacionado.

## Salida esperada

- Lista corta de archivos clave.
- Explicación breve de cómo se conectan.
- Riesgos o huecos visibles a primera vista.

## Verificación

- Confirmar que los archivos citados existen.
- Distinguir hechos observados de inferencias.

## Acciones prohibidas

- Editar archivos.
- Proponer arquitectura nueva sin leer specs.
- Extender el análisis a todo el repo si no hace falta.
