// Cuadrados de líneas en movimiento — N cuadrados rellenos de líneas paralelas
// blancas, que se desplazan libremente por el canvas negro y rebotan en los
// bordes. Primera plantilla del proyecto con animación continua (sin
// noLoop()) — ver design.md del change para el porqué.

let params = {
  num_cuadrados: 10,
  num_lineas: 5,
  tamano_cuadrado: 80,
  velocidad: 1.5,
}

// Cuadrados vivos: { x, y, dx, dy } con dx/dy normalizados (magnitud 1),
// la velocidad real se aplica como multiplicador en cada frame para que
// mover el slider de velocidad no reinicie el movimiento en curso.
let cuadrados = []
let ultimoNumCuadrados = null

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 640
  const h = window.__SKETCH__?.canvas?.height ?? 640
  createCanvas(w, h)
  regenerarCuadradosSiHaceFalta()
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function regenerarCuadradosSiHaceFalta() {
  const n = Math.max(1, Math.round(params.num_cuadrados))
  if (n === ultimoNumCuadrados) return
  ultimoNumCuadrados = n

  cuadrados = []
  for (let i = 0; i < n; i++) {
    const angulo = random(TWO_PI)
    cuadrados.push({
      x: random(width),
      y: random(height),
      dx: cos(angulo),
      dy: sin(angulo),
    })
  }
}

function draw() {
  background(0)

  const s = params.tamano_cuadrado
  const mitad = s / 2

  for (const c of cuadrados) {
    c.x += c.dx * params.velocidad
    c.y += c.dy * params.velocidad

    if (c.x - mitad < 0 || c.x + mitad > width) {
      c.dx *= -1
      c.x = constrain(c.x, mitad, width - mitad)
    }
    if (c.y - mitad < 0 || c.y + mitad > height) {
      c.dy *= -1
      c.y = constrain(c.y, mitad, height - mitad)
    }

    dibujarCuadrado(c.x, c.y, s, params.num_lineas)
  }
}

function dibujarCuadrado(cx, cy, s, numLineas) {
  push()
  translate(cx - s / 2, cy - s / 2)
  stroke(255)
  strokeWeight(1)
  noFill()

  const n = Math.max(1, Math.round(numLineas))
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? s / 2 : (i * s) / (n - 1)
    line(0, y, s, y)
  }
  pop()
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
    regenerarCuadradosSiHaceFalta()
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    regenerarCuadradosSiHaceFalta()
    return
  }
})
