// Utilidades para capturar y subir previews de snapshots del sketch.
// Usa postMessage para que el sketch capture su propio canvas y lo devuelva al padre.

import { supabase } from './supabase'

// Espera a que el iframe tenga un canvas disponible antes de capturar.
// Devuelve un Blob PNG o null si falla tras 5 intentos.
export function captureSketchPreview(
  iframeRef: React.RefObject<HTMLIFrameElement | null>
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) {
      resolve(null)
      return
    }

    let attempts = 0
    const maxAttempts = 5

    function tryCapture() {
      attempts++
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler)
        resolve(null)
      }, 2000)

      function handler(event: MessageEvent) {
        if (event.data?.type === 'CAPTURED_CANVAS') {
          clearTimeout(timeout)
          window.removeEventListener('message', handler)

          if (!event.data.dataUrl) {
            // Canvas no disponible aún, reintentar
            if (attempts < maxAttempts) {
              setTimeout(tryCapture, 300)
            } else {
              resolve(null)
            }
            return
          }

          // Convertir data URL a Blob
          fetch(event.data.dataUrl)
            .then(res => res.blob())
            .then(blob => resolve(blob))
            .catch(() => resolve(null))
        }
      }

      window.addEventListener('message', handler)
      iframe.contentWindow!.postMessage({ type: 'CAPTURE_CANVAS' }, '*')
    }

    tryCapture()
  })
}

// Sube el Blob del preview a Supabase Storage.
// Ruta: {userId}/{projectId}/{snapshotId}.png
// Devuelve la URL pública del archivo subido, o null si falla.
export async function uploadPreview(
  blob: Blob,
  userId: string,
  projectId: string,
  snapshotId: string
): Promise<string | null> {
  try {
    const path = `${userId}/${projectId}/${snapshotId}.png`

    const { error } = await supabase.storage
      .from('snapshot-previews')
      .upload(path, blob, {
        contentType: 'image/png',
        upsert: true,
      })

    if (error) return null

    const { data: urlData } = supabase.storage
      .from('snapshot-previews')
      .getPublicUrl(path)

    return urlData.publicUrl
  } catch {
    return null
  }
}
