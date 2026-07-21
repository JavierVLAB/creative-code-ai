// Barra de acciones bulk que aparece cuando hay snapshots seleccionados en el grid.
// Se muestra como un banner fijo en la parte superior del grid.

interface BulkActionBarProps {
  count: number
  onClearSelection: () => void
  onBulkDelete: () => void
  onBulkFavorite: () => void
}

export function BulkActionBar({ count, onClearSelection, onBulkDelete, onBulkFavorite }: BulkActionBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-2) var(--space-4)',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--line)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--t2)' }}>
        {count} {count === 1 ? 'seleccionado' : 'seleccionados'}
      </span>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          onClick={onClearSelection}
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
          onClick={onBulkFavorite}
          style={{
            fontSize: 'var(--btn-font-size)',
            padding: 'var(--btn-padding)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--line)',
            background: 'var(--bg2)',
            color: '#fbbf24',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--t3)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Favorita
        </button>

        <button
          onClick={onBulkDelete}
          style={{
            fontSize: 'var(--btn-font-size)',
            padding: 'var(--btn-padding)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--line)',
            background: 'var(--bg2)',
            color: 'var(--color-error)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-error)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Borrar
        </button>
      </div>
    </div>
  )
}
