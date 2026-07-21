// Tabs flotantes en la esquina superior izquierda del canvas.
// Permiten alternar entre modo sketch (iframe) y modo grid (miniaturas de snapshots).

export type CanvasMode = 'sketch' | 'grid'

interface CanvasTabsProps {
  activeMode: CanvasMode
  onModeChange: (mode: CanvasMode) => void
}

export function CanvasTabs({ activeMode, onModeChange }: CanvasTabsProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 'var(--space-3)',
      left: 'var(--space-3)',
      zIndex: 10,
      display: 'flex',
      gap: '1px',
      background: 'var(--bg1)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      padding: '3px',
    }}>
      {/* Tab grid */}
      <button
        onClick={() => onModeChange('grid')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: activeMode === 'grid' ? 'var(--bg3)' : 'transparent',
          color: activeMode === 'grid' ? 'var(--t1)' : 'var(--t3)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        title="Vista grid"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
          <rect x="8" y="0.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
          <rect x="0.5" y="8" width="5.5" height="5.5" rx="1" fill="currentColor" />
          <rect x="8" y="8" width="5.5" height="5.5" rx="1" fill="currentColor" />
        </svg>
      </button>

      {/* Tab sketch */}
      <button
        onClick={() => onModeChange('sketch')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: activeMode === 'sketch' ? 'var(--bg3)' : 'transparent',
          color: activeMode === 'sketch' ? 'var(--t1)' : 'var(--t3)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        title="Vista sketch"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 1.5L12.5 4L4.5 12H2V9.5L10 1.5Z" />
        </svg>
      </button>
    </div>
  )
}
