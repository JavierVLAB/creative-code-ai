## Context

El proyecto original en `/Users/javiervillarroel/Documents/Proyectos/curateartai/app/src/index.css` define un sistema completo de tokens CSS. Los componentes de `frontend-base` usan clases Tailwind que hay que sustituir por inline styles con esas variables.

## Goals / Non-Goals

**Goals:**
- `index.css` con todos los tokens del sistema de diseño original
- Todos los componentes usando inline styles con variables CSS
- Estética coherente con el proyecto original: fondo `#1a1a1a`, texto `#f0f0f0`, bordes `#3a3a3a`

**Non-Goals:**
- Cambiar comportamiento, lógica o estructura de componentes
- Modificar hooks, lib, o archivos que no tienen estilos
- Añadir nuevos componentes

## Decisions

### 1. Inline styles, no clases Tailwind

Los componentes usarán `style={{ ... }}` con referencias a variables CSS (`var(--bg1)`, `var(--t2)`, etc.). Tailwind sigue importado en `index.css` como reset global, pero no se usan sus utilidades de color/espaciado/tipografía.

Alternativa descartada: mapear tokens a Tailwind v4 — más verboso sin ganancia real.

### 2. Hover states con `onMouseEnter`/`onMouseLeave`

CSS inline no soporta `:hover`. Los estados hover se gestionan con `useState` local o `onMouseEnter`/`onMouseLeave` donde sean visualmente relevantes (botones, tarjetas, links de nav).

### 3. Referencia visual: proyecto original

Para cada componente, la referencia de qué tokens usar es el componente equivalente del proyecto original. Los tokens ya están documentados en la auditoría.

## Token reference

```
Fondos:   --bg0 #1a1a1a  --bg1 #242424  --bg2 #2c2c2c  --bg3 #333333
Texto:    --t1 #f0f0f0   --t2 #b4b4b4   --t3 #707070
Bordes:   --line #3a3a3a
Radio:    --radius-sm 6px  --radius-md 8px  --radius-lg 12px
Espacio:  --space-1 4px .. --space-6 24px
Sombra:   --shadow-sm  --shadow-md
Trans:    --transition-fast 0.1s
```

## Estructura de componentes a migrar

```
front/src/index.css                              ← tokens CSS
front/src/components/auth/LoadingScreen.tsx      ← spinner centrado
front/src/components/auth/ProtectedRoute.tsx     ← sin estilos propios
front/src/components/layout/AppShell.tsx         ← topbar + outlet
front/src/pages/LoginPage.tsx                    ← formulario centrado
front/src/pages/SignupPage.tsx                   ← formulario centrado
front/src/pages/ProjectsPage.tsx                 ← grid de proyectos
front/src/components/projects/ProjectCard.tsx    ← tarjeta de proyecto
front/src/components/projects/CreateProjectDialog.tsx  ← modal
front/src/components/workspace/SketchViewer.tsx  ← iframe + overlay
front/src/components/workspace/ControlPanel.tsx  ← lista de controles
front/src/components/workspace/ControlSlider.tsx ← slider nativo
front/src/components/workspace/ControlSelect.tsx ← chips/swatches
front/src/components/workspace/ChatPlaceholder.tsx ← placeholder
front/src/pages/WorkspacePage.tsx                ← layout workspace
```
