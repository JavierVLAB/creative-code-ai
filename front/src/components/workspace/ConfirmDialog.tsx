// Diálogo de confirmación para borrado de snapshots.
// Overlay oscuro con card centrada, título, mensaje y botones de confirmar/cancelar.

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel = 'Borrar', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--overlay-bg)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg1)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-6)',
          maxWidth: '380px',
          width: '90%',
        }}
      >
        <h3 style={{
          fontSize: 'var(--font-size-body)',
          fontWeight: 600,
          color: 'var(--t1)',
          marginBottom: 'var(--space-2)',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: 'var(--font-size-small)',
          color: 'var(--t2)',
          marginBottom: 'var(--space-6)',
          lineHeight: 1.5,
        }}>
          {message}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-2)',
        }}>
          <button
            onClick={onCancel}
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
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              fontSize: 'var(--btn-font-size)',
              padding: 'var(--btn-padding)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-error)',
              background: 'transparent',
              color: 'var(--color-error)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--color-error)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--bg0)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
