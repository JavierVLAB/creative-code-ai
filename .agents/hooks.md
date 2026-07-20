# Automation hooks propuestos

En este arnés, `hooks` significa automatizaciones del workflow del agente o del tooling.

Todavía no se activan aquí.
Este documento propone hooks concretos para que decidamos cuáles merece la pena adoptar en el proyecto.

## Hook 1: bloquear `git push` sin checks previos

**Intención**

Evitar pushes cuando no se ha ejecutado la validación mínima acordada para el scope del cambio.

**Regla que refuerza**

No avanzar en el workflow sin verificación suficiente.

## Hook 2: bloquear edición de código fuera de un change OpenSpec aprobado

**Intención**

Impedir que el agente entre a editar código cuando no existe un change aprobado para trabajo no trivial.

**Regla que refuerza**

La disciplina OpenSpec no vive solo como texto en `AGENTS.md`.

## Hook 3: advertir si se empieza a trabajar sin leer el change activo

**Intención**

Detectar sesiones donde hay change activo pero el agente no ha cargado todavía proposal, design, specs y tasks.

**Regla que refuerza**

Leer el contrato antes de implementar.

## Hook 4: impedir cambios fuera del scope del change

**Intención**

Detectar ediciones en zonas del repo que no encajan con el objetivo declarado del change.

**Regla que refuerza**

Cambios quirúrgicos y scope controlado.

## Hook 5: exigir resumen de validación antes de cerrar implementación

**Intención**

Forzar que el agente deje constancia de qué comprobó antes de dar por terminada una tarea o un change.

**Regla que refuerza**

No cerrar trabajo solo por intuición.

## Hook 6: advertir cuando un mismo encargo mezcla frontend y backend

**Intención**

Señalar encargos demasiado mezclados y sugerir separación por especialistas.

**Regla que refuerza**

Especialización por dominio y mejor consumo de tokens.

## Hook 7: bloquear acciones git sensibles sin confirmación explícita

**Intención**

Añadir una capa extra para acciones como commit, push, reset o borrado cuando el flujo lo requiera.

**Regla que refuerza**

Seguridad operativa y control humano.

## Cómo elegir

La decisión no es "usar hooks o no".
La decisión es cuáles aportan más valor con menos fricción.

Mi propuesta inicial para este proyecto sería empezar evaluando estos tres:

1. bloquear edición fuera de change aprobado,
2. bloquear `git push` sin checks previos,
3. advertir cuando un encargo mezcle frontend y backend.
