-- sketch-creation-origins: contenido — 4 plantillas nuevas para ampliar la
-- biblioteca de plantillas (playground publico + selector de origen al crear proyecto)
insert into public.templates (
  slug,
  title,
  description,
  sketch_js,
  config_yaml,
  renderer,
  tags,
  is_published
)
values
  (
    'ondas-perlin',
    'Ondas de Perlin',
    'Lineas onduladas guiadas por ruido de Perlin, en movimiento continuo',
    $ondas_js$
// Ondas de Perlin — líneas onduladas horizontales guiadas por ruido de Perlin.
// Se anima continuamente avanzando el eje de tiempo del ruido en cada frame.

let params = {
  n_lines: 14,
  amplitude: 60,
  speed: 6,
  stroke_color: '#2980b9',
  background_color: '#ffffff',
}

let t = 0

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function draw() {
  background(params.background_color)
  stroke(params.stroke_color)
  strokeWeight(1.5)
  noFill()

  const n = Math.max(2, Math.round(params.n_lines))
  const gap = height / (n + 1)

  for (let i = 1; i <= n; i++) {
    const baseY = gap * i
    beginShape()
    for (let x = 0; x <= width; x += 8) {
      const y = baseY + noise(x * 0.01, i * 10, t) * params.amplitude - params.amplitude / 2
      vertex(x, y)
    }
    endShape()
  }

  t += params.speed * 0.001
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
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    return
  }
})
$ondas_js$,
    $ondas_config$
name: Ondas de Perlin
description: Líneas onduladas guiadas por ruido de Perlin, en movimiento continuo

modules:
  canvas:
    width: 600
    height: 600

  n_lines:
    type: range
    label: Número de líneas
    min: 4
    max: 40
    step: 1
    default: 14

  amplitude:
    type: range
    label: Amplitud
    min: 10
    max: 150
    step: 5
    default: 60

  speed:
    type: range
    label: Velocidad
    min: 1
    max: 20
    step: 1
    default: 6

  stroke_color:
    type: select
    label: Color de líneas
    default: "#2980b9"
    options:
      - label: Azul
        value: "#2980b9"
      - label: Negro
        value: "#111111"
      - label: Rojo
        value: "#c0392b"
      - label: Verde
        value: "#27ae60"

  background_color:
    type: select
    label: Color de fondo
    default: "#ffffff"
    options:
      - label: Blanco
        value: "#ffffff"
      - label: Negro
        value: "#111111"
      - label: Crema
        value: "#f5ecd7"
$ondas_config$,
    'p5js',
    array['p5js', 'ruido', 'animado'],
    true
  ),
  (
    'mandala-geometrico',
    'Mandala geométrico',
    'Formas repetidas con simetria rotacional, girando de forma continua',
    $mandala_js$
// Mandala geométrico — figuras repetidas con simetría rotacional alrededor del centro.
// Gira de forma continua; la simetría y el tamaño de la figura son ajustables.

let params = {
  symmetry: 8,
  shape_size: 90,
  rotation_speed: 1,
  stroke_color: '#8e44ad',
  background_color: '#111111',
}

let angle = 0

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  angleMode(DEGREES)
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function draw() {
  background(params.background_color)
  translate(width / 2, height / 2)
  stroke(params.stroke_color)
  strokeWeight(1.5)
  noFill()

  const n = Math.max(3, Math.round(params.symmetry))
  const step = 360 / n
  const s = params.shape_size

  for (let i = 0; i < n; i++) {
    push()
    rotate(angle + step * i)
    line(0, 0, s, 0)
    ellipse(s, 0, s * 0.4, s * 0.4)
    pop()
  }

  angle += params.rotation_speed * 0.2
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
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    return
  }
})
$mandala_js$,
    $mandala_config$
name: Mandala geométrico
description: Formas repetidas con simetría rotacional, girando de forma continua

modules:
  canvas:
    width: 600
    height: 600

  symmetry:
    type: range
    label: Simetría
    min: 3
    max: 24
    step: 1
    default: 8

  shape_size:
    type: range
    label: Tamaño
    min: 20
    max: 200
    step: 5
    default: 90

  rotation_speed:
    type: range
    label: Velocidad de rotación
    min: 0
    max: 5
    step: 1
    default: 1

  stroke_color:
    type: select
    label: Color de líneas
    default: "#8e44ad"
    options:
      - label: Violeta
        value: "#8e44ad"
      - label: Blanco
        value: "#ffffff"
      - label: Naranja
        value: "#f39c12"
      - label: Turquesa
        value: "#1abc9c"

  background_color:
    type: select
    label: Color de fondo
    default: "#111111"
    options:
      - label: Negro
        value: "#111111"
      - label: Blanco
        value: "#ffffff"
      - label: Azul noche
        value: "#001529"
