-- sketch-templates-refresh: contenido — 4 plantillas nuevas revisadas con Javi,
-- reemplazando las insertadas sin revisión en 20260726000000_add_more_templates.sql
-- (esas 4 se eliminan en 20260726010000_delete_extra_templates.sql).
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
    'tramado-serigrafia',
    'Tramado para serigrafía',
    'Convierte una imagen en blanco y negro puro vía dithering, como ayuda para preparar fotolitos',
    $serigrafia_js$
// Tramado estocástico para serigrafía — convierte una imagen en blanco y negro
// puro vía dithering (difusión de error o distribución estocástica), pensado
// como ayuda de preparación de fotolitos: la densidad de puntos negros
// representa el tono original, sin escalas de gris.

let params = {
  imagen_fuente: '',
  resolucion: 6,
  umbral: 128,
  contraste: 0,
  intensidad: 1,
  invertir: 'no',
  algoritmo: 'floyd-steinberg',
}

let sourceImg = null
let lastLoadedUrl = null
let errorCarga = null

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 640
  const h = window.__SKETCH__?.canvas?.height ?? 640
  createCanvas(w, h)
  noLoop()
  cargarImagenSiHaceFalta()
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

// Solo recarga la imagen cuando la URL cambia — evita relecturas en cada
// SKETCH_UPDATE de un parámetro no relacionado (ej. mover el slider de umbral).
function cargarImagenSiHaceFalta() {
  if (!params.imagen_fuente || params.imagen_fuente === lastLoadedUrl) return
  lastLoadedUrl = params.imagen_fuente
  errorCarga = null
  loadImage(
    params.imagen_fuente,
    img => {
      sourceImg = img
      errorCarga = null
      redraw()
    },
    err => {
      // Motivo típico: la URL no es accesible (CORS, 404, bucket privado).
      // Se deja visible en consola y en el propio canvas para poder
      // diagnosticarlo sin herramientas externas.
      console.error('tramado-serigrafia: no se pudo cargar la imagen', params.imagen_fuente, err)
      sourceImg = null
      errorCarga = 'No se pudo cargar la imagen (revisa la consola del navegador)'
      redraw()
    }
  )
}

// Contraste lineal alrededor del gris medio (128)
function aplicarContraste(valor, contraste) {
  const factor = map(contraste, -100, 100, 0.3, 3)
  return constrain((valor - 128) * factor + 128, 0, 255)
}

function draw() {
  background(255)

  if (!sourceImg) {
    noStroke()
    fill(errorCarga ? '#c0392b' : 120)
    textAlign(CENTER, CENTER)
    textSize(16)
    text(errorCarga ?? 'Sube una imagen desde el panel de parámetros', width / 2, height / 2, width - 80)
    return
  }

  const celda = Math.max(1, Math.round(params.resolucion))
  const workW = Math.max(1, Math.floor(width / celda))
  const workH = Math.max(1, Math.floor(height / celda))

  // Reduce la imagen a la resolución de trabajo y la pasa a escala de grises
  const buffer = createGraphics(workW, workH)
  buffer.pixelDensity(1)
  buffer.image(sourceImg, 0, 0, workW, workH)
  buffer.loadPixels()

  const grid = new Float32Array(workW * workH)
  for (let y = 0; y < workH; y++) {
    for (let x = 0; x < workW; x++) {
      const i = (x + y * workW) * 4
      const r = buffer.pixels[i]
      const g = buffer.pixels[i + 1]
      const b = buffer.pixels[i + 2]
      grid[x + y * workW] = aplicarContraste((r + g + b) / 3, params.contraste)
    }
  }

  const bits = tramar(grid, workW, workH, params.umbral, params.intensidad, params.algoritmo)
  const invertido = params.invertir === 'si'

  noStroke()
  for (let y = 0; y < workH; y++) {
    for (let x = 0; x < workW; x++) {
      let negro = bits[x + y * workW]
      if (invertido) negro = !negro
      fill(negro ? 0 : 255)
      rect(x * celda, y * celda, celda, celda)
    }
  }
}

// Devuelve un array de booleanos (true = punto negro) según el algoritmo elegido
function tramar(grid, w, h, umbral, intensidad, algoritmo) {
  if (algoritmo === 'estocastico') return tramarEstocastico(grid, w, h, umbral, intensidad)
  const kernel = algoritmo === 'atkinson' ? KERNEL_ATKINSON : KERNEL_FLOYD_STEINBERG
  return tramarPorDifusion(grid, w, h, umbral, intensidad, kernel)
}

