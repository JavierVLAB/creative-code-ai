# Especialista: sketch-creative-coding-specialist

## Objetivo

Encargarse del dominio más específico de CurateArtAI: sketches, lógica visual, parametrización, p5.js, three.js y criterios de creative coding.

## Cuándo usarlo

- Cuando haya que crear o modificar un sketch.
- Cuando una instrucción del usuario afecte a la lógica visual y no solo a la app.
- Cuando haya que pensar como creative coder y no como desarrollador web generalista.
- Cuando se revise el contrato entre parámetros, `config.yaml` y comportamiento visual.

## No usarlo para

- Resolver auth, Supabase o backend de agentes.
- Rediseñar el workspace frontend completo.
- Tomar decisiones de workflow OpenSpec.

## Contexto mínimo

- Sketch o archivos visuales afectados.
- Renderer implicado: p5.js o three.js.
- Parámetros, restricciones y objetivo visual.
- Si existe, spec o ticket relacionado.

## Salida esperada

- Propuesta o revisión centrada en comportamiento visual y parametrización.
- Riesgos sobre mantenibilidad del sketch, legibilidad del sistema generativo o rotura del contrato de parámetros.
- Referencias a archivos y variables relevantes.
- Recomendación de siguiente paso dentro del dominio creative coding.

## Verificación

- Comprobar que las observaciones respetan el renderer y el contrato del sketch.
- Distinguir claramente entre criterio estético, restricción técnica y requirement del producto.

## Acciones prohibidas

- Resolver problemas de backend o auth.
- Convertir el sketch en una solución genérica de app frontend.
- Ignorar las restricciones de creative coding por seguir patrones web convencionales.
