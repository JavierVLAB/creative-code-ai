> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

**Prompt 2:**
# CurateArtAI — Registro de uso de IA

> Cómo se ha construido este proyecto con ayuda de IA, fase a fase.

## Nota de transparencia

Hasta ahora el proyecto es un prototipo para probar ideas, y no se conservaron los prompts que se fueron usando. Lo que sigue es una explicación del proceso seguido. La intención es que, después de esta entrega, se haga una refactorización con las decisiones ya tomadas y se concrete la app.

## Herramientas usadas

| Herramienta | Uso principal |
|---|---|
| **Claude** (chat) | Investigación, análisis competitivo, razonamiento de diseño y redacción. |
| **Claude Code** | Vibe coding del núcleo, sistema de agentes, refactor y documentación en el editor. |
| **OpenCode** | Agente de código open-source, usado al inicio para arrancar el proyecto y probar la herramienta. |
| **Gemini** | Investigación y generación complementaria. |
| **ChatGPT** | Investigación y exploración de ideas. |
| **Stitch (Google)** | Exploración de diseños de interfaz a partir de prompts, para ver direcciones visuales del front. |

---

## Fase 1 — Investigación y análisis competitivo

Con Claude, Gemini y ChatGPT se exploraron distintas ideas sobre arte generativo de código y se revisaron las herramientas que ya existen (p5.js Web Editor, Hydra, Cables.gg, TouchDesigner, ArtKit) para buscar inspiración y ver qué aportaban y qué faltaba.

---

## Fase 2 — Exploración de interfaz con Stitch

Antes de escribir código, se usó Stitch (Google) para generar varias direcciones visuales del front y decidir el lenguaje de la interfaz; de las propuestas se quedaron los elementos que encajaban. También se miraron algunas referencias clave, sobre todo https://visu.haus/ y https://artkit.cc/.

---

## Fase 3 — Vibe coding del núcleo

Con Claude Code y OpenCode se montó el bucle central: un sketch de p5.js corriendo en un iframe, el formato de configuración, los controles que se generan solos y la actualización en tiempo real. El contrato entre `config.yaml`, `window.__SKETCH__` y `postMessage` se fue decidiendo y afinando a mano hasta que quedó estable. Gran parte del trabajo de interfaz fue ir iterando poco a poco; no salió de una sola vez.

Esto ha llevado un buen tiempo, basicamente le dimos muchas vueltas porque no me gustaban los resultados, la distribucion, colores, etc.

Por otro lado en esta etapa, se definio un layout, donde colocar la visualizacion de los borradores, donde poner los parametros, donde poner el ide integrado.

---

## Fase 4 — Sistema de agentes

Con Claude Code se montó el agente que edita el sketch en lenguaje natural: las tools para editar parámetros y código, la salida estructurada y el workflow de guardrails. Las reglas de los guardrails fueron saliendo de ver dónde el agente se quedaba en bucle o dejaba cambios a medias, y se ajustaron a mano.

Esta etapa fue muy frustrante, al principio se probo directamente conectar el front con un llm, esto funciono relativamente bien, luego se intento usar un sistema agentico, esto llevo muchas iteraciones, era mas complicado hacer que hiciera bien los nuevos borradores, que sacara bien el formato, o hiciera bien los cambios.

Pero ahora vamos a integrar Mastra como gestor de agentes, ya que me urge conocer esta plataforma y conectarla con supabase.

---

## Fase 5 — Generación de proyectos de ejemplo

Se hicieron varios sketches distintos (ruido Perlin, partículas, geometría generativa) para probar el sistema de principio a fin y comprobar que el contrato y el agente aguantaban casos variados. Se quedaron los ejemplos que mejor cubrían distintos tipos de parámetro y se arreglaron a mano los que rompían el contrato del iframe.

---

## Fase 6 — Documentación

Con Claude Code se redactó la documentación de producto y diseño técnico a partir de los specs anteriores. Varias secciones se reescribieron porque no se entendían bien o porque metían justificaciones inventadas. Las decisiones de fondo (separación entre exploración y código, alcance del MVP, stack, la memoria en Mastra sobre Supabase) las tomó el criterio humano; la IA redactó y revisó a partir de ahí.



---

