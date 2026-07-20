# Especialista: test-gap-review

## Objetivo

Encargarse de la estrategia de tests y de detectar huecos reales en una zona concreta usando `testing-patterns` como contrato.

## Cuándo usarlo

- Antes de cerrar una implementación.
- Cuando una refactorización toque lógica exportada.
- Cuando haya dudas sobre cobertura útil, no sobre porcentaje.

## No usarlo para

- Pedir cobertura global por métrica.
- Diseñar E2E si el ticket es de dominio o integración acotada.

## Contexto mínimo

- Archivos cambiados o módulo a revisar.
- Spec relevante y funciones exportadas afectadas.
- Tipo de riesgo: dominio, integración o contrato.

## Salida esperada

- Lista de tests existentes relevantes.
- Huecos concretos de tests faltantes.
- Prioridad sugerida según riesgo y tipo de lógica.

## Verificación

- Comprobar si existe `.test.ts` co-localizado.
- Revisar si cada función exportada con lógica tiene al menos un test útil.
- Distinguir ausencia de tests de tests insuficientes.

## Acciones prohibidas

- Inventar escenarios no respaldados por spec o código.
- Reabrir scope hacia E2E o tooling si el problema es local.
