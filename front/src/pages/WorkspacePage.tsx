import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import type { Control } from '../lib/types'
import { useSketch } from '../hooks/useSketch'
import { SketchViewer } from '../components/workspace/SketchViewer'
import { ControlPanel } from '../components/workspace/ControlPanel'
import { ChatPlaceholder } from '../components/workspace/ChatPlaceholder'

type Project = Database['public']['Tables']['projects']['Row']

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [controls, setControls] = useState<Control[]>([])
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  const { iframeRef, status, errorMessage, sendInit, sendUpdate } = useSketch()

  useEffect(() => {
    if (!id) return
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setProject(data)
        setLoading(false)
      })
  }, [id])

  function handleControlsReady(newControls: Control[]) {
    setControls(newControls)
    const defaults = Object.fromEntries(newControls.map(c => [c.key, c.defaultValue]))
    setValues(defaults)
  }

  function handleControlChange(key: string, value: unknown) {
    const newValues = { ...values, [key]: value }
    setValues(newValues)
    sendUpdate(newValues)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t3)', fontSize: 'var(--font-size-small)' }}>
        Cargando proyecto...
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'var(--space-4)' }}>
        <p style={{ color: 'var(--t2)' }}>Proyecto no encontrado.</p>
        <Link to="/app" style={{ fontSize: 'var(--font-size-small)', color: 'var(--t1)', textDecoration: 'underline' }}>
          ← Volver a la biblioteca
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--topbar-height))' }}>
      {/* Panel izquierdo: sketch */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <SketchViewer
          sketchJs={project.sketch_js}
          configYaml={project.config_yaml}
          iframeRef={iframeRef}
          status={status}
          errorMessage={errorMessage}
          sendInit={sendInit}
          onControlsReady={handleControlsReady}
        />
      </div>

      {/* Panel derecho: controles + chat */}
      <div style={{
        width: 288,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--line)',
        flexShrink: 0,
        backgroundColor: 'var(--bg1)',
      }}>
        <ControlPanel controls={controls} values={values} onChange={handleControlChange} />
        <ChatPlaceholder />
      </div>
    </div>
  )
}