// Distribución estocástica: cada píxel se decide comparando el tono contra
// ruido aleatorio, sin propagar error a los vecinos. `intensidad` controla
// cuánto ruido se mezcla (0 = umbral duro, 1 = ruido completo).
function tramarEstocastico(grid, w, h, umbral, intensidad) {
  const bits = new Array(w * h)
  for (let i = 0; i < grid.length; i++) {
    const ruido = random(-128, 128) * intensidad
    bits[i] = grid[i] + ruido < umbral
  }
  return bits
}

// Kernels de difusión de error: { dx, dy, peso } relativo al píxel actual
const KERNEL_FLOYD_STEINBERG = [
  { dx: 1, dy: 0, peso: 7 / 16 },
  { dx: -1, dy: 1, peso: 3 / 16 },
  { dx: 0, dy: 1, peso: 5 / 16 },
  { dx: 1, dy: 1, peso: 1 / 16 },
]

// Atkinson difunde solo 3/4 del error total (6 vecinos a 1/8 cada uno) —
// produce menos ruido y más contraste que Floyd-Steinberg
const KERNEL_ATKINSON = [
  { dx: 1, dy: 0, peso: 1 / 8 },
  { dx: 2, dy: 0, peso: 1 / 8 },
  { dx: -1, dy: 1, peso: 1 / 8 },
  { dx: 0, dy: 1, peso: 1 / 8 },
  { dx: 1, dy: 1, peso: 1 / 8 },
  { dx: 0, dy: 2, peso: 1 / 8 },
]

function tramarPorDifusion(grid, w, h, umbral, intensidad, kernel) {
  const valores = Float32Array.from(grid)
  const bits = new Array(w * h)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = x + y * w
      const valor = valores[i]
      const esNegro = valor < umbral
      bits[i] = esNegro

      // Error entre el valor real y el blanco/negro elegido, escalado por
      // `intensidad` (0 = sin difusión, 1 = difusión completa)
      const error = (valor - (esNegro ? 0 : 255)) * intensidad
      for (const { dx, dy, peso } of kernel) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
        valores[nx + ny * w] += error * peso
      }
    }
  }

  return bits
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
    cargarImagenSiHaceFalta()
    redraw()
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    cargarImagenSiHaceFalta()
    redraw()
    return
  }
})
$serigrafia_js$,
    $serigrafia_config$
name: tramado-serigrafia

modules:
  canvas:
    width: 640
    height: 640

  imagen_fuente:
    type: image
    label: Imagen de origen

  resolucion:
    type: range
    label: Resolución de trama (px)
    min: 2
    max: 20
    step: 1
    default: 6

  umbral:
    type: range
    label: Umbral tonal
    min: 0
    max: 255
    step: 1
    default: 128

  contraste:
    type: range
    label: Contraste
    min: -100
    max: 100
    step: 1
    default: 0

  intensidad:
    type: range
    label: Intensidad del tramado
    min: 0
    max: 1
    step: 0.05
    default: 1

  invertir:
    type: select
    label: Invertir
    options:
      - label: No
        value: 'no'
      - label: Sí
        value: 'si'
    default: 'no'

  algoritmo:
    type: select
    label: Algoritmo
    options:
      - label: Floyd-Steinberg
        value: floyd-steinberg
      - label: Atkinson
        value: atkinson
      - label: Estocástico
        value: estocastico
    default: floyd-steinberg
