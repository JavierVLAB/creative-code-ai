// Grid de miniaturas de snapshots que reemplaza al iframe del sketch en modo grid.
// Click en checkbox → selección. Click en imagen → cargar snapshot.
// Hover muestra acciones: favorita (estrella) y borrar (papelera).

import { useState } from 'react'
import type { Snapshot } from '../../lib/types'

interface SnapshotGridProps {
  snapshots: Snapshot[]
  selectedIds: Set<string>
  favoriteIds: Set<string>
  onSelect: (id: string, multi: boolean) => void
  onLoad: (snapshot: Snapshot) => void
  onToggleFavorite: (id: string) => void
  onDelete: (ids: string[]) => void
}

export function SnapshotGrid({ snapshots, selectedIds, favoriteIds, onSelect, onLoad, onToggleFavorite, onDelete }: SnapshotGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  function handleCheckboxClick(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    // El check siempre añade/quita de la selección, sin importar Cmd/Ctrl
    onSelect(id, true)
  }

  function handleImageClick(snapshot: Snapshot, e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey) {
      onSelect(snapshot.id, true)
    } else {
      onLoad(snapshot)
    }
  }

  function handleFavoriteClick(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    onToggleFavorite(id)
  }

  function handleDeleteClick(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    onDelete([id])
  }

  if (snapshots.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--t3)',
        fontSize: 'var(--font-size-small)',
        fontStyle: 'italic',
      }}>
        Sin snapshots guardados
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, 160px)',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      paddingTop: 'calc(var(--space-4) + 44px)',
      height: '100%',
      overflowY: 'auto',
      alignContent: 'start',
    }}>
      {snapshots.map(snapshot => {
        const isSelected = selectedIds.has(snapshot.id)
        const isFavorite = favoriteIds.has(snapshot.id)
        const isHovered = hoveredId === snapshot.id

        return (
          <div
            key={snapshot.id}
            onMouseEnter={() => setHoveredId(snapshot.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              position: 'relative',
              background: 'var(--bg2)',
              border: `1px solid ${isSelected ? 'var(--t1)' : isHovered ? 'var(--t3)' : 'var(--line)'}`,
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            {/* Checkbox de selección */}
            <div
              onClick={(e) => handleCheckboxClick(e, snapshot.id)}
              style={{
                position: 'absolute',
                top: 'var(--space-2)',
                left: 'var(--space-2)',
                zIndex: 3,
                width: '18px',
                height: '18px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'var(--t1)' : 'rgba(0,0,0,0.5)',
                border: `1px solid ${isSelected ? 'var(--t1)' : 'rgba(255,255,255,0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
              }}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="var(--bg0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Estrella persistente en favoritas */}
            {isFavorite && (
              <div style={{
                position: 'absolute',
                top: 'var(--space-2)',
                right: 'var(--space-2)',
                zIndex: 2,
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
            )}

            {/* Acciones hover (estrella, papelera) */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                top: 'var(--space-2)',
                right: 'var(--space-2)',
                zIndex: 3,
                display: 'flex',
                gap: 'var(--space-1)',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px',
              }}>
                <button
                  onClick={(e) => handleFavoriteClick(e, snapshot.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    border: 'none',
                    background: 'transparent',
                    color: isFavorite ? '#fbbf24' : 'var(--t3)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  title="Marcar favorita"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, snapshot.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--t3)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t3)' }}
                  title="Borrar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            )}

            {/* Imagen del preview o placeholder */}
            <div onClick={(e) => handleImageClick(snapshot, e)}>
              {snapshot.previewUrl ? (
                <img
                  src={snapshot.previewUrl}
                  alt={snapshot.label}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg1)',
                  color: 'var(--t3)',
                  gap: 'var(--space-2)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={{ fontSize: 'var(--font-size-xs)', textAlign: 'center', padding: '0 var(--space-2)' }}>
                    {snapshot.label}
                  </span>
                </div>
              )}
            </div>

            {/* Label debajo de la imagen */}
            <div style={{
              padding: 'var(--space-2)',
              borderTop: '1px solid var(--line)',
            }}>
              <span style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--t2)',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {snapshot.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
