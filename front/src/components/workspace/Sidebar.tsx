// Tarjeta lateral flotante colapsable del workspace.
// Cerrado: círculo con icono hamburguesa.
// Abierto: tarjeta con header (nombre del proyecto) + secciones de control + chat.
// El estado abierto/cerrado es local; el LLM lo gestiona el backend (sin props de aiSettings).

import { useState } from 'react'
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
  // ParamsControls
  controls: Control[]
  values: Record<string, unknown>
  canvasSize: { width: number; height: number }
  onControlChange: (key: string, value: unknown) => void
  onCanvasApply: (size: { width: number; height: number }) => void
  // SnapshotsPanel
  snapshots: Snapshot[]
  onSnapshotSave: (label: string) => void
  onSnapshotLoad: (snapshot: Snapshot) => void
  // ChatPanel
  messages: ChatMessage[]
  // undefined = agente aún no disponible; ChatPanel deshabilita el input
  onChatSend?: (text: string) => void
  chatLoading?: boolean
  pendingQuestion?: string | null
  // MemoryProposalCard: se renderiza solo si hay sugerencia pendiente
  memorySuggestion?: string | null
  onMemoryApprove: (text: string) => void
  onMemoryIgnore: () => void
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function Sidebar({
  projectName,
  controls,
  values,
  canvasSize,
  onControlChange,
  onCanvasApply,
  snapshots,
  onSnapshotSave,
  onSnapshotLoad,
  messages,
  onChatSend,
  chatLoading,
  pendingQuestion,
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
        <ParamsControls
          controls={controls}
          values={values}
          canvasSize={canvasSize}
          onControlChange={onControlChange}
          onCanvasApply={onCanvasApply}
        />

        <SnapshotsPanel
          snapshots={snapshots}
          onSave={onSnapshotSave}
          onLoad={onSnapshotLoad}
        />

        {/* MemoryProposalCard: aparece encima del chat solo si hay sugerencia pendiente */}
        {memorySuggestion != null && (
          <MemoryProposalCard
            suggestion={memorySuggestion}
            onApprove={onMemoryApprove}
            onIgnore={onMemoryIgnore}
          />
        )}

        <ChatPanel
          messages={messages}
          onSend={onChatSend}
          isLoading={chatLoading}
          pendingQuestion={pendingQuestion}
        />
      </div>
    </aside>
  )
}
