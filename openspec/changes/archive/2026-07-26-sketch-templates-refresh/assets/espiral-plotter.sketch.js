// Espiral de ruido Perlin para pen-plotter — el radio en cada ángulo se modula
// con noise() y crece vuelta a vuelta, generando un único trazo continuo y
// orgánico, sin auto-intersecciones bruscas. Pensado para dibujarse con pluma:
// sin relleno, un solo stroke, exportable a SVG real.

let params = {
  vueltas: 10,
  escala_ruido: 1,
  amplitud: 60,
  semilla: 42,
  grosor_trazo: 1.5,
}

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 640
  const h = window.__SKETCH__?.canvas?.height ?? 640
  createCanvas(w, h)
  noLoop()
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function draw() {
  background(255)
  trazarEspiral(window, width, height)
}

// Dibuja la espiral sobre cualquier objetivo con API de p5 (el propio sketch o
// un p5.Graphics offscreen para exportar a SVG) — misma geometría en ambos casos.
function trazarEspiral(g, w, h) {
  const cx = w / 2
  const cy = h / 2
  const pasosPorVuelta = 200
  const vueltas = Math.max(1, Math.round(params.vueltas))
  const pasosTotales = vueltas * pasosPorVuelta
  const radioMax = Math.min(w, h) / 2 - params.amplitud

  g.push()
  g.noFill()
  g.stroke(20)
  g.strokeWeight(params.grosor_trazo)
  g.beginShape()
  for (let i = 0; i <= pasosTotales; i++) {
    const t = i / pasosPorVuelta // vuelta fraccional (0..vueltas)
    const angulo = t * TWO_PI
    const radioBase = map(t, 0, vueltas, 0, radioMax)
    // El ruido se muestrea sobre un círculo unitario (no sobre el ángulo en
    // crudo) para que el patrón sea continuo al cerrar cada vuelta.
    const n = noise(
      (cos(angulo) * params.escala_ruido + params.semilla) * 0.5 + 0.5,
      (sin(angulo) * params.escala_ruido + params.semilla) * 0.5 + 0.5,
      t * 0.1
    )
    const radio = radioBase + (n - 0.5) * 2 * params.amplitud
    g.vertex(cx + cos(angulo) * radio, cy + sin(angulo) * radio)
  }
  g.endShape()
  g.pop()
}

// Extrae el <svg> real de un p5.Graphics creado con SVG como renderer.
// p5.js-svg NO lo expone en `g.elt` (eso es un objeto interno de la librería,
// no un nodo del DOM) sino en `g._renderer.svg`.
function extraerSVG(g) {
  const nodoSvg = g._renderer && g._renderer.svg
  if (!nodoSvg) return null
  return new XMLSerializer().serializeToString(nodoSvg)
}

window.__exportSVG = function () {
  const g = createGraphics(width, height, SVG)
  g.background(255)
  trazarEspiral(g, width, height)
  const svg = extraerSVG(g)
  g.remove()
  return svg
}

window.addEventListener('message', function (event) {
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
