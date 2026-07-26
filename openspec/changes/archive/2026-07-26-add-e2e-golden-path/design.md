## Context

El proyecto no tiene Supabase local (no hay `supabase start`/emulador — `supabase/` solo contiene `migrations/`, aplicadas a mano vía SQL Editor según memoria del proyecto). Los tests E2E, por tanto, corren contra un proyecto Supabase real (el mismo de desarrollo), no contra un emulador aislado. Esto condiciona cómo se autentica el test y cómo se limpian los datos que crea.

`testing-patterns` ya fija Playwright como herramienta. No existe todavía ninguna carpeta de test E2E ni configuración.

## Goals / Non-Goals

**Goals:**
- Dejar corriendo un primer test E2E real y determinista del golden path: login → crear proyecto desde plantilla → workspace → interacción con un control → verificación de reactividad del sketch.
- Dejar una estructura reusable (config Playwright, fixture de auth, limpieza de datos) para que los próximos E2E (ej. creación vía IA, plantillas) se añadan sin repensar la base.
- Mantener el test ejecutable localmente por Javi con un comando explícito, sin arrancar servidores por sí solo el agente.

**Non-Goals:**
- Integración en CI (queda para un change posterior).
- Cobertura del flujo de creación desde IA o desde plantilla (candidatos para siguientes E2E).
- Emulador local de Supabase — se asume el proyecto Supabase de desarrollo existente.

## Decisions

### 1. Ubicación: `front/e2e/`, no una carpeta `e2e/` en la raíz
`directory-structure` fija `front/`, `backend/`, `shared/` como únicos directorios de primer nivel. El test E2E ejercita exclusivamente el frontend (UI + Supabase + backend Mastra ya corriendo), así que vive dentro de `front/e2e/`, con su propio `playwright.config.ts`, separado de `front/src/**/*.test.ts` (Vitest). Alternativa descartada: carpeta `e2e/` en la raíz — rompería la convención de 3 directorios sin necesidad real (Playwright soporta perfectamente vivir dentro de `front/`).

### 2. Playwright no arranca servidores (`webServer` no configurado)
Dado que ni yo ni el agente debemos lanzar servidores de larga duración, `playwright.config.ts` NO define `webServer`. El test asume que Javi ya tiene corriendo `pnpm dev` en `front/` (puerto 5173) y el backend Mastra en local. `baseURL` se toma de `process.env.E2E_BASE_URL` con default `http://localhost:5173`. Se documenta en un README corto dentro de `e2e/` qué debe estar corriendo antes de ejecutar `pnpm test:e2e`.

### 3. Usuario de test y limpieza de datos
Sin emulador local, dos opciones:

- **Opción A (recomendada): usuario de test fijo, pre-creado a mano en el Supabase de desarrollo.** Credenciales vía `E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD` en `.env.e2e` (no versionado). El fixture de Playwright hace login real contra la UI (`/login`) una vez por sesión de tests y reutiliza el `storageState`. Es el enfoque más simple, no requiere `SUPABASE_SECRET_KEY` en el entorno de test, y refleja el comportamiento real de un usuario.
- **Opción B: aprovisionar/borrar usuario por test vía Admin API.** Requiere `SUPABASE_SECRET_KEY` en el entorno de E2E (clave privilegiada), añade complejidad y un vector más para manejar credenciales sensibles en local, a cambio de aislamiento total entre corridas.

Se recomienda la **Opción A**. Limpieza de datos: el propio test borra el proyecto creado al finalizar (usando la función de "eliminar proyecto" ya existente en la UI, ejercitando así también ese flujo), sin necesidad de acceso admin.

**Decidido: Opción A.** Javi crea el usuario de test en el Supabase de desarrollo y escribe las credenciales directamente en `front/.env.e2e` (no versionado) — el agente no maneja ni ve el password en texto plano. El agente solo prepara `front/.env.e2e.example` con las claves esperadas, sin valores.

### 4. Selectores de test
Se usarán atributos `data-testid` explícitos en los elementos clave del golden path (botón "Crear proyecto", input de nombre, slider de control, iframe del sketch) en lugar de depender de texto o clases CSS, para no acoplar el test a copy o estilos. Esto implica tocar mínimamente los componentes de `project-library` y `sketch-workspace` para añadir esos atributos donde falten — se listará en `tasks.md` como pasos explícitos y acotados.

### 5b. Origen del proyecto de test: "desde plantilla", no "en blanco"
Al revisar `useProjects.ts` y `blankSketch.ts` se descubrió que un proyecto creado con origen "en blanco" nunca tiene controles: su `config.yaml` solo define el canvas, sin ningún módulo `type: range` (a propósito, para cumplir `sketch-contract` con un boilerplate mínimo). El "sketch demo con slider" de `sketch-workspace` solo aparece cuando `sketch_js` es `null` en la base de datos, algo que el flujo normal de creación nunca produce. Por tanto, el golden path no puede verificar reactividad de un control usando el origen "en blanco".

Decisión: el test crea el proyecto con origen **"desde plantilla"**, seleccionando **la primera plantilla publicada disponible** (sin fijar un nombre concreto), y localiza el **primer control `slider` que exponga esa plantilla** (sin fijar un `key` de parámetro concreto). Esto se apoya en la garantía de `template-library`: el sistema SHALL tener siempre al menos las plantillas iniciales publicadas. No fijar nombre de plantilla ni `key` de parámetro evita que el test se rompa si el catálogo de plantillas cambia (ya ha habido más de una migración de refresco de plantillas).

### 5. Verificación de reactividad del sketch sin acceso al DOM del iframe
El iframe es `sandbox="allow-scripts"` y aislado (`sketch-workspace`). El test no puede inspeccionar el canvas p5.js directamente de forma fiable multiplataforma. Se verifica la reactividad de forma indirecta y determinista: se intercepta el `postMessage` saliente de la app hacia el iframe (`SKETCH_UPDATE`) inyectando un listener vía `page.evaluate` antes de mover el slider, y se comprueba que el mensaje se emite con el valor esperado. Esto valida el contrato documentado en `sketch-workspace` sin depender de renderizado de canvas.

## Risks / Trade-offs

- **[Riesgo] Test corre contra Supabase real de desarrollo, no un sandbox aislado** → Mitigación: usuario de test dedicado, el test limpia lo que crea, y se documenta que no debe correr contra producción.
- **[Riesgo] Sin `webServer`, el test falla con un error confuso si Javi olvida levantar `pnpm dev`** → Mitigación: chequeo previo en el test (o en un script wrapper) que valida que `baseURL` responde antes de correr la suite, con mensaje claro.
- **[Riesgo] Flakiness por timing del iframe (`SKETCH_READY` async)** → Mitigación: esperar explícitamente el evento antes de interactuar, con timeout generoso y mensaje de fallo descriptivo.

## Decisiones confirmadas

- Autenticación: Opción A. Javi crea el usuario de test en Supabase y escribe las credenciales él mismo en `front/.env.e2e`; el agente solo genera el `.env.e2e.example` con las claves sin valores.
- Ejecución: manual por ahora, sin ningún hook ni paso automático (ej. pre-push). Coherente con el non-goal de CI de este change.
