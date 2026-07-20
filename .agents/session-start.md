# Checklist de inicio de sesión

Usa esta secuencia antes de explorar, proponer o implementar.

## 1. Contexto base

- Leer `AGENTS.md`.
- Leer `.agents/README.md`.
- Confirmar el objetivo de la tarea en la conversación actual.

## 2. Estado de OpenSpec

- Ejecutar `openspec list --json`.
- Si hay un change activo y relevante, leer sus artefactos antes de tocar código.
- Si no hay change y el trabajo es no trivial, preparar propuesta antes de implementar.

## 3. Enrutado mínimo

- Si la tarea pertenece claramente a frontend, backend/Mastra, integración, specs, tests o sketches, abrir el especialista apropiado.
- Si la tarea menciona skills, abrir `skills.md`.
- Si la tarea menciona hooks, abrir `hooks.md`.

## 4. Antes de implementar

- Verificar qué spec gobierna la zona afectada.
- Confirmar si hace falta aprobación explícita.
- Decidir si conviene delegar por dominio a un especialista.

## 5. Señales de pausa

Pausa y aclara si ocurre cualquiera de estas:

- el change no existe y el trabajo es sustancial,
- la tarea mezcla exploración e implementación sin contrato claro,
- no está claro qué especialista debería llevar el trabajo,
- la delegación requeriría mezclar frontend y backend en el mismo encargo,
- la definición de hooks todavía no está elegida.
