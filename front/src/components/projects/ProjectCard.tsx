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
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3 hover:bg-gray-750 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/app/projects/${project.id}`}
          className="font-medium hover:text-gray-300 transition-colors line-clamp-1"
        >
          {project.name}
        </Link>
        <button
          onClick={() => onDelete(project.id)}
          className="text-gray-500 hover:text-red-400 transition-colors text-sm shrink-0"
          aria-label="Eliminar proyecto"
        >
          ✕
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Actualizado {formatDate(project.updated_at)}
      </p>
    </div>
  )
}
