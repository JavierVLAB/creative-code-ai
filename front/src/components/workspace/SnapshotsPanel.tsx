// Panel de snapshots: guarda la combinación actual de parámetros con una etiqueta
// y permite recargar snapshots previos. Componente "tonto": la persistencia en
// Supabase (insert/select sobre la tabla `snapshots`) la gestiona WorkspacePage.
import { useState } from 'react'
import type { Snapshot } from '../../lib/types'

interface SnapshotsPanelProps {
  snapshots: Snapshot[]
  onSave: (label: string) => void
  onLoad: (snapshot: Snapshot) => void
  onShowGrid?: () => void
}

export function SnapshotsPanel({ snapshots, onSave, onLoad, onShowGrid }: SnapshotsPanelProps) {
  const [label, setLabel] = useState('')

  function handleSave() {
    // Si el usuario no escribe etiqueta, autogeneramos una con el índice siguiente.
    const finalLabel = label.trim() || `Snapshot ${snapshots.length + 1}`
    onSave(finalLabel)
    setLabel('')
  }

  return (
    <div style={{ borderBottom: '1px solid var(--line)', padding: 'var(--padding-module) var(--padding-section)' }}>
      {/* Cabecera: título de sección + botones */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--gap-section-title)',
        }}
      >
        <span style={{
          fontSize: 'var(--font-size-section-title)',
          color: 'var(--color-section-title)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Snapshots
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          {snapshots.length > 0 && onShowGrid && (
            <button
              onClick={onShowGrid}
              style={{
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
              Grid
            </button>
          )}
          <button
            onClick={handleSave}
            style={{
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
            Guardar
          </button>
        </div>
      </div>

      {/* Input de nombre del snapshot — exclusivo del nuevo; no está en el prototipo */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          placeholder="Nombre del snapshot"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontSize: 'var(--font-size-input)',
            padding: 'var(--input-padding)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--line)',
            background: 'var(--bg0)',
            color: 'var(--t1)',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      </div>

      {/* Lista de snapshots cargables */}
      {snapshots.length === 0 ? (
        <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--t3)', fontStyle: 'italic' }}>
          Sin snapshots guardados
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {snapshots.map(snap => (
            <button
              key={snap.id}
              onClick={() => onLoad(snap)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--line)',
                background: 'var(--bg0)',
                color: 'var(--t2)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'var(--font-size-body)',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--t1)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--t3)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--t2)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'
              }}
            >
              <span>{snap.label}</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--t3)' }}>
                {new Date(snap.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
