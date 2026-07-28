-- sketch-cuadrados-lineas-libres: plantilla nueva — cuadrados de líneas
-- blancas que se mueven libremente sobre fondo negro, con animación continua
-- (primera plantilla del proyecto sin noLoop()).
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
    'cuadrados-lineas-libres',
    'Cuadrados en movimiento',
    'Cuadrados de líneas blancas que se mueven libremente sobre fondo negro',
    $sketch$
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
$sketch$,
    $config$
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
$config$,
    'p5js',
    array['p5js', 'animacion', 'movimiento', 'lineas'],
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
