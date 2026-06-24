## Why

El change `frontend-base` construyó todos los componentes del frontend usando clases de Tailwind CSS (`bg-gray-900`, `border-gray-700`, `rounded-md`, etc.). El proyecto original CurateArtAI tiene un sistema de diseño propio basado en **CSS custom properties** (`--bg0`, `--t1`, `--space-3`, `--radius-sm`) con **inline styles en React** — un sistema que permite cambiar el tema globalmente modificando solo el bloque `:root` en `index.css`.

Mezclar los dos sistemas es inviable a largo plazo: los tokens CSS no afectan las clases de Tailwind, lo que significa que cambiar el tema rompería solo la mitad de la UI.

## What Changes

- Reemplazar `front/src/index.css` con los tokens del proyecto original
- Reescribir todos los componentes del change `frontend-base` para usar inline styles con variables CSS en lugar de clases Tailwind
- El resultado visual debe ser idéntico al sistema de diseño del proyecto original: oscuro, minimalista, con la paleta `--bg0..--bg3` y escala de grises `--t1..--t3`

## Capabilities

### New Capabilities

<!-- ninguna — este change no añade funcionalidad nueva -->

### Modified Capabilities

- `design-tokens`: `index.css` pasa a ser la única fuente de verdad del tema visual. Cambiar un token en `:root` afecta a toda la UI.
- Todos los componentes de `frontend-base` adaptados al sistema de diseño.

## Impact

- **Modificados:** `front/src/index.css` y todos los componentes de `front/src/` creados en `frontend-base`
- **Sin cambios funcionales:** el comportamiento (auth, proyectos, workspace, controles) permanece exactamente igual
- **Sin dependencias nuevas:** no se instala nada, se elimina la dependencia implícita de los colores de Tailwind
