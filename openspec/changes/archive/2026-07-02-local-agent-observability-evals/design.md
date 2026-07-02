## Context

El backend actual de CurateArtAI ya registra un agente Mastra, un workflow de guardrails y memoria por thread, pero no configura observabilidad. El resultado es que Mastra Studio puede mostrar el agente y el workflow como entidades registradas, pero no permite inspeccionar trazas reales de ejecución ni usar ese flujo para revisar una batería mínima de evaluación local.

El objetivo inmediato no es resolver observabilidad de producción ni montar una plataforma completa de calidad. El objetivo es dar al desarrollador un banco de trabajo local para iterar sobre comportamiento, guardrails y calidad del agente con el menor alcance posible.

## Goals / Non-Goals

**Goals:**
- Activar trazabilidad local visible en Mastra Studio para llamadas reales a `POST /agent`.
- Mantener la memoria y el runtime actuales del agente, añadiendo solo la capa de observabilidad local necesaria.
- Definir una batería inicial de 5 preguntas representativas del producto para validar el agente en local.
- Permitir revisar en Mastra tanto las trazas de ejecución como los resultados de esas preguntas.

**Non-Goals:**
- Resolver en este change la observabilidad de producción o su backend definitivo.
- Ejecutar evaluaciones automáticamente sobre tráfico real.
- Diseñar un sistema completo de feedback humano, scoring avanzado o reporting en Supabase.
- Cambiar el contrato funcional del endpoint `POST /agent`.

## Decisions

### 1. Observabilidad solo en entorno local

La observabilidad de este change se configura para desarrollo local, no como una decisión cerrada de infraestructura para producción.

Alternativas consideradas:
- Configurar ya una solución completa local + cloud: descartado por mezclar dos problemas distintos.
- Posponer la observabilidad y hacer solo evals: descartado porque el usuario quiere poder inspeccionar trazas.

### 2. Mantener separado el storage de aplicación y la observabilidad local

La memoria y datos actuales del runtime siguen donde están; la observabilidad local se añade como una capa separada para que Studio pueda consultar trazas y métricas locales sin alterar el storage principal del backend.

Alternativas consideradas:
- Reutilizar el mismo store principal para observabilidad: descartado porque este change busca seguir el flujo esperado por Mastra Studio en local.

### 3. Una sola capability de desarrollo local

El change agrupa trazas locales y batería de 5 preguntas bajo una sola capability porque el objetivo de negocio es único: permitir al desarrollador inspeccionar y evaluar el agente antes de desplegar.

Alternativas consideradas:
- Separar “observability” y “evals” en dos changes: descartado por exceso de fragmentación para un alcance pequeño.

### 4. La batería inicial es corta, fija y representativa

La primera versión usa 5 preguntas concretas en vez de un sistema genérico de datasets extensos. Eso da una base rápida y repetible para validar cambios del agente sin convertir el change en un framework de QA.

Alternativas consideradas:
- Dataset abierto y ampliable desde el primer día: descartado por alcance.
- Solo una o dos preguntas smoke-test: descartado porque no cubre suficiente variedad de comportamiento.

### 5. Las evaluaciones se revisan en local, no se promueven a runtime de producción

Las 5 preguntas forman parte del flujo de desarrollo local. Producción puede seguir teniendo guardrails operativos y trazabilidad, pero este change no convierte las evaluaciones en un proceso continuo de producción.

Alternativas consideradas:
- Reusar las mismas preguntas en producción: descartado porque no responde a la necesidad actual y añade ruido operativo.

## Risks / Trade-offs

- **[Riesgo] La configuración local de observabilidad introduce dependencias nuevas** → Mitigación: mantener el alcance acotado a desarrollo local y documentar con claridad qué debe instalar Javi.
- **[Riesgo] Las 5 preguntas se quedan cortas y generan falsa confianza** → Mitigación: tratarlas como batería inicial y dejar explícito que son una base mínima, no cobertura exhaustiva.
- **[Trade-off] Separar observabilidad local del storage principal añade una pieza más en desarrollo** → A cambio, permite usar Studio para la inspección que el usuario necesita ahora.
- **[Trade-off] No diseñar scoring sofisticado reduce precisión automática** → A cambio, acelera la puesta en marcha y prioriza revisión trazable del comportamiento real.

## Migration Plan

1. Añadir la configuración local de observabilidad al backend Mastra.
2. Incorporar la batería local de 5 preguntas y el mecanismo mínimo para ejecutarla.
3. Verificar en local que Studio muestra trazas y que las 5 ejecuciones pueden revisarse.
4. Mantener la parte de producción fuera de este change.

Rollback:
- Si la observabilidad local rompe el arranque del backend, se revierte a la configuración actual sin tocar el contrato del agente ni el endpoint.

## Open Questions

- Qué 5 preguntas exactas representan mejor el comportamiento inicial que se quiere validar.
- Si la revisión en Mastra se hará solo vía trazas/Studio o también mediante scorers básicos visibles desde la herramienta.
