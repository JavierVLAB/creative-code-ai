-- public-template-playground: plantillas publicas reutilizables para el playground
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sketch_js text not null,
  config_yaml text not null,
  renderer text not null check (renderer in ('p5js', 'threejs')),
  thumbnail_url text,
  tags text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.templates enable row level security;

create policy "templates: select published" on public.templates
  for select
  using (is_published = true);

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
    'demo',
    'Circulo con lineas',
    'Lineas rectas desde la circunferencia hacia el interior',
    $demo_js$
// Sketch de demo: círculo con líneas entre dos puntos aleatorios de la circunferencia.
// Lee parámetros desde window.__SKETCH__ y escucha mensajes postMessage para actualizarse.

let params = {
  radius: 200,
  num_lines: 36,
  stroke_color: '#111111',
  background_color: '#ffffff',
}

function setup() {
  if (window.__SKETCH__ && window.__SKETCH__.values) {
    Object.assign(params, window.__SKETCH__.values)
  }

  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  noLoop()
  drawSketch()

  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function drawSketch() {
  background(params.background_color)

  const cx = width / 2
  const cy = height / 2
  const r = params.radius

  stroke(params.stroke_color)
  strokeWeight(1)
  noFill()

  // Dibujar el círculo
  ellipse(cx, cy, r * 2, r * 2)

  // Dibujar líneas entre dos puntos aleatorios de la circunferencia
  const n = Math.max(3, Math.round(params.num_lines))
  for (let i = 0; i < n; i++) {
    const angle1 = random(TWO_PI)
    const angle2 = random(TWO_PI)
    const x1 = cx + cos(angle1) * r
    const y1 = cy + sin(angle1) * r
    const x2 = cx + cos(angle2) * r
    const y2 = cy + sin(angle2) * r
    line(x1, y1, x2, y2)
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
$demo_js$,
    $demo_config$
name: Círculo con líneas
description: Líneas rectas desde la circunferencia hacia el interior

modules:

  canvas:
    type: canvas
    width: 600
    height: 600

  parametros:
    type: params
    params:

      radius:
        type: range
        label: Radio
        min: 50
        max: 280
        step: 1
        default: 200

      num_lines:
        type: range
        label: Número de líneas
        min: 3
        max: 120
        step: 1
        default: 36

      stroke_color:
        type: select
        label: Color de líneas
        default: "#111111"
        options:
          - label: Negro
            value: "#111111"
          - label: Gris
            value: "#888888"
          - label: Rojo
            value: "#c0392b"
          - label: Azul
            value: "#2980b9"
          - label: Verde
            value: "#27ae60"
          - label: Violeta
            value: "#8e44ad"

      background_color:
        type: select
        label: Color de fondo
        default: "#ffffff"
        options:
          - label: Blanco
            value: "#ffffff"
          - label: Negro
            value: "#111111"
          - label: Gris
            value: "#888888"
          - label: Rojo oscuro
            value: "#8e0000"
          - label: Azul oscuro
            value: "#001529"
$demo_config$,
    'p5js',
    array['legacy', 'p5js', 'lineas'],
    true
  ),
  (
    'bezier-noise',
    'Espiral Bezier',
    'Curvas de Bezier simetricas guiadas por ruido de Perlin',
    $bezier_js$
// Espiral Bézier — curvas de Bézier simétricas guiadas por ruido de Perlin.
// Adaptado para recibir parámetros vía postMessage desde CurateArtAI.

let params = {
  seed: 6,
  N: 180,
  R: 150,
  ang_factor: 40,
  hue_offset: 0,
  bg_brightness: 10,
}

function setup() {
  if (window.__SKETCH__ && window.__SKETCH__.values) {
    Object.assign(params, window.__SKETCH__.values)
  }
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  noFill()
  colorMode(HSB, 360, 100, 100, 100)
  angleMode(DEGREES)
  noLoop()
  drawSketch()

  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function drawSketch() {
  // Re-sembrar antes de dibujar para que seed sea un parámetro efectivo
  noiseSeed(Math.round(params.seed))

  background(240, 100, params.bg_brightness)

  // Textura de ruido de fondo (puntos semitransparentes)
  for (let i = 0; i < width; i += 2) {
    for (let j = 0; j < height; j += 2) {
      stroke(100, 0, 100, random([1, 2, 3, 4, 5, 6, 7, 8, 10]))
      point(i, j)
    }
  }

  push()
  translate(width / 2, height / 2)

  const N = Math.max(10, params.N)
  const R = params.R
  const angFactor = params.ang_factor
  const hueOffset = params.hue_offset

  for (let i = 0; i < N; i += 0.03) {
    const r = 600 * noise(i * 0.01) + 100

    const x1 = R * cos(i)
    const y1 = R * sin(i)
    const x2 = -R * cos(i)
    const y2 = -R * sin(i)

    // Puntos de control: ángulo perturbado por ruido
    const ang1 = angFactor * (2 * noise(i * 0.0001) - 1) * (i - N) * i / N
    const ax1 = x1 - r * cos(i + ang1)
    const ay1 = y1 - r * sin(i + ang1)

    const ang2 = angFactor * (2 * noise(i * 0.0001, 1) - 1) * (i - N) * i / N
    const ax2 = x2 + r * cos(i + ang2)
    const ay2 = y2 + r * sin(i + ang2)

    const h = (360 * noise(i * 0.005) + hueOffset) % 360
    stroke(h, 100, 100, 1)
    bezier(x1, y1, ax1, ay1, ax2, ay2, x2, y2)
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
    drawSketch()
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    drawSketch()
    return
  }
})
$bezier_js$,
    $bezier_config$
name: Espiral Bézier
description: Curvas de Bézier simétricas guiadas por ruido de Perlin

modules:

  canvas:
    type: canvas
    width: 600
    height: 600

  parametros:
    type: params
    params:

      seed:
        type: range
        label: Semilla
        min: 0
        max: 99
        step: 1
        default: 6

      N:
        type: range
        label: Iteraciones
        min: 30
        max: 360
        step: 5
        default: 180

      R:
        type: range
        label: Radio
        min: 30
        max: 280
        step: 5
        default: 150

      ang_factor:
        type: range
        label: Torsión
        min: 0
        max: 80
        step: 1
        default: 40

      hue_offset:
        type: range
        label: Offset de color
        min: 0
        max: 360
        step: 1
        default: 0

      bg_brightness:
        type: range
        label: Brillo fondo
        min: 2
        max: 30
        step: 1
        default: 10
$bezier_config$,
    'p5js',
    array['legacy', 'p5js', 'bezier'],
    true
  ),
  (
    'particulas',
    'Particulas conectadas',
    'Sistema de particulas con trazas acumulativas sensible al raton',
    $particulas_js$
// Partículas conectadas — sistema de partículas con trazas acumulativas.
// La primera partícula sigue al ratón (líneas de color).
// Las trazas se acumulan en el canvas y se borran cada ~1500 frames.

let params = {
  num_particles: 15,
  max_dist: 80,
  min_dist: 20,
  force_strength: 1,   // se multiplica por 0.0001 internamente
  line_alpha: 10,
  mouse_color: '#e74c3c',
}

let balls = []

function setup() {
  if (window.__SKETCH__ && window.__SKETCH__.values) {
    Object.assign(params, window.__SKETCH__.values)
  }
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  noFill()
  initParticles()

  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function initParticles() {
  balls = []
  const N = Math.max(3, Math.round(params.num_particles))
  for (let i = 0; i < N; i++) {
    balls.push(new Particle())
  }
  background(255)
}

function draw() {
  // Cada 1500 frames: limpiar canvas y aleatorizar velocidades
  if (frameCount % 1500 === 0) {
    background(255)
    for (const b of balls) {
      b.speed.x = random(-2, 2)
      b.speed.y = random(-2, 2)
    }
  }

  // Actualizar posiciones de todas las partículas
  for (const b of balls) b.update()

  // La primera partícula sigue al ratón (coordenadas relativas al centro)
  balls[0].pos.x = mouseX - width / 2
  balls[0].pos.y = mouseY - height / 2

  drawConnections()
}

function drawConnections() {
  push()
  translate(width / 2, height / 2)

  const maxD = params.max_dist
  const minD = params.min_dist
  const alpha = params.line_alpha
  const mc = color(params.mouse_color)

  for (let i = balls.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      const dx = balls[i].pos.x - balls[j].pos.x
      const dy = balls[i].pos.y - balls[j].pos.y
      const d = sqrt(dx * dx + dy * dy)

      if (d < maxD && d > minD) {
        if (j === 0) {
          // Línea conectada al ratón: usa el color elegido, más opaca
          stroke(red(mc), green(mc), blue(mc), alpha * 2)
        } else {
          stroke(0, alpha)
        }
        line(balls[i].pos.x, balls[i].pos.y, balls[j].pos.x, balls[j].pos.y)
      }
    }
  }

  pop()
}

class Particle {
  constructor() {
    const a = random(TWO_PI)
    const r = random(100)
    this.pos = createVector(r * cos(a), r * sin(a))
    this.radius = random(5, 10)
    this.speed = createVector(random(-2, 2), random(-2, 2))
  }

  update() {
    // Atracción leve hacia un punto aleatorio cerca del centro
    const tx = random(-20, 20) - this.pos.x
    const ty = random(-20, 20) - this.pos.y
    const f = params.force_strength * 0.0001
    this.speed.x += tx * f
    this.speed.y += ty * f
    this.pos.add(this.speed)
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
    initParticles()
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    const prevN = Math.round(params.num_particles)
    if (msg.values) Object.assign(params, msg.values)
    // Solo reinicializar si cambia el número de partículas
    if (Math.round(params.num_particles) !== prevN) {
      initParticles()
    }
  }
})
$particulas_js$,
    $particulas_config$
name: Partículas conectadas
description: Sistema de partículas con trazas acumulativas sensible al ratón

modules:

  canvas:
    type: canvas
    width: 600
    height: 600

  parametros:
    type: params
    params:

      num_particles:
        type: range
        label: Partículas
        min: 3
        max: 40
        step: 1
        default: 15

      max_dist:
        type: range
        label: Distancia máx. conexión
        min: 30
        max: 200
        step: 5
        default: 80

      min_dist:
        type: range
        label: Distancia mín. conexión
        min: 0
        max: 60
        step: 5
        default: 20

      force_strength:
        type: range
        label: Fuerza de atracción
        min: 0
        max: 10
        step: 1
        default: 1

      line_alpha:
        type: range
        label: Opacidad de trazas
        min: 2
        max: 50
        step: 1
        default: 10

      mouse_color:
        type: select
        label: Color del ratón
        default: "#e74c3c"
        options:
          - label: Rojo
            value: "#e74c3c"
          - label: Azul
            value: "#3498db"
          - label: Verde
            value: "#2ecc71"
          - label: Naranja
            value: "#f39c12"
          - label: Blanco
            value: "#ffffff"
$particulas_config$,
    'p5js',
    array['legacy', 'p5js', 'particulas'],
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
