## Why

Javi pide una plantilla nueva de creative coding: cuadrados con líneas dentro que se mueven libremente por el canvas, fondo negro y líneas blancas, con el número de cuadrados y el número de líneas por cuadrado como parámetros. Es una plantilla nueva de contenido para la biblioteca pública (`template-library`), del mismo tipo que las 4 añadidas en `2026-07-26-sketch-templates-refresh`, pero con una diferencia de comportamiento: requiere animación continua (`draw()` en loop), mientras que las plantillas existentes son composiciones estáticas con `noLoop()`.

## What Changes

- **Se añade 1 plantilla nueva** `p5js`: **Cuadrados de líneas en movimiento** (`cuadrados-lineas-libres`) — N cuadrados que se desplazan libremente por el canvas (rebotando en los bordes), cada uno relleno de M líneas paralelas. Fondo negro fijo, líneas blancas fijas (no configurables — es el criterio estético pedido explícitamente, no un parámetro).
- **Parámetros** (`config.yaml`): `num_cuadrados` (cuántos cuadrados), `num_lineas` (líneas por cuadrado), más `tamano_cuadrado` y `velocidad` como parámetros de apoyo razonables para que el movimiento sea controlable (a confirmar con Javi si se quieren o se recorta a los dos pedidos).
- **Sin `noLoop()`**: es la primera plantilla del proyecto con animación continua. No hace falta ningún cambio de `sketch-contract` — el patrón obligatorio ya soporta `draw()` en loop de forma nativa (el contrato no impone `noLoop()`, solo lo han usado así las plantillas previas); se documenta como precedente en `design.md`, no como cambio de contrato.
- **Migración de contenido**: `supabase/migrations/<timestamp>_add_cuadrados_lineas_libres_template.sql` — `insert into public.templates (...) on conflict (slug) do update`, mismo patrón que las migraciones de plantillas existentes.

## Capabilities

### Modified Capabilities
- `template-library`: se añade una plantilla nueva al contenido publicado; no cambia ningún requirement de comportamiento.

## Impact

- **Frontend**: ninguno (el runtime del iframe ya soporta `draw()` en loop de forma nativa; no se toca `SketchViewer.tsx`).
- **Backend**: ninguno.
- **Base de datos**: una migración nueva de `INSERT ... on conflict (slug) do update` (1 plantilla).
- **Contenido**: 1 `sketch.js` + `config.yaml` nuevos, a revisar con Javi antes de darlos por definitivos.
