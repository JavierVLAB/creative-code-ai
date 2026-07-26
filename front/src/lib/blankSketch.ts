// Punto de partida para un proyecto nuevo creado "en blanco".
// Cumple sketch-contract: canvas primero, `params` presente, listener postMessage
// obligatorio y emite SKETCH_READY — así el workspace no aterriza roto y el
// agente puede editarlo desde el primer turno (edit_params/edit_sketch validan
// la salida del LLM, no exigen que la entrada ya sea válida, pero un boilerplate
// vacío mal formado igual dejaría el iframe sin renderizar nada).
export const BLANK_CONFIG_YAML = `name: nuevo-sketch

modules:
  canvas:
    width: 600
    height: 600
`

export const BLANK_SKETCH_JS = `// Sketch vacío — listo para empezar desde cero o pedirle cambios al agente.
let params = {}

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function draw() {
  background(20)
}

window.addEventListener('message', function(event) {
  const msg = event.data
  if (msg.type === 'SKETCH_INIT' || msg.type === 'SKETCH_RESTART') {
    if (msg.values) Object.assign(params, msg.values)
    if (msg.config?.modules?.canvas) {
      resizeCanvas(msg.config.modules.canvas.width ?? width, msg.config.modules.canvas.height ?? height)
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
`
