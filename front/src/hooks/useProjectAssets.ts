// Gestión de imágenes subidas a un proyecto: listado desde `assets` y subida a
// Storage (bucket `sketch-uploads`, público — mismo patrón que `snapshot-previews`).
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

export type Asset = Database['public']['Tables']['assets']['Row']

const MAX_SIZE_BYTES = 5 * 1024 * 1024

interface UseProjectAssetsReturn {
  assets: Asset[]
  loading: boolean
  error: string | null
  uploadAsset: (file: File) => Promise<Asset | null>
}

export function useProjectAssets(projectId: string, userId: string): UseProjectAssetsReturn {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setAssets(data ?? [])
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  async function uploadAsset(file: File): Promise<Asset | null> {
    if (!file.type.startsWith('image/')) {
      setError('Debe ser una imagen')
      return null
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Máximo 5 MB')
      return null
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'png'
    const path = `${projectId}/${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('sketch-uploads')
      .upload(path, file, { contentType: file.type })

    if (uploadError) {
      setError(uploadError.message)
      return null
    }

    const { data: urlData } = supabase.storage.from('sketch-uploads').getPublicUrl(path)

    const { data, error: insertError } = await supabase
      .from('assets')
      .insert({
        project_id: projectId,
        user_id: userId,
        name: file.name,
        url: urlData.publicUrl,
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setAssets(prev => [data, ...prev])
    return data
  }

  return { assets, loading, error, uploadAsset }
}
