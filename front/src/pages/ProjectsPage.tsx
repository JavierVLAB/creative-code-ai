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
  const [newBtnHover, setNewBtnHover] = useState(false)
  const [deleteBtnHover, setDeleteBtnHover] = useState(false)

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
    <div style={{
      maxWidth: 768,
      margin: '0 auto',
      padding: 'var(--space-6) var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      overflowY: 'auto',
      height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--t1)' }}>Mis proyectos</h1>
        <button
          onClick={() => setShowCreate(true)}
          onMouseEnter={() => setNewBtnHover(true)}
          onMouseLeave={() => setNewBtnHover(false)}
          style={{
            backgroundColor: newBtnHover ? 'var(--bg3)' : 'var(--t1)',
            color: 'var(--bg0)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-small)',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          + Nuevo proyecto
        </button>
      </div>

      {loading && (
        <p style={{ color: 'var(--t3)', fontSize: 'var(--font-size-small)' }}>Cargando...</p>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: 'var(--font-size-small)' }}>{error}</p>
      )}

      {!loading && projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-6) 0', color: 'var(--t3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <p style={{ fontSize: 40 }}>🎨</p>
          <p>Aún no tienes proyectos.</p>
          <p style={{ fontSize: 'var(--font-size-small)' }}>Crea uno para empezar a explorar.</p>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
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
            <h2 style={{ fontWeight: 600, color: 'var(--t1)' }}>Eliminar proyecto</h2>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--t2)' }}>
              Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este proyecto?
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
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
                onClick={() => handleDelete(deleteTarget)}
                onMouseEnter={() => setDeleteBtnHover(true)}
                onMouseLeave={() => setDeleteBtnHover(false)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--font-size-small)',
                  backgroundColor: deleteBtnHover ? '#dc2626' : '#ef4444',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                }}
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
