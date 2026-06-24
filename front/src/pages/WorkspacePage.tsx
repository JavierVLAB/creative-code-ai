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
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Cargando proyecto...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-400">Proyecto no encontrado.</p>
        <Link to="/app" className="text-sm text-white hover:underline">← Volver a la biblioteca</Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-49px)]">
      {/* Panel izquierdo: sketch */}
      <div className="flex-1 min-w-0">
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
      <div className="w-72 flex flex-col border-l border-gray-800 shrink-0">
        <ControlPanel
          controls={controls}
          values={values}
          onChange={handleControlChange}
        />
        <ChatPlaceholder />
      </div>
    </div>
  )
}
