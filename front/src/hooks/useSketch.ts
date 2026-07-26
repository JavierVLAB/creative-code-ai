import { useEffect, useRef, useState } from 'react'
import type { SketchConfig, Control } from '../lib/types'

type SketchStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UseSketchReturn {
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  status: SketchStatus
  errorMessage: string | null
  sendInit: (config: SketchConfig, values: Record<string, unknown>) => void
  sendUpdate: (values: Record<string, unknown>) => void
  sendRestart: (config: SketchConfig, values: Record<string, unknown>) => void
  requestSvgExport: () => Promise<string | null>
  // true solo si el sketch actual expone window.__exportSVG (se prueba en
  // silencio al quedar listo) — controla si se muestra el botón "Exportar SVG".
  svgExportAvailable: boolean
}

// Extrae los valores por defecto de los controles generados
export function defaultValues(controls: Control[]): Record<string, unknown> {
  return Object.fromEntries(controls.map(c => [c.key, c.defaultValue]))
}

export function useSketch(): UseSketchReturn {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [status, setStatus] = useState<SketchStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [svgExportAvailable, setSvgExportAvailable] = useState(false)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Solo procesar mensajes del iframe propio
      if (event.source !== iframeRef.current?.contentWindow) return

      const msg = event.data as { type: string; message?: string; supported?: boolean }

      if (msg.type === 'SKETCH_READY') {
        setStatus('ready')
        setErrorMessage(null)
        // Chequeo barato: ¿este sketch expone window.__exportSVG?
        iframeRef.current?.contentWindow?.postMessage({ type: 'HAS_SVG_EXPORT' }, '*')
      } else if (msg.type === 'SKETCH_ERROR') {
        setStatus('error')
        setErrorMessage(msg.message ?? 'Error desconocido en el sketch')
      } else if (msg.type === 'HAS_SVG_EXPORT_RESULT') {
        setSvgExportAvailable(Boolean(msg.supported))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  function postToSketch(payload: unknown) {
    iframeRef.current?.contentWindow?.postMessage(payload, '*')
  }

  function sendInit(config: SketchConfig, values: Record<string, unknown>) {
    setStatus('loading')
    postToSketch({ type: 'SKETCH_INIT', config, values })
  }

  function sendUpdate(values: Record<string, unknown>) {
    postToSketch({ type: 'SKETCH_UPDATE', values })
  }

  function sendRestart(config: SketchConfig, values: Record<string, unknown>) {
    postToSketch({ type: 'SKETCH_RESTART', config, values })
  }

  // Pide al sketch su SVG (si lo soporta) vía el bridge EXPORT_SVG/EXPORTED_SVG.
  // La descarga real la dispara quien llame a esto, fuera del iframe sandboxed
  // (mismo motivo que CAPTURE_CANVAS/CAPTURED_CANVAS para el PNG).
  function requestSvgExport(): Promise<string | null> {
    return new Promise((resolve) => {
      const iframeWindow = iframeRef.current?.contentWindow
      if (!iframeWindow) {
        resolve(null)
        return
      }

      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler)
        resolve(null)
      }, 5000)

      function handler(event: MessageEvent) {
        if (event.source !== iframeWindow) return
        if (event.data?.type !== 'EXPORTED_SVG') return
        clearTimeout(timeout)
        window.removeEventListener('message', handler)
        resolve(event.data.svg ?? null)
      }

      window.addEventListener('message', handler)
      iframeWindow.postMessage({ type: 'EXPORT_SVG' }, '*')
    })
  }

  return { iframeRef, status, errorMessage, sendInit, sendUpdate, sendRestart, requestSvgExport, svgExportAvailable }
}
