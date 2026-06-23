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
```

### Reglas

- `type: range` → genera un slider. `default` es un número dentro de [min, max].
- `type: select` → genera chips de selección. `default` debe ser uno de los `value` definidos.
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