$serigrafia_config$,
    'p5js',
    array['p5js', 'dithering', 'serigrafia', 'imagen'],
    true
  ),
  (
    'espiral-plotter',
    'Espiral para plotter',
    'Espiral de trazo continuo con el radio modulado por ruido Perlin, exportable a SVG para pen-plotter',
    $plotter_js$
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
$plotter_js$,
    $plotter_config$
name: espiral-plotter

modules:
  canvas:
    width: 640
    height: 640

  vueltas:
    type: range
    label: Vueltas
    min: 3
    max: 30
    step: 1
    default: 10

  escala_ruido:
    type: range
    label: Escala de ruido
    min: 0.1
    max: 3
    step: 0.1
    default: 1

  amplitud:
    type: range
    label: Amplitud
    min: 0
    max: 150
    step: 1
    default: 60

  semilla:
    type: range
    label: Semilla
    min: 0
    max: 1000
    step: 1
    default: 42

  grosor_trazo:
    type: range
    label: Grosor del trazo
    min: 0.5
    max: 4
    step: 0.1
    default: 1.5
$plotter_config$,
    'p5js',
    array['p5js', 'plotter', 'svg', 'ruido'],
    true
  ),
  (
    'flow-field-perlin',
    'Flow field de Perlin',
    'Líneas siguiendo un campo de ángulos derivado de ruido Perlin',
    $flowfield_js$
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
$flowfield_js$,
    $flowfield_config$
name: flow-field-perlin

modules:
  canvas:
    width: 640
    height: 640

  n_lineas:
    type: range
    label: Cantidad de líneas
    min: 50
    max: 800
    step: 10
    default: 300

  escala_ruido:
    type: range
    label: Escala de ruido
    min: 0.001
    max: 0.05
    step: 0.001
    default: 0.01

  velocidad:
    type: range
    label: Velocidad de avance
    min: 1
    max: 10
    step: 0.5
    default: 4

  longitud_traza:
    type: range
    label: Longitud de la traza
    min: 10
    max: 200
    step: 5
    default: 60

  color_linea:
    type: select
    label: Color de línea
    options:
      - label: Azul
        value: '#2980b9'
      - label: Negro
        value: '#111111'
      - label: Rojo
        value: '#c0392b'
      - label: Verde
        value: '#27ae60'
    default: '#2980b9'
$flowfield_config$,
    'p5js',
    array['p5js', 'ruido', 'campo-de-flujo'],
    true
  ),
  (
    'mosaico-arcos',
    'Mosaico de arcos',
    'Mosaico de tiles con arcos tipo Truchet, rotados y coloreados aleatoriamente, exportable a SVG',
    $mosaico_js$
// Mosaico de arcos — adaptación de un sketch de tiles tipo Truchet aportado
// como inspiración. Reescrito sobre el contrato real del proyecto (nada de
// OPC.slider/OPC.palette, que pertenecen a un runtime ajeno tipo
// OpenProcessing), manteniendo la geometría original: por cada tile, dos
// familias de arcos concéntricos crecientes desde esquinas opuestas, unidas
// por dos arcos de transición cuyo ángulo se calcula por intersección de
// circunferencias (encontrarPuntosInterseccion). El sketch original calculaba
// ese ángulo con `tan(x/y)`/`atan(x/y)`, que pierde el cuadrante y es
// incorrecto — aquí se usa `atan2(y, x)`, la forma correcta de obtener el
// ángulo de un punto respecto a un centro.

const PARTES = 5

let params = {
  tamano_grid: 8,
  paleta: 'azul-noche',
  grosor_linea: 1.5,
  semilla: 1,
  solo_lineas: 'no',
}

const PALETAS = {
  'azul-noche': ['#021d34', '#228fca', '#dcedf0'],
  fuego: ['#1c1c1c', '#ed225d', '#f5dc23'],
  bosque: ['#0d150b', '#3cd86b', '#faf8e2'],
  contraste: ['#ffffff', '#000000', '#fcd202'],
}

// Grid de patrones (0 = líneas, 1 = arcos) y rotaciones por tile. Se
// recalcula solo cuando cambian tamaño de grid o semilla — no en cada
// parámetro visual (color, grosor), para que el mosaico no "salte" al mover
// un slider que no afecta a su estructura.
let patrones = []
let rotaciones = []
let ultimoTamano = null
let ultimaSemilla = null

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 640
  const h = window.__SKETCH__?.canvas?.height ?? 640
  createCanvas(w, h)
  noLoop()
  regenerarGridSiHaceFalta()
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function regenerarGridSiHaceFalta() {
  const n = Math.max(1, Math.round(params.tamano_grid))
  if (n === ultimoTamano && params.semilla === ultimaSemilla) return
  ultimoTamano = n
  ultimaSemilla = params.semilla

  randomSeed(params.semilla)
  patrones = []
  rotaciones = []
  for (let i = 0; i < n; i++) {
    patrones.push([])
    rotaciones.push([])
    for (let j = 0; j < n; j++) {
      patrones[i].push(random([0, 1]))
      rotaciones[i].push(Math.floor(random(4)) * HALF_PI)
    }
  }
}

function draw() {
  dibujarMosaico(window, width, height)
}

// Dibuja el mosaico completo sobre cualquier objetivo con API de p5 (el
// propio sketch o un p5.Graphics offscreen para exportar a SVG).
function dibujarMosaico(g, w, h) {
  const paleta = PALETAS[params.paleta] ?? PALETAS['azul-noche']
  const n = patrones.length
  const lado = Math.min(w, h)
  const s = lado / n
  const offsetX = (w - lado) / 2
  const offsetY = (h - lado) / 2

  g.background(paleta[0])
  g.push()
  g.translate(offsetX, offsetY)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      dibujarTile(g, i, j, s, patrones[i][j], rotaciones[i][j], paleta)
    }
  }

  g.pop()
}

