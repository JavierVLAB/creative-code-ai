import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { ProjectCard } from '../components/projects/ProjectCard'
import { CreateProjectDialog } from '../components/projects/CreateProjectDialog'

export function ProjectsPage() {
  const navigate = useNavigate()
  const { projects, loading, error, createProject, deleteProject } = useProjects()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  async function handleCreate(name: string) {
    const project = await createProject(name)
    setShowCreate(false)
    if (project) navigate(`/app/projects/${project.id}`)
  }

  async function handleDelete(id: string) {
    await deleteProject(id)
    setDeleteTarget(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis proyectos</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          + Nuevo proyecto
        </button>
      </div>

      {loading && (
        <p className="text-gray-500 text-sm">Cargando...</p>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-center py-16 text-gray-500 space-y-2">
          <p className="text-4xl">🎨</p>
          <p>Aún no tienes proyectos.</p>
          <p className="text-sm">Crea uno para empezar a explorar.</p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={id => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectDialog
          onConfirm={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="font-semibold">Eliminar proyecto</h2>
            <p className="text-sm text-gray-400">
              Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este proyecto?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
