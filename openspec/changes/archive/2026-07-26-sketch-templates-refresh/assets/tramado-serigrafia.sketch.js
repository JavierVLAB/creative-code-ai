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