function dibujarTile(g, i, j, s, patron, rotacion, paleta) {
  g.push()
  g.translate(i * s + s / 2, j * s + s / 2)
  g.rotate(rotacion)
  g.translate(-s / 2, -s / 2)

  if (params.solo_lineas !== 'si') {
    g.noStroke()
    g.fill(paleta[1])
    g.rect(0, 0, s, s)
  }

  g.noFill()
  g.stroke(paleta[2])
  g.strokeWeight(params.grosor_linea)

  if (patron === 1) {
    dibujarPatronArcos(g, s)
  } else {
    const lineas = 5
    for (let k = 0; k <= lineas; k++) {
      g.line(0, (k * s) / lineas, s, (k * s) / lineas)
    }
  }

  g.pop()
}

// Patrón "arcos" de un tile: dos familias de arcos concéntricos crecientes
// desde esquinas opuestas (0,0) y (s,s), más dos arcos de transición que las
// conectan visualmente. Es la geometría del sketch original, con el cálculo
// de ángulo corregido.
function dibujarPatronArcos(g, s) {
  // Familia corta desde (0,0): solo los dos radios interiores
  for (let i = 1; i < PARTES - 2; i++) {
    const diametro = (2 * i * s) / PARTES
    g.arc(0, 0, diametro, diametro, 0, HALF_PI)
  }

  // Familia completa desde la esquina opuesta (s,s), en el cuadrante contrario
  for (let i = 1; i <= PARTES; i++) {
    const diametro = (2 * i * s) / PARTES
    g.arc(s, s, diametro, diametro, PI, PI + HALF_PI)
  }

  // Arcos de transición desde (0,0): se dejan sin dibujar justo donde esa
  // circunferencia cruzaría a la circunferencia grande centrada en (s,s)
  // (radio s) — ese hueco es lo que da la sensación de que un arco pasa por
  // debajo del otro, en vez de que ambas familias se crucen de forma plana.
  for (const radio of [(4 * s) / 5, (3 * s) / 5]) {
    const puntos = encontrarPuntosInterseccion({ x: s, y: s }, s, { x: 0, y: 0 }, radio)
    if (!puntos) continue
    const [angInicio, angFin] = [puntos[0].angulo, puntos[1].angulo].sort((a, b) => a - b)
    const diametro = radio * 2
    g.arc(0, 0, diametro, diametro, 0, angInicio)
    g.arc(0, 0, diametro, diametro, angFin, HALF_PI)
  }
}

// Puntos de intersección entre dos circunferencias (centroA, radioA) y
// (centroB, radioB), con el ángulo de cada punto respecto a centroB.
// Devuelve null si no se intersectan.
function encontrarPuntosInterseccion(centroA, radioA, centroB, radioB) {
  const dx = centroB.x - centroA.x
  const dy = centroB.y - centroA.y
  const distancia = Math.sqrt(dx * dx + dy * dy)

  if (distancia > radioA + radioB || distancia < Math.abs(radioA - radioB)) return null

  // Distancia desde centroA hasta el punto medio de la cuerda de intersección
  const proyeccion = (radioA ** 2 - radioB ** 2 + distancia ** 2) / (2 * distancia)
  const altura = Math.sqrt(Math.max(0, radioA ** 2 - proyeccion ** 2))
  const mx = centroA.x + (proyeccion * dx) / distancia
  const my = centroA.y + (proyeccion * dy) / distancia

  const p1 = { x: mx + (altura * dy) / distancia, y: my - (altura * dx) / distancia }
  const p2 = { x: mx - (altura * dy) / distancia, y: my + (altura * dx) / distancia }

  p1.angulo = Math.atan2(p1.y - centroB.y, p1.x - centroB.x)
  p2.angulo = Math.atan2(p2.y - centroB.y, p2.x - centroB.x)

  return [p1, p2]
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
  dibujarMosaico(g, width, height)
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
    regenerarGridSiHaceFalta()
    redraw()
    return
  }

  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    regenerarGridSiHaceFalta()
    redraw()
    return
  }
})
$mosaico_js$,
    $mosaico_config$
name: mosaico-arcos

modules:
  canvas:
    width: 640
    height: 640

  tamano_grid:
    type: range
    label: Tamaño de grid
    min: 2
    max: 16
    step: 1
    default: 8

  paleta:
    type: select
    label: Paleta
    options:
      - label: Azul noche
        value: azul-noche
      - label: Fuego
        value: fuego
      - label: Bosque
        value: bosque
      - label: Contraste
        value: contraste
    default: azul-noche

  grosor_linea:
    type: range
    label: Grosor de línea
    min: 0.5
    max: 4
    step: 0.1
    default: 1.5

  semilla:
    type: range
    label: Semilla
    min: 0
    max: 1000
    step: 1
    default: 1

  solo_lineas:
    type: select
    label: Solo líneas
    options:
      - label: No
        value: 'no'
      - label: Sí
        value: 'si'
    default: 'no'
$mosaico_config$,
    'p5js',
    array['p5js', 'truchet', 'svg', 'geometrico'],
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
