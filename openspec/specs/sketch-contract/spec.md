# Spec: sketch-contract

El contrato que define cómo el sketch se comunica con la app y cómo se estructuran sus archivos.
Este contrato es inmutable por diseño — cambiarlo afecta a todos los sketches existentes.

---

## config.yaml — Formato de configuración

config.yaml describe el canvas y los parámetros del sketch. La app lo parsea para generar controles visuales automáticamente.

### Estructura

```yaml
name: nombre-del-sketch

modules:
  canvas:
    width: 800
    height: 800

  nombre_parametro:
    type: range          # slider numérico
    label: Etiqueta visible
    min: 0
    max: 100
    step: 1
    default: 50

  otro_parametro:
    type: select         # selector de opciones (chips o swatches)
    label: Etiqueta visible
    options:
      - label: Opción A
        value: opcion_a
      - label: Opción B
        value: opcion_b
    default: opcion_a

  otro_parametro_imagen:
    type: image          # subida/selección de imagen
    label: Etiqueta visible
```

### Reglas

- `type: range` → genera un slider. `default` es un número dentro de [min, max].
- `type: select` → genera chips de selección. `default` debe ser uno de los `value` definidos.
- `type: image` → genera un control de subida/selección de imagen (ver `sketch-workspace`). No lleva `min`/`max`/`options`/`default`. El sketch recibe siempre un **string URL** (http(s) o data URL) en `params.<nombre_parametro>`, nunca un objeto `File`; usarlo con `loadImage(url, cb)`. Valor inicial: cadena vacía si el usuario no ha subido ni elegido ninguna imagen.
- Si las opciones son colores hexadecimales, la UI renderiza swatches en vez de chips.
- Las etiquetas (`label`) van en español.
- El canvas es siempre el primer módulo.

---

## sketch.js — Contrato del código

Todo sketch DEBE seguir este patrón para que los controles funcionen en tiempo real.

### Patrón obligatorio

```js
// Valores por defecto — se sobreescriben por postMessage al cargarse
let params = {
  mi_param: 100,
  otro_param: '#ff0000',
}

function setup() {
  // Leer valores iniciales si ya están disponibles
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
}

// Listener postMessage — imprescindible para que los controles actualicen en tiempo real
window.addEventListener('message', function(event) {
  const msg = event.data
  if (msg.type === 'SKETCH_INIT' || msg.type === 'SKETCH_RESTART') {
    if (msg.values) Object.assign(params, msg.values)
    if (msg.config?.modules?.canvas) {
      resizeCanvas(
        msg.config.modules.canvas.width ?? width,
        msg.config.modules.canvas.height ?? height
      )
    }
    redraw()
    return
  }
  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    redraw()
    return
  }
})
```

### Reglas

- Todos los valores visuales (tamaños, colores, velocidades, cantidades) vienen de `params`, nunca hardcodeados.
- Las claves de `params` deben coincidir exactamente con los nombres de módulos en config.yaml.
- Los comentarios en el código van en español.
- El sketch emite `SKETCH_READY` cuando está listo: `window.parent.postMessage({ type: 'SKETCH_READY' }, '*')`
- Si ocurre un error: `window.parent.postMessage({ type: 'SKETCH_ERROR', message: err.message }, '*')`

---

## Protocolo postMessage — App ↔ iframe

### App → iframe

| Mensaje | Cuándo | Payload |
|---------|--------|---------|
| `SKETCH_INIT` | Al montar el iframe | `{ config, values }` |
| `SKETCH_UPDATE` | Al mover un control en tiempo real | `{ values }` |
| `SKETCH_RESTART` | Al cambiar el canvas (width/height) | `{ config, values }` |

### iframe → App

| Mensaje | Cuándo |
|---------|--------|
| `SKETCH_READY` | El sketch montó correctamente |
| `SKETCH_ERROR` | Ocurrió un error. Payload: `{ message: string }` |

### Reglas

- El iframe es sandboxed — el sketch no puede acceder a la app ni a los datos del usuario.
- Los mensajes se envían a `'*'` (origen no restringido dentro del iframe aislado).
- La app solo procesa mensajes de su propio iframe, verificando `event.source === iframeRef.current?.contentWindow`.
- Un error del sketch se muestra en la UI sin romper la app.

---

## Detección del renderer

El renderer se infiere del código del sketch, sin que el usuario lo declare:

- Si `sketch.js` contiene `THREE` → renderer `threejs`
- Si no → renderer `p5js`

Esta detección la hace la app antes de pasar el sketch al agente.

---

## Addon p5.js-svg — exportación vectorial opcional

El runtime del iframe carga, además de `p5.js`, el addon [`p5.js-svg`](https://github.com/zenozeng/p5.js-svg) vía CDN. Es una capacidad **aditiva y opcional**: ningún sketch existente que no la use se ve afectado.

- Un sketch puede pedir `createCanvas(w, h, SVG)` o `createGraphics(w, h, SVG)` para dibujar sobre un lienzo vectorial real.
- Para ofrecer exportación de archivo, el sketch expone `window.__exportSVG(): string`, que devuelve el SVG serializado del `createGraphics(..., SVG)` correspondiente. La app lo invoca a través del protocolo `EXPORT_SVG`/`EXPORTED_SVG` (ver `sketch-workspace`) — nunca se descarga el archivo directamente desde dentro del iframe sandboxed.
