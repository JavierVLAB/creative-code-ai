## 1. Tokens CSS

- [ ] 1.1 Reemplazar `front/src/index.css` con los tokens del proyecto original (copiar de `/Users/javiervillarroel/Documents/Proyectos/curateartai/app/src/index.css`)

## 2. Auth y layout base

- [ ] 2.1 Reescribir `front/src/components/auth/LoadingScreen.tsx` — spinner centrado sobre `--bg0`
- [ ] 2.2 Reescribir `front/src/components/layout/AppShell.tsx` — topbar con `--bg1`, borde `--line`, logout con color `--t2`

## 3. Páginas de auth

- [ ] 3.1 Reescribir `front/src/pages/LoginPage.tsx` — formulario centrado, inputs con `--bg2`/`--line`, botón primario `--t1`/`--bg0`
- [ ] 3.2 Reescribir `front/src/pages/SignupPage.tsx` — igual que LoginPage

## 4. Biblioteca de proyectos

- [ ] 4.1 Reescribir `front/src/components/projects/ProjectCard.tsx` — card con `--bg1`, borde `--line`, hover `--bg2`
- [ ] 4.2 Reescribir `front/src/components/projects/CreateProjectDialog.tsx` — modal con overlay `rgba(0,0,0,0.72)`, backdrop-filter blur, contenedor `--bg1`
- [ ] 4.3 Reescribir `front/src/pages/ProjectsPage.tsx` — header, grid, estado vacío, diálogo de confirmación de borrado

## 5. Workspace

- [ ] 5.1 Reescribir `front/src/components/workspace/ControlSlider.tsx` — label `--t2`, valor `--t2`, slider nativo ya estilizado por el CSS global
- [ ] 5.2 Reescribir `front/src/components/workspace/ControlSelect.tsx` — chips con `--bg0`/`--bg3`, swatches con borde `--t1` al seleccionar
- [ ] 5.3 Reescribir `front/src/components/workspace/ControlPanel.tsx` — fondo `--bg1`, padding con `--padding-section`
- [ ] 5.4 Reescribir `front/src/components/workspace/ChatPlaceholder.tsx` — borde superior `--line`, texto `--t3`
- [ ] 5.5 Reescribir `front/src/components/workspace/SketchViewer.tsx` — fondo `--bg0`, overlay de carga, mensaje de error
- [ ] 5.6 Reescribir `front/src/pages/WorkspacePage.tsx` — layout flex, borde separador `--line`

## 6. Verificación

- [ ] 6.1 Ejecutar `pnpm test` — todos los tests deben seguir pasando (los estilos no afectan la lógica)
- [ ] 6.2 Ejecutar `npx tsc --noEmit` desde `front/` — sin errores de TypeScript
- [ ] 6.3 Arrancar `pnpm dev` y verificar visualmente: login, biblioteca vacía, workspace con sketch de demo