$mandala_config$,
    'p5js',
    array['p5js', 'simetria', 'animado'],
    true
  ),
  (
    'lluvia-de-cuadrados',
    'Lluvia de cuadrados',
    'Cuadrados que caen y giran, reapareciendo arriba al salir del lienzo',
    $lluvia_js$
// Lluvia de cuadrados — partículas cuadradas que caen y giran continuamente,
// reapareciendo en la parte superior al salir del lienzo.

let params = {
  n_squares: 30,
  fall_speed: 3,
  square_size: 16,
  square_color: '#e67e22',
  background_color: '#fefefe',
}

let squares = []

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  rectMode(CENTER)
  angleMode(DEGREES)
  initSquares()
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function initSquares() {
  squares = []
  const n = Math.max(1, Math.round(params.n_squares))
  for (let i = 0; i < n; i++) {
    squares.push({
      x: random(width),
      y: random(height),
      rot: random(360),
      spin: random(-2, 2),
    })
  }
}

function draw() {
  background(params.background_color)
  noStroke()
  fill(params.square_color)

  for (const sq of squares) {
    sq.y += params.fall_speed
    sq.rot += sq.spin
    if (sq.y > height + params.square_size) {
      sq.y = -params.square_size
      sq.x = random(width)
    }
    push()
    translate(sq.x, sq.y)
    rotate(sq.rot)
    rect(0, 0, params.square_size, params.square_size)
    pop()
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
    initSquares()
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    const prevN = Math.round(params.n_squares)
    if (msg.values) Object.assign(params, msg.values)
    if (Math.round(params.n_squares) !== prevN) initSquares()
    return
  }
})
$lluvia_js$,
    $lluvia_config$
name: Lluvia de cuadrados
description: Cuadrados que caen y giran, reapareciendo arriba al salir del lienzo

modules:
  canvas:
    width: 600
    height: 600

  n_squares:
    type: range
    label: Cantidad
    min: 5
    max: 100
    step: 1
    default: 30

  fall_speed:
    type: range
    label: Velocidad de caída
    min: 1
    max: 10
    step: 1
    default: 3

  square_size:
    type: range
    label: Tamaño
    min: 5
    max: 40
    step: 1
    default: 16

  square_color:
    type: select
    label: Color
    default: "#e67e22"
    options:
      - label: Naranja
        value: "#e67e22"
      - label: Rojo
        value: "#c0392b"
      - label: Azul
        value: "#2980b9"
      - label: Negro
        value: "#111111"

  background_color:
    type: select
    label: Color de fondo
    default: "#fefefe"
    options:
      - label: Blanco
        value: "#fefefe"
      - label: Gris claro
        value: "#ecf0f1"
      - label: Negro
        value: "#111111"
$lluvia_config$,
    'p5js',
    array['p5js', 'particulas', 'animado'],
    true
  ),
  (
    'campo-de-vectores',
    'Campo de vectores',
    'Rejilla de segmentos orientados por ruido de Perlin, como un campo de flujo',
    $vectores_js$
// Campo de vectores — rejilla de segmentos cuya orientación viene de ruido de
// Perlin, como una visualización de campo de flujo. Se redibuja al cambiar
// parámetros (no se anima frame a frame).

let params = {
  grid_spacing: 24,
  line_length: 14,
  noise_scale: 6,
  stroke_color: '#16a085',
  background_color: '#ffffff',
}

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  angleMode(RADIANS)
  noLoop()
  drawSketch()

  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function drawSketch() {
  background(params.background_color)
  stroke(params.stroke_color)
  strokeWeight(1.5)

  const spacing = Math.max(6, params.grid_spacing)
  const len = params.line_length
  const scale = params.noise_scale * 0.001

  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      const angle = noise(x * scale, y * scale) * TWO_PI * 2
      const dx = cos(angle) * len
      const dy = sin(angle) * len
      line(x - dx / 2, y - dy / 2, x + dx / 2, y + dy / 2)
    }
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
    drawSketch()
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    drawSketch()
    return
  }
})
$vectores_js$,
    $vectores_config$
name: Campo de vectores
description: Rejilla de segmentos orientados por ruido de Perlin, como un campo de flujo

modules:
  canvas:
    width: 600
    height: 600

  grid_spacing:
    type: range
    label: Espaciado de rejilla
    min: 10
    max: 60
    step: 2
    default: 24

  line_length:
    type: range
    label: Longitud de segmento
    min: 5
    max: 40
    step: 1
    default: 14

  noise_scale:
    type: range
    label: Escala de ruido
    min: 1
    max: 20
    step: 1
    default: 6

  stroke_color:
    type: select
    label: Color
    default: "#16a085"
    options:
      - label: Turquesa
        value: "#16a085"
      - label: Negro
        value: "#111111"
      - label: Azul
        value: "#2980b9"
      - label: Rojo
        value: "#c0392b"

  background_color:
    type: select
    label: Color de fondo
    default: "#ffffff"
    options:
      - label: Blanco
        value: "#ffffff"
      - label: Crema
        value: "#f5ecd7"
      - label: Negro
        value: "#111111"
$vectores_config$,
    'p5js',
    array['p5js', 'ruido', 'campo-de-flujo'],
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  sketch_js = excluded.sketch_js,
  config_yaml = excluded.config_yaml,
  renderer = excluded.renderer,
  tags = excluded.tags,
  is_published = excluded.is_published,
  updated_at = now();
