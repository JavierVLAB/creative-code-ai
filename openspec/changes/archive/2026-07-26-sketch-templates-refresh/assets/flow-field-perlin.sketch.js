// Flow field de ruido Perlin — el clásico: un campo de ángulos derivado de
// noise(x, y) por el que se dejan avanzar muchas líneas cortas, dibujando el
// campo como una composición estática de trazos curvos.

let params = {
  n_lineas: 300,
  escala_ruido: 0.01,
  velocidad: 4,
  longitud_traza: 60,
  color_linea: '#2980b9',
}

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 640
  const h = window.__SKETCH__?.canvas?.height ?? 640
  createCanvas(w, h)
  noLoop()
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

// Ángulo del campo en (x, y): noise() mapeado a una vuelta completa
function anguloDelCampo(x, y) {
  return noise(x * params.escala_ruido, y * params.escala_ruido) * TWO_PI * 2
}

function draw() {
  background(255)
  noFill()
  stroke(params.color_linea)
  strokeWeight(1)

  const nLineas = Math.max(1, Math.round(params.n_lineas))
  const pasos = Math.max(1, Math.round(params.longitud_traza))

  for (let i = 0; i < nLineas; i++) {
    let x = random(width)
    let y = random(height)

    beginShape()
    vertex(x, y)
    for (let paso = 0; paso < pasos; paso++) {
      const angulo = anguloDelCampo(x, y)
      x += cos(angulo) * params.velocidad
      y += sin(angulo) * params.velocidad
      if (x < 0 || x > width || y < 0 || y > height) break
      vertex(x, y)
    }
    endShape()
  }
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
