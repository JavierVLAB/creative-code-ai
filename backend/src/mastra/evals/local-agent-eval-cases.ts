// Define una batería local mínima y estable para revisar el comportamiento del agente
// en desarrollo antes de desplegar cambios o tocar guardrails más complejos.

export type LocalAgentEvalCategory =
  | 'direct-conversation'
  | 'parameter-change'
  | 'sketch-change'
  | 'parameter-and-sketch-change'
  | 'ambiguous'

export type LocalAgentEvalExpectedTool = 'edit_params' | 'edit_sketch'

export interface LocalAgentEvalCase {
  id: string
  title: string
  category: LocalAgentEvalCategory
  message: string
  renderer: 'p5js' | 'threejs'
  sketchJs: string
  configYaml: string
  expected: {
    shouldApplyConfig: boolean
    shouldApplySketch: boolean
    shouldAskClarification: boolean
    expectedTools: LocalAgentEvalExpectedTool[]
    responseMustMention: string[]
    reviewNotes: string
  }
}

const baseSketchJs = `let params = {
  circleCount: 12,
  speed: 0.8,
  radius: 120,
  hueShift: 0.15,
}

window.addEventListener('message', (event) => {
  if (event.data?.type === 'update-params') {
    params = { ...params, ...event.data.params }
  }
})

function setup() {
  createCanvas(windowWidth, windowHeight)
  noFill()
  strokeWeight(2)
}

function draw() {
  background(8, 10, 18)
  translate(width / 2, height / 2)

  for (let index = 0; index < params.circleCount; index += 1) {
    const angle = (TWO_PI / params.circleCount) * index + frameCount * 0.01 * params.speed
    const x = cos(angle) * params.radius
    const y = sin(angle) * params.radius

    stroke(
      180 + sin(angle + frameCount * params.hueShift) * 60,
      200,
      255,
    )
    circle(x, y, 28)
  }
}`

const baseConfigYaml = `renderer: p5js
params:
  circleCount:
    type: number
    min: 4
    max: 48
    step: 1
    default: 12
  speed:
    type: number
    min: 0
    max: 3
    step: 0.1
    default: 0.8
  radius:
    type: number
    min: 40
    max: 220
    step: 1
    default: 120
  hueShift:
    type: number
    min: 0
    max: 1
    step: 0.01
    default: 0.15`

export const LOCAL_AGENT_EVAL_CASES: LocalAgentEvalCase[] = [
  {
    id: 'conversation-improvement',
    title: 'Conversación directa sin tools',
    category: 'direct-conversation',
    message: 'Me gusta el sketch. Dame dos ideas concretas para que se sienta más espacial sin cambiar nada todavía.',
    renderer: 'p5js',
    sketchJs: baseSketchJs,
    configYaml: baseConfigYaml,
    expected: {
      shouldApplyConfig: false,
      shouldApplySketch: false,
      shouldAskClarification: false,
      expectedTools: [],
      responseMustMention: ['ideas', 'espacial'],
      reviewNotes:
        'La salida debe ser conversacional. En la traza no deberían aparecer tool calls.',
    },
  },
  {
    id: 'parameter-tuning',
    title: 'Cambio de parámetros existente',
    category: 'parameter-change',
    message: 'Sube circleCount a 24 y baja speed a 0.2 para que el movimiento sea más calmado.',
    renderer: 'p5js',
    sketchJs: baseSketchJs,
    configYaml: baseConfigYaml,
    expected: {
      shouldApplyConfig: true,
      shouldApplySketch: false,
      shouldAskClarification: false,
      expectedTools: ['edit_params'],
      responseMustMention: ['24', '0.2'],
      reviewNotes:
        'La traza debería mostrar solo edit_params y la respuesta debe confirmar los nuevos valores.',
    },
  },
  {
    id: 'sketch-structure-change',
    title: 'Cambio visual que requiere editar sketch',
    category: 'sketch-change',
    message: 'Sustituye los círculos por líneas radiales que respiren con el tiempo, manteniendo la paleta actual.',
    renderer: 'p5js',
    sketchJs: baseSketchJs,
    configYaml: baseConfigYaml,
    expected: {
      shouldApplyConfig: false,
      shouldApplySketch: true,
      shouldAskClarification: false,
      expectedTools: ['edit_sketch'],
      responseMustMention: ['líneas', 'paleta'],
      reviewNotes:
        'La traza debería mostrar edit_sketch y el output debe incluir un sketch completo actualizado.',
    },
  },
  {
    id: 'new-parameter-plus-code',
    title: 'Nuevo parámetro y cambio de código',
    category: 'parameter-and-sketch-change',
    message:
      'Añade un parámetro noiseScale para deformar suavemente la posición de cada elemento y úsalo en el sketch.',
    renderer: 'p5js',
    sketchJs: baseSketchJs,
    configYaml: baseConfigYaml,
    expected: {
      shouldApplyConfig: true,
      shouldApplySketch: true,
      shouldAskClarification: false,
      expectedTools: ['edit_params', 'edit_sketch'],
      responseMustMention: ['noiseScale'],
      reviewNotes:
        'La traza debería mostrar primero edit_params y después edit_sketch para reflejar el flujo esperado.',
    },
  },
  {
    id: 'ambiguous-request',
    title: 'Caso ambiguo que pide aclaración',
    category: 'ambiguous',
    message: 'Hazlo más limpio.',
    renderer: 'p5js',
    sketchJs: baseSketchJs,
    configYaml: baseConfigYaml,
    expected: {
      shouldApplyConfig: false,
      shouldApplySketch: false,
      shouldAskClarification: true,
      expectedTools: [],
      responseMustMention: ['limpio'],
      reviewNotes:
        'La salida debe incluir pendingQuestion o una aclaración explícita. No debería haber tool calls.',
    },
  },
]
