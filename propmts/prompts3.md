# CurateArtAI — Resumen de sesión (20-jul-2026)

En esta sesión reforzamos el arnés del proyecto antes de pasar al trabajo por pull requests.

Hicimos tres cosas principales:

- reorganizamos `AGENTS.md`, `CLAUDE.md` y `.agents/` para separar contrato del proyecto, operación diaria y playbooks reutilizables;
- redefinimos los subagentes como especialistas por dominio, no como agentes genéricos;
- ampliamos el catálogo de skills y añadimos hooks de advertencia para OpenSpec.

También se implementó el hook compartible en `.claude/settings.json`, con el script en `.claude/hooks/warn_openspec_scope.py`. El comportamiento es no bloqueante: avisa si se edita sin change activo o fuera del scope inferido.

---

# Sesión 21 julio 2026 — Snapshot Grid & Curation

## Cambio implementado: `snapshot-grid-curation`

Añadir vista de cuadrícula de snapshots con previews visuales, selección múltiple, favoritas y borrado.

### Lo que se hizo

- **Migración SQL**: columna `preview_url` en tabla `snapshots`
- **Bucket Supabase**: `snapshot-previews` creado manualmente desde el dashboard (RLS con policies por usuario)
- **Captura de previews**: postMessage desde el iframe — el sketch captura su propio canvas y lo devuelve al padre. Reintenta hasta 5 veces si el canvas no está listo
- **SnapshotGrid**: grid de miniaturas (160px fijos, centrado). Checkbox para selección, estrella persistente en favoritas, hover con acciones
- **Selección múltiple**: check siempre añade/quita de la selección. Cmd/Ctrl + click en imagen selecciona sin cargar
- **Borrado bulk**: indicador flotante abajo al centro (contador + Cancelar + Borrar) con ConfirmDialog
- **Favoritos**: estado local (Set de IDs). Estrella amarilla persistente en cards marcadas
- **Navegación**: botón "Grid" en SnapshotsPanel para entrar al grid, botón lápiz flotante para volver al sketch
- **Sidebar**: prop `showControls` para ocultar ParamsControls en modo grid

