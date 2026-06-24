import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Database } from '../../lib/database.types'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const [deleteHover, setDeleteHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? 'var(--bg2)' : 'var(--bg1)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        transition: 'background-color var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <Link
          to={`/app/projects/${project.id}`}
          style={{
            fontWeight: 500,
            color: 'var(--t1)',
            textDecoration: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {project.name}
        </Link>
        <button
          onClick={() => onDelete(project.id)}
          onMouseEnter={() => setDeleteHover(true)}
          onMouseLeave={() => setDeleteHover(false)}
          aria-label="Eliminar proyecto"
          style={{
            color: deleteHover ? '#f87171' : 'var(--t3)',
            fontSize: 'var(--font-size-small)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'color var(--transition-fast)',
          }}
        >
          ✕
        </button>
      </div>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--t3)' }}>
        Actualizado {formatDate(project.updated_at)}
      </p>
    </div>
  )
}
