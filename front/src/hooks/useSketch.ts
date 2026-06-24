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
}

// Extrae los valores por defecto de los controles generados
export function defaultValues(controls: Control[]): Record<string, unknown> {
  return Object.fromEntries(controls.map(c => [c.key, c.defaultValue]))
}

export function useSketch(): UseSketchReturn {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [status, setStatus] = useState<SketchStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Solo procesar mensajes del iframe propio
      if (event.source !== iframeRef.current?.contentWindow) return

      const msg = event.data as { type: string; message?: string }

      if (msg.type === 'SKETCH_READY') {
        setStatus('ready')
        setErrorMessage(null)
      } else if (msg.type === 'SKETCH_ERROR') {
        setStatus('error')
        setErrorMessage(msg.message ?? 'Error desconocido en el sketch')
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

  return { iframeRef, status, errorMessage, sendInit, sendUpdate, sendRestart }
}
