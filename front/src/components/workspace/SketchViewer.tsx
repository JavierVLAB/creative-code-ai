import { useEffect } from 'react'
import type { RefObject } from 'react'
import type { SketchConfig } from '../../lib/types'
import { generateControls } from '../../lib/controls'
import { parseSketchConfig } from '../../lib/yaml'
import { defaultValues } from '../../hooks/useSketch'

// Sketch de demo: círculo p5.js con parámetro `radius`, usado cuando el proyecto no tiene código
const DEMO_SKETCH_JS = `
let params = { radius: 100 }

function setup() {
  if (window.__SKETCH__?.values) Object.assign(params, window.__SKETCH__.values)
  const w = window.__SKETCH__?.canvas?.width ?? 600
  const h = window.__SKETCH__?.canvas?.height ?? 600
  createCanvas(w, h)
  noLoop()
  window.parent.postMessage({ type: 'SKETCH_READY' }, '*')
}

function draw() {
  background(20)
  fill(255)
  noStroke()
  circle(width / 2, height / 2, params.radius * 2)
}

window.addEventListener('message', function(event) {
  const msg = event.data
  if (msg.type === 'SKETCH_INIT' || msg.type === 'SKETCH_RESTART') {
    if (msg.values) Object.assign(params, msg.values)
    redraw()
    return
  }
  if (msg.type === 'SKETCH_UPDATE') {
    if (msg.values) Object.assign(params, msg.values)
    redraw()
    return
  }
})
`

const DEMO_CONFIG_YAML = `
name: demo
modules:
  canvas:
    width: 600
    height: 600
  radius:
    type: range
    label: Radio
    min: 10
    max: 280
    step: 1
    default: 100
`

function buildSrcdoc(sketchJs: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>body { margin: 0; overflow: hidden; }</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js"><\/script>
</head>
<body>
<script>
${sketchJs}
<\/script>
</body>
</html>`
}

interface SketchViewerProps {
  sketchJs: string | null
  configYaml: string | null
  iframeRef: RefObject<HTMLIFrameElement | null>
  status: 'idle' | 'loading' | 'ready' | 'error'
  errorMessage: string | null
  sendInit: (config: SketchConfig, values: Record<string, unknown>) => void
  onControlsReady?: (controls: ReturnType<typeof generateControls>) => void
}

export function SketchViewer({ sketchJs, configYaml, iframeRef, status, errorMessage, sendInit, onControlsReady }: SketchViewerProps) {

  const effectiveSketchJs = sketchJs ?? DEMO_SKETCH_JS
  const effectiveConfigYaml = configYaml ?? DEMO_CONFIG_YAML

  useEffect(() => {
    let config: SketchConfig | null = null
    try {
      config = parseSketchConfig(effectiveConfigYaml)
    } catch {
      // si el YAML falla, seguimos sin config
    }

    if (config) {
      const controls = generateControls(config)
      const values = defaultValues(controls)
      onControlsReady?.(controls)
      // Pequeño delay para que el iframe cargue
      setTimeout(() => sendInit(config!, values), 200)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSketchJs, effectiveConfigYaml])

  return (
    <div className="relative w-full h-full bg-gray-950">
      <iframe
        ref={iframeRef}
        title="sketch"
        srcDoc={buildSrcdoc(effectiveSketchJs)}
        sandbox="allow-scripts"
        className="w-full h-full border-0"
      />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 text-red-200 text-xs rounded-md px-3 py-2">
          Error: {errorMessage}
        </div>
      )}
    </div>
  )
}
