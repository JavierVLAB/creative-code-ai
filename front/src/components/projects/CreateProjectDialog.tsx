import { useState } from 'react'

interface CreateProjectDialogProps {
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function CreateProjectDialog({ onConfirm, onCancel }: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [confirmHover, setConfirmHover] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) onConfirm(name.trim())
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.72)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: 'var(--bg1)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        <h2 style={{ fontWeight: 600, fontSize: 'var(--font-size-title)', color: 'var(--t1)' }}>
          Nuevo proyecto
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del proyecto"
            autoFocus
            style={{
              width: '100%',
              backgroundColor: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-size-input)',
              color: 'var(--t1)',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--font-size-small)',
                color: 'var(--t2)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              onMouseEnter={() => setConfirmHover(true)}
              onMouseLeave={() => setConfirmHover(false)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--font-size-small)',
                backgroundColor: confirmHover && name.trim() ? 'var(--bg3)' : 'var(--t1)',
                color: 'var(--bg0)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500,
                border: 'none',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                opacity: name.trim() ? 1 : 0.4,
                transition: 'background-color var(--transition-fast)',
              }}
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
