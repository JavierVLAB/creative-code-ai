## 1. Dependencias y configuración

- [x] 1.1 Instalar `react-router-dom`, `@supabase/supabase-js`, `js-yaml` y sus tipos en `front/`
- [x] 1.2 Verificar variables de entorno en `front/.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)

## 2. Cliente Supabase y tipos

- [x] 2.1 Crear `front/src/lib/supabase.ts` con `createBrowserSupabase()` y singleton `supabase`
- [x] 2.2 Generar tipos TypeScript desde Supabase (`supabase gen types`) y guardar en `front/src/lib/database.types.ts`

## 3. Auth — hooks y componentes base

- [x] 3.1 Crear `front/src/hooks/useSession.ts` (getSession + onAuthStateChange)
- [x] 3.2 Crear `front/src/components/auth/ProtectedRoute.tsx` (redirige a /login si no hay sesión)
- [x] 3.3 Crear `front/src/components/auth/LoadingScreen.tsx` (spinner mientras carga sesión)

## 4. Router y páginas shell

- [x] 4.1 Configurar `createBrowserRouter` en `front/src/main.tsx` con rutas `/login`, `/signup`, `/app`, `/app/projects/:id`
- [x] 4.2 Crear `front/src/pages/LoginPage.tsx` con formulario email+contraseña → `supabase.auth.signInWithPassword()`
- [x] 4.3 Crear `front/src/pages/SignupPage.tsx` con formulario email+contraseña → `supabase.auth.signUp()`
- [x] 4.4 Crear `front/src/components/layout/AppShell.tsx` con NavBar (nombre usuario + botón logout)
- [x] 4.5 Redirigir `/` → `/app` en el router

## 5. Biblioteca de proyectos

- [x] 5.1 Crear `front/src/hooks/useProjects.ts` (lista proyectos del usuario, crear, eliminar)
- [x] 5.2 Crear `front/src/pages/ProjectsPage.tsx` con lista de proyectos y estado vacío
- [x] 5.3 Crear `front/src/components/projects/ProjectCard.tsx` (nombre, fecha, enlace al workspace)
- [x] 5.4 Crear `front/src/components/projects/CreateProjectDialog.tsx` (input nombre + botón crear)
- [x] 5.5 Añadir diálogo de confirmación para eliminar proyecto

## 6. Parser de controles desde config.yaml

- [x] 6.1 Crear `front/src/lib/yaml.ts` con `parseSketchConfig(yamlText: string)` → config tipado
- [x] 6.2 Crear `front/src/lib/controls.ts` con `generateControls(config)` → `SliderControl[] | SelectControl[]`
- [x] 6.3 Definir tipos `SliderControl`, `SelectControl`, `SketchConfig` en `front/src/lib/types.ts`

## 7. Workspace — visor del sketch

- [x] 7.1 Crear `front/src/hooks/useSketch.ts` (gestiona estado del iframe, envía postMessage, recibe SKETCH_READY / SKETCH_ERROR)
- [x] 7.2 Crear `front/src/components/workspace/SketchViewer.tsx` (iframe con srcdoc, sandbox, ref)
- [x] 7.3 Implementar sketch de demo (p5.js, círculo con parámetro `radius`) como fallback cuando el proyecto no tiene sketch
- [x] 7.4 Crear `front/src/pages/WorkspacePage.tsx` (carga proyecto, pasa config al viewer y al panel de controles)

## 8. Workspace — panel de controles

- [x] 8.1 Crear `front/src/components/workspace/ControlPanel.tsx` (itera controles, envía SKETCH_UPDATE al mover)
- [x] 8.2 Crear `front/src/components/workspace/ControlSlider.tsx` (slider HTML nativo con label y valor)
- [x] 8.3 Crear `front/src/components/workspace/ControlSelect.tsx` (chips o swatches según si los valores son hex)
- [x] 8.4 Crear `front/src/components/workspace/ChatPlaceholder.tsx` (panel con texto "Agente próximamente")

## 9. Tests

- [x] 9.1 `front/src/lib/yaml.test.ts` — `parseSketchConfig()`: YAML válido devuelve config tipado; YAML inválido lanza error; campo `canvas` ausente lanza error
- [x] 9.2 `front/src/lib/controls.test.ts` — `generateControls()`: módulo `range` genera `SliderControl`; módulo `select` con valores hex genera `SelectControl` con `isColor: true`; módulo `select` sin hex genera `SelectControl` con `isColor: false`; módulo `canvas` se ignora (no genera control)
- [x] 9.3 Ejecutar `pnpm test` en `front/` y verificar que todos los tests pasan

## 10. Verificación

- [x] 9.1 Flujo completo: registro → biblioteca vacía → crear proyecto → workspace → logout → login → proyecto persiste
- [x] 9.2 Verificar que usuario B no puede leer proyectos de usuario A (test manual de RLS)
- [x] 9.3 Verificar que los controles actualizan el sketch en tiempo real sin recargar el iframe
- [x] 9.4 Ejecutar `tsc --noEmit` sin errores en `front/`
