-- workspace-ui: los snapshots guardan una combinación de valores de parámetros
-- (posiciones de sliders/selects), no el código del sketch. Añadimos `values`
-- como JSONB para persistir ese preset y poder restaurarlo sin tocar sketch_js.
-- Las columnas sketch_js/config_yaml se mantienen por compatibilidad con el schema
-- inicial, pero el flujo de snapshots de parámetros usa solo `values`.
alter table public.snapshots
  add column values jsonb;
