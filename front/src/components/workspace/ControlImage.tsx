import { useRef, useState } from 'react'
import type { ImageControl } from '../../lib/types'
import { useProjectAssets } from '../../hooks/useProjectAssets'

interface ControlImageProps {
  control: ImageControl
  value: string
  onChange: (key: string, value: string) => void
  // Ausente en el playground público (no persiste nada, ver `public-playground`).
  assetContext: { projectId: string; userId: string } | null
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024

// Mismo estilo de botón pequeño que el resto del sidebar (ver SnapshotsPanel).
const BOTON_ESTILO: React.CSSProperties = {
  fontSize: 'var(--btn-font-size)',
  padding: 'var(--btn-padding)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--line)',
  background: 'var(--bg2)',
  color: 'var(--btn-color)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

function alPasarElRaton(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = 'var(--t1)'
  e.currentTarget.style.borderColor = 'var(--t3)'
}

function alQuitarElRaton(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.color = 'var(--btn-color)'
  e.currentTarget.style.borderColor = 'var(--line)'
}

// Lee un archivo como data URL, para el modo efímero del playground (sin Supabase).
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function ControlImage({ control, value, onChange, assetContext }: ControlImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  const projectAssets = useProjectAssets(assetContext?.projectId ?? '', assetContext?.userId ?? '')

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLocalError('Debe ser una imagen')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLocalError('Máximo 5 MB')
      return
    }
    setLocalError(null)

    if (!assetContext) {
      const dataUrl = await readAsDataUrl(file)
      onChange(control.key, dataUrl)
      return
    }

    setUploading(true)
    const asset = await projectAssets.uploadAsset(file)
    setUploading(false)
    if (asset) onChange(control.key, asset.url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-label-control)' }}>
      <span style={{ fontSize: 'var(--font-size-control-label)', color: 'var(--color-control-label)' }}>
        {control.label}
      </span>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        {value ? (
          <img
            src={value}
            alt=""
            style={{
              width: 'var(--space-6)',
              height: 'var(--space-6)',
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border-width) solid var(--line)',
            }}
          />
        ) : (
          <div style={{
            width: 'var(--space-6)',
            height: 'var(--space-6)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--t3)',
          }}>
            —
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ ...BOTON_ESTILO, cursor: uploading ? 'default' : 'pointer' }}
          onMouseEnter={uploading ? undefined : alPasarElRaton}
          onMouseLeave={uploading ? undefined : alQuitarElRaton}
        >
          {uploading ? 'Subiendo…' : 'Subir'}
        </button>

        {assetContext && (
          <button
            onClick={() => setShowPicker(prev => !prev)}
            style={BOTON_ESTILO}
            onMouseEnter={alPasarElRaton}
            onMouseLeave={alQuitarElRaton}
          >
            Galería
          </button>
        )}
      </div>

      {(localError ?? projectAssets.error) && (
        <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-error-soft)' }}>
          {localError ?? projectAssets.error}
        </span>
      )}

      {showPicker && assetContext && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          padding: 'var(--space-2)',
          background: 'var(--bg0)',
          borderRadius: 'var(--radius-md)',
        }}>
          {projectAssets.assets.length === 0 ? (
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--t3)', fontStyle: 'italic' }}>
              Sin imágenes subidas
            </p>
          ) : (
            projectAssets.assets.map(asset => (
              <button
                key={asset.id}
                title={asset.name}
                onClick={() => {
                  onChange(control.key, asset.url)
                  setShowPicker(false)
                }}
                style={{
                  width: 'var(--space-6)',
                  height: 'var(--space-6)',
                  padding: 0,
                  border: value === asset.url ? '2px solid var(--t1)' : 'var(--border-width) solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <img src={asset.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}
