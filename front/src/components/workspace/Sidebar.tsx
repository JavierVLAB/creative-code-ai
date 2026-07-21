// Tarjeta lateral flotante colapsable del workspace.
// Cerrado: círculo con icono hamburguesa.
// Abierto: tarjeta con header (nombre del proyecto) + secciones de control + chat.
// El estado abierto/cerrado es local; el LLM lo gestiona el backend (sin props de aiSettings).

import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Control, Snapshot, ChatMessage } from '../../lib/types'
import { ParamsControls } from './ParamsControls'
import { SnapshotsPanel } from './SnapshotsPanel'
import { ChatPanel } from './ChatPanel'
import { MemoryProposalCard } from './MemoryProposalCard'

// ─── Icono hamburguesa inline ────────────────────────────────────────────────
// SVG sencillo de tres líneas. Evita dependencia externa de iconos.
function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="10.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  projectName: string
  statusNotice?: {
    title: string
    description: string
    ctaHref?: string
    ctaLabel?: string
  }
  // ParamsControls
  controls: Control[]
  values: Record<string, unknown>
  canvasSize: { width: number; height: number }
  onControlChange: (key: string, value: unknown) => void
  onCanvasApply: (size: { width: number; height: number }) => void
  showControls?: boolean
  // SnapshotsPanel
  snapshots: Snapshot[]
  onSnapshotSave: (label: string) => void
  onSnapshotLoad: (snapshot: Snapshot) => void
  onShowGrid?: () => void
  showSnapshots?: boolean
  // ChatPanel
  messages: ChatMessage[]
  onChatSend?: (text: string) => void
  chatLoading?: boolean
  pendingQuestion?: string | null
  chatTitle?: string
  chatDisabledState?: {
    title: string
    description: string
    ctaHref?: string
    ctaLabel?: string
  }
  chatDisabledPlaceholder?: string
  chatDisabledButtonLabel?: string
  memorySuggestion?: string | null
  onMemoryApprove?: (text: string) => void
  onMemoryIgnore?: () => void
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function Sidebar({
  projectName,
  statusNotice,
  controls,
  values,
  canvasSize,
  onControlChange,
  onCanvasApply,
  showControls = true,
  snapshots,
  onSnapshotSave,
  onSnapshotLoad,
  onShowGrid,
  showSnapshots = true,
  messages,
  onChatSend,
  chatLoading,
  pendingQuestion,
  chatTitle,
  chatDisabledState,
  chatDisabledPlaceholder,
  chatDisabledButtonLabel,
  memorySuggestion,
  onMemoryApprove,
  onMemoryIgnore,
}: SidebarProps) {
  // Estado local: la tarjeta se abre/cierra sin implicar al padre
  const [isOpen, setIsOpen] = useState(false)

  // ── Vista colapsada: botón circular con hamburguesa ──────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Abrir panel lateral"
        style={{
          pointerEvents: 'auto',
          alignSelf: 'flex-start',
          flexShrink: 0,
          width: 'var(--size-icon-btn)',
          height: 'var(--size-icon-btn)',
          borderRadius: '50%',
          background: 'var(--bg2)',
          border: 'var(--border-width) solid var(--line)',
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--t2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `color var(--transition-fast), border-color var(--transition-fast)`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--t1)'
          e.currentTarget.style.borderColor = 'var(--t3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--t2)'
          e.currentTarget.style.borderColor = 'var(--line)'
        }}
      >
        <HamburgerIcon />
      </button>
    )
  }

  // ── Vista expandida: tarjeta flotante con secciones ──────────────────────
  return (
    <aside
      style={{
        pointerEvents: 'auto',
        flexShrink: 0,
        width: 'var(--sidebar-width)',
        height: '100%',
        background: 'var(--bg1)',
        borderRadius: 'var(--radius-lg)',
        border: 'var(--border-width) solid var(--line)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header: nombre del proyecto + botón de colapso */}
      <div style={{
        padding: 'var(--space-3) var(--space-3) var(--space-3) var(--padding-section)',
        borderBottom: 'var(--border-width) solid var(--line)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-2)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 'var(--font-size-title)',
            fontWeight: 500,
            color: 'var(--t1)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {projectName}
          </div>
        </div>

        {/* Botón de colapso: chevron izquierdo */}
        <button
          onClick={() => setIsOpen(false)}
          title="Colapsar panel"
          style={{
            flexShrink: 0,
            width: 'var(--space-6)',
            height: 'var(--space-6)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--line)',
            background: 'transparent',
            color: 'var(--t3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-input)',
            lineHeight: 1,
            transition: `color var(--transition-fast), background var(--transition-fast)`,
            marginTop: '1px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--t1)'
            e.currentTarget.style.background = 'var(--bg3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--t3)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          ‹
        </button>
      </div>

      {/* Contenido scrollable:
          orden visual → ParamsControls → SnapshotsPanel → MemoryProposalCard (condicional) → ChatPanel */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {statusNotice && (
          <div style={{ padding: 'var(--padding-module) var(--padding-section) 0' }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--t3)',
            }}>
              <strong style={{ fontSize: 'var(--font-size-xs)', color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {statusNotice.title}
              </strong>
              <p style={{ lineHeight: 1.4 }}>
                {statusNotice.description}
              </p>
              {statusNotice.ctaHref && statusNotice.ctaLabel && (
                <Link
                  to={statusNotice.ctaHref}
                  style={{ color: 'var(--t2)', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                >
                  {statusNotice.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        )}

        {showControls && (
          <ParamsControls
            controls={controls}
            values={values}
            canvasSize={canvasSize}
            onControlChange={onControlChange}
            onCanvasApply={onCanvasApply}
          />
        )}

        {showSnapshots && (
          <SnapshotsPanel
            snapshots={snapshots}
            onSave={onSnapshotSave}
            onLoad={onSnapshotLoad}
            onShowGrid={onShowGrid}
          />
        )}

        {memorySuggestion != null && onMemoryApprove && onMemoryIgnore && (
          <MemoryProposalCard
            suggestion={memorySuggestion}
            onApprove={onMemoryApprove}
            onIgnore={onMemoryIgnore}
          />
        )}

        <ChatPanel
          title={chatTitle}
          messages={messages}
          onSend={onChatSend}
          isLoading={chatLoading}
          pendingQuestion={pendingQuestion}
          disabledState={chatDisabledState}
          disabledPlaceholder={chatDisabledPlaceholder ?? (chatDisabledState ? 'Disponible al iniciar sesión...' : undefined)}
          disabledButtonLabel={chatDisabledButtonLabel ?? (chatDisabledState ? 'IA no disponible' : undefined)}
        />
      </div>
    </aside>
  )
}
