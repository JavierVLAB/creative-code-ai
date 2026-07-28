## Decisión: animación continua sin `noLoop()` — primer precedente del proyecto

Las 7 plantillas existentes (`demo`, `bezier-noise`, `particulas`, y las 4 de `sketch-templates-refresh`) son composiciones estáticas: dibujan una vez en `setup()`/primer `draw()` y llaman `noLoop()`. Esta plantilla pide movimiento libre y continuo, así que `draw()` corre en loop normal de p5 (sin `noLoop()`).

Esto no requiere ningún cambio en `sketch-contract`: el patrón obligatorio (`setup()` + listener `postMessage`) no asume ni impone `noLoop()` — es una elección que han hecho las plantillas anteriores, no una regla del contrato. El único cuidado nuevo es de rendimiento en el playground público (múltiples pestañas con sketches en loop indefinido): se acota `num_cuadrados` a un máximo razonable en `config.yaml` (ver abajo) para que el coste de dibujar `num_cuadrados * num_lineas` segmentos por frame se mantenga bajo incluso en el peor caso.

## Diseño del sketch

### Modelo de movimiento

Cada cuadrado tiene posición `(x, y)` y velocidad `(vx, vy)` inicializadas al azar (`random(-1, 1)` normalizada, escalada por `velocidad`). En cada `draw()`:

1. Actualizar `x += vx`, `y += vy`.
2. Rebote en los bordes del canvas: si el cuadrado (considerando su `tamano_cuadrado`) cruza un borde, se invierte el signo de la componente de velocidad correspondiente y se recorta la posición al límite (evita que se "escape" del canvas por acumulación de un solo frame).
3. Dibujar el cuadrado: `num_lineas` líneas horizontales paralelas, equiespaciadas dentro del área `tamano_cuadrado x tamano_cuadrado`, en el sistema de coordenadas local del cuadrado (`translate(x, y)` antes de dibujar).

No hay rotación ni colisión entre cuadrados — el pedido es "se mueven libremente", no una simulación física con colisiones; se deja como posible mejora futura si Javi la pide.

### Parámetros (`config.yaml`)

```yaml
name: cuadrados-lineas-libres

modules:
  canvas:
    width: 640
    height: 640

  num_cuadrados:
    type: range
    label: Número de cuadrados
    min: 1
    max: 40
    step: 1
    default: 10

  num_lineas:
    type: range
    label: Líneas por cuadrado
    min: 1
    max: 20
    step: 1
    default: 5

  tamano_cuadrado:
    type: range
    label: Tamaño de cuadrado
    min: 20
    max: 200
    step: 5
    default: 80

  velocidad:
    type: range
    label: Velocidad
    min: 0.2
    max: 6
    step: 0.1
    default: 1.5
```

**Nota de incertidumbre**: `tamano_cuadrado` y `velocidad` no los pidió Javi explícitamente (solo pidió `num_cuadrados` y `num_lineas`) — se añaden porque sin control de tamaño y velocidad el resultado visual es poco ajustable y el pedido dice "se mueven libremente" (implica que la velocidad importa). Se marcan para confirmación en la revisión creativa (tarea 1.2); si Javi prefiere solo los dos parámetros pedidos, se eliminan y quedan como constantes internas.

Fondo negro y líneas blancas van fijos en el código (`background(0)`, `stroke(255)`), no como parámetros — es el criterio estético pedido explícitamente por Javi para esta plantilla, no una opción a variar.

### Reinicio de posiciones al cambiar `num_cuadrados`

Igual que `mosaico-arcos` regenera su grid solo cuando cambia `tamano_grid`, aquí el array de cuadrados (posición/velocidad) se regenera solo cuando cambia `num_cuadrados` (se añaden/quitan cuadrados nuevos con posición aleatoria) — así mover el slider de `num_lineas`, `tamano_cuadrado` o `velocidad` no reinicia el movimiento en curso de los cuadrados ya existentes. `velocidad` sí debe poder afectar el movimiento en curso: se aplica como multiplicador en cada frame (no al crear el cuadrado), para que mover ese slider cambie la velocidad visible sin resetear posiciones.

### `SKETCH_READY` / `SKETCH_ERROR`

Igual que el resto de plantillas: se emite `SKETCH_READY` al final de `setup()`, y cualquier error se captura y emite como `SKETCH_ERROR` con `message`.

## Migración de contenido

`supabase/migrations/<timestamp>_add_cuadrados_lineas_libres_template.sql`:

```sql
insert into public.templates (slug, title, description, sketch_js, config_yaml, renderer, tags, is_published)
values (
  'cuadrados-lineas-libres',
  'Cuadrados en movimiento',
  'Cuadrados de líneas blancas que se mueven libremente sobre fondo negro.',
  $sketch$ ... $sketch$,
  $config$ ... $config$,
  'p5js',
  array['p5js', 'animacion', 'movimiento', 'lineas'],
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  sketch_js = excluded.sketch_js,
  config_yaml = excluded.config_yaml,
  renderer = excluded.renderer,
  tags = excluded.tags,
  is_published = excluded.is_published,
  updated_at = now();
```

Confirmado contra `supabase/migrations/20260726030000_add_refreshed_templates.sql`: columnas reales son `title`/`description` (no `titulo`/`descripcion`) y existe además `tags` (array de texto).

## Fuera de alcance (explícito)

- Colisiones entre cuadrados o con el cursor.
- Rotación de los cuadrados.
- Color configurable (fondo/líneas fijos por pedido explícito).
- Exportación SVG (es una animación continua, no una composición estática — no aplica el patrón de `__exportSVG` usado en plantillas estáticas).
