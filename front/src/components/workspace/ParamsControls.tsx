// Agrupa CanvasModule + lista de controles de parámetros en el panel lateral.
// Absorbe la lógica de render de Control[] que tenía ControlPanel,
// añadiendo el bloque de canvas arriba. ControlPanel sigue existiendo por si se usa en otro contexto.
import { useState } from 'react'
import type { Control } from '../../lib/types'
import { CanvasModule } from './CanvasModule'
import { ControlSlider } from './ControlSlider'
import { ControlSelect } from './ControlSelect'
import { ControlImage } from './ControlImage'

interface ParamsControlsProps {
  controls: Control[]
  values: Record<string, unknown>
  canvasSize: { width: number; height: number }
  onControlChange: (key: string, value: unknown) => void
  onCanvasApply: (size: { width: number; height: number }) => void
  // Ausente en el playground público (no persiste nada, ver `public-playground`).
  assetContext?: { projectId: string; userId: string } | null
  // Exportación SVG (ver sketch-workspace). Ausente o null → el sketch actual
  // no la soporta. Vive dentro del bloque de parámetros (no es una sección
  // aparte) para no añadir otra línea divisoria en el sidebar.
  onExportSvg?: () => Promise<string | null>
}

export function ParamsControls({
  controls,
  values,
  canvasSize,
  onControlChange,
  onCanvasApply,
  assetContext = null,
  onExportSvg,
}: ParamsControlsProps) {
  const [svgExportNotice, setSvgExportNotice] = useState<string | null>(null)

  async function handleExportSvg() {
    if (!onExportSvg) return
    setSvgExportNotice(null)
    const svg = await onExportSvg()
    if (!svg) {
      setSvgExportNotice('No se pudo exportar.')
      setTimeout(() => setSvgExportNotice(null), 4000)
      return
    }
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sketch.svg'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      <CanvasModule
        width={canvasSize.width}
        height={canvasSize.height}
        onApply={onCanvasApply}
      />

      <div style={{ borderBottom: '1px solid var(--line)', padding: 'var(--space-2) var(--padding-section) var(--padding-section)' }}>
        <div style={{
          fontSize: 'var(--font-size-section-title)',
          color: 'var(--color-section-title)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: 'var(--padding-section-top) 0 var(--gap-section-title)',
        }}>
          Parámetros
        </div>

        {controls.length === 0 ? (
          <div style={{
            fontSize: 'var(--font-size-control-label)',
            color: 'var(--color-section-title)',
          }}>
            Sin controles definidos.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-controls)' }}>
            {controls.map(control => {
              if (control.kind === 'slider') {
                return (
                  <ControlSlider
                    key={control.key}
                    control={control}
                    value={(values[control.key] as number) ?? control.defaultValue}
                    onChange={onControlChange}
                  />
                )
              }
              if (control.kind === 'select') {
                return (
                  <ControlSelect
                    key={control.key}
                    control={control}
                    value={(values[control.key] as string) ?? control.defaultValue}
                    onChange={onControlChange}
                  />
                )
              }
              if (control.kind === 'image') {
                return (
                  <ControlImage
                    key={control.key}
                    control={control}
                    value={(values[control.key] as string) ?? control.defaultValue}
                    onChange={onControlChange}
                    assetContext={assetContext}
                  />
                )
              }
              return null
            })}
          </div>
        )}

        {onExportSvg && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginTop: 'var(--gap-controls)' }}>
            <button
              onClick={handleExportSvg}
              style={{
                alignSelf: 'flex-start',
                fontSize: 'var(--btn-font-size)',
                padding: 'var(--btn-padding)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                background: 'var(--bg2)',
                color: 'var(--btn-color)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--t1)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--t3)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--btn-color)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'
              }}
            >
              Exportar SVG
            </button>
            {svgExportNotice && (
              <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--t3)' }}>
                {svgExportNotice}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
