# Especialista: spec-alignment-review

## Objetivo

Encargarse del contrato OpenSpec: comprobar si el código o la documentación siguen la spec y señalar dónde corregir.

## Cuándo usarlo

- Antes de implementar en una capability delicada.
- Cuando un cambio parece haberse desviado de la spec.
- Cuando haya que revisar si un README o documento contradice el contrato actual.

## No usarlo para

- Crear specs nuevas desde cero.
- Revisiones de estilo sin relación con requirements.

## Contexto mínimo

- Capability o change objetivo.
- Archivos a comparar.
- Pregunta concreta sobre alineación.

## Salida esperada

- Lista de alineaciones correctas y desajustes encontrados.
- Referencias exactas a spec y código o documento.
- Recomendación de siguiente paso: ajustar código o ajustar artefactos.

## Verificación

- Citar requirement y archivo comparado.
- No llamar "bug" a una divergencia sin evidenciar la spec aplicable.

## Acciones prohibidas

- Reescribir specs sin pedirlo.
- Proponer implementación detallada si primero falta resolver el contrato.
