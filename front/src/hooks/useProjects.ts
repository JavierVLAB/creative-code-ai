import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BLANK_CONFIG_YAML, BLANK_SKETCH_JS } from '../lib/blankSketch'
import type { Database } from '../lib/database.types'
import type { ProjectOrigin } from '../lib/types'

type Project = Database['public']['Tables']['projects']['Row']

// Exportada para tests: resuelve el sketch_js/config_yaml inicial según el origen elegido.
export function resolveOriginContent(origin: ProjectOrigin): { sketchJs: string; configYaml: string } {
  if (origin.type === 'template') {
    return { sketchJs: origin.sketchJs, configYaml: origin.configYaml }
  }
  return { sketchJs: BLANK_SKETCH_JS, configYaml: BLANK_CONFIG_YAML }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchProjects() {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setProjects(data ?? [])
    }
    setLoading(false)
  }

  async function createProject(name: string, origin: ProjectOrigin = { type: 'blank' }): Promise<Project | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { sketchJs, configYaml } = resolveOriginContent(origin)

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, user_id: user.id, sketch_js: sketchJs, config_yaml: configYaml })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return null
    }

    setProjects(prev => [data, ...prev])
    return data
  }

  async function deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setProjects(prev => prev.filter(p => p.id !== id))
    }
  }

  // Carga inicial al montar. `loading` ya arranca en `true`, así que el
  // setState del fetch no introduce un render extra problemático; la regla es
  // conservadora con el fetch-on-mount, que aquí es intencional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProjects() }, [])

  return { projects, loading, error, createProject, deleteProject, refetch: fetchProjects }
}
