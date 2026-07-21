import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { SketchConfig } from '../../lib/types'
import { generateControls } from '../../lib/controls'
import { getSketchSyncMode } from '../../lib/sketch-sync'
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js"></script>
</head>
<body>
<script>
// Handler para capturar el canvas y devolverlo al padre
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'CAPTURE_CANVAS') {
    var canvas = document.querySelector('canvas')
    if (canvas) {
      try {
        var dataUrl = canvas.toDataURL('image/png')
        window.parent.postMessage({ type: 'CAPTURED_CANVAS', dataUrl: dataUrl }, '*')
      } catch (e) {
        window.parent.postMessage({ type: 'CAPTURED_CANVAS', dataUrl: null }, '*')
      }
    } else {
      window.parent.postMessage({ type: 'CAPTURED_CANVAS', dataUrl: null }, '*')
    }
  }
})
${sketchJs}
</script>
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
  sendRestart: (config: SketchConfig, values: Record<string, unknown>) => void
  onControlsReady?: (controls: ReturnType<typeof generateControls>) => void
  // Tamaño del lienzo; el iframe se renderiza centrado con estas dimensiones (look del prototipo)
  canvasSize: { width: number; height: number }
}

export function SketchViewer({ sketchJs, configYaml, iframeRef, status, errorMessage, sendInit, sendRestart, onControlsReady, canvasSize }: SketchViewerProps) {
  const effectiveSketchJs = sketchJs ?? DEMO_SKETCH_JS
  const effectiveConfigYaml = configYaml ?? DEMO_CONFIG_YAML
  const previousSketchRef = useRef<string | null>(null)
  const previousConfigRef = useRef<string | null>(null)

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
      const previousSketch = previousSketchRef.current
      const previousConfig = previousConfigRef.current
      const syncMode = getSketchSyncMode(previousSketch, previousConfig, effectiveSketchJs, effectiveConfigYaml)

      previousSketchRef.current = effectiveSketchJs
      previousConfigRef.current = effectiveConfigYaml
      onControlsReady?.(controls)
      // Pequeño delay para que el iframe cargue
      if (syncMode === 'restart') {
        sendRestart(config, values)
      } else {
        setTimeout(() => sendInit(config!, values), 200)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSketchJs, effectiveConfigYaml])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'var(--bg0)' }}>
      {/* Fondo con grid de puntos, como en el prototipo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--grid-dot-color) 1px, transparent 1px)',
        backgroundSize: 'var(--grid-dot-size)',
        pointerEvents: 'none',
      }} />
      <iframe
        // El key fuerza el remontaje (y re-ejecución de setup) al cambiar el tamaño del lienzo
        key={`${canvasSize.width}x${canvasSize.height}`}
        ref={iframeRef}
        title="sketch"
        srcDoc={buildSrcdoc(effectiveSketchJs)}
        sandbox="allow-scripts"
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ border: 'none', display: 'block', position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-canvas)' }}
      />
      {status === 'loading' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--overlay-bg)',
        }}>
          <div style={{
            width: 'var(--space-6)',
            height: 'var(--space-6)',
            borderRadius: '50%',
            border: '2px solid var(--t1)',
            borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      )}
      {status === 'error' && (
        <div style={{
          position: 'absolute',
          bottom: 'var(--space-4)',
          left: 'var(--space-4)',
          right: 'var(--space-4)',
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error-soft)',
          fontSize: 'var(--font-size-xs)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
        }}>
          Error: {errorMessage}
        </div>
      )}
    </div>
  )
}
