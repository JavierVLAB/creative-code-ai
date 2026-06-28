// Agrupa CanvasModule + lista de controles de parámetros en el panel lateral.
// Absorbe la lógica de render de Control[] que tenía ControlPanel,
// añadiendo el bloque de canvas arriba. ControlPanel sigue existiendo por si se usa en otro contexto.
import type { Control } from '../../lib/types'
import { CanvasModule } from './CanvasModule'
import { ControlSlider } from './ControlSlider'
import { ControlSelect } from './ControlSelect'

interface ParamsControlsProps {
  controls: Control[]
  values: Record<string, unknown>
  canvasSize: { width: number; height: number }
  onControlChange: (key: string, value: unknown) => void
  onCanvasApply: (size: { width: number; height: number }) => void
}

export function ParamsControls({
  controls,
  values,
  canvasSize,
  onControlChange,
  onCanvasApply,
}: ParamsControlsProps) {
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
              return null
            })}
          </div>
        )}
      </div>
    </div>
  )
}
