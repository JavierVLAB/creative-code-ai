## 1. Plantilla: cuadrados de líneas en movimiento

- [x] 1.1 Escribir `sketch.js` (movimiento con rebote, ver `design.md`) y `config.yaml` (`num_cuadrados`, `num_lineas`, `tamano_cuadrado`, `velocidad`) — borrador en `assets/cuadrados-lineas-libres.*`
- [x] 1.2 Revisión creativa de Javi del resultado visual — aprobado, se mantienen `tamano_cuadrado`/`velocidad` como parámetros
- [x] 1.3 Probar manualmente cada parámetro en tiempo real — probado en el playground, aprobado

## 2. Migración de contenido

- [x] 2.1 Revisar una migración de plantillas ya aplicada (`20260726030000_add_refreshed_templates.sql`) para confirmar nombres exactos de columnas de `public.templates` — reales: `title`/`description` (no `titulo`/`descripcion`) y `tags` (array); `design.md` corregido
- [x] 2.2 Migración `supabase/migrations/20260728000000_add_cuadrados_lineas_libres_template.sql` con el `sketch.js`/`config.yaml` de la sección 1 (`on conflict (slug) do update`)
- [x] 2.3 Migración aplicada por Javi en el SQL Editor de Supabase

## 3. Specs

- [x] 3.1 `openspec/specs/template-library/spec.md`: no hace falta ningún requirement nuevo — es solo contenido, no comportamiento

## 4. Verificación final

- [x] 4.1 Probado manualmente por Javi en el navegador (playground): el sketch corre, los parámetros afectan el resultado en tiempo real, el movimiento se ve fluido — confirmado ("me parece bien")
