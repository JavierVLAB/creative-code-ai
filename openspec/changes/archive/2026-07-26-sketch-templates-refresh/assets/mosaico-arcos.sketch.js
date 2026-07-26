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
