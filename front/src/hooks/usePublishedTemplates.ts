import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mapTemplate } from '../lib/templates'
import type { Template } from '../lib/types'

export function usePublishedTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function fetchTemplates() {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('templates')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true })

      if (!active) return

      if (queryError) {
        setError(queryError.message)
        setTemplates([])
      } else {
        setError(null)
        setTemplates((data ?? []).map(mapTemplate))
      }

      setLoading(false)
    }

    fetchTemplates()
    return () => { active = false }
  }, [])

  return { templates, loading, error }
}
