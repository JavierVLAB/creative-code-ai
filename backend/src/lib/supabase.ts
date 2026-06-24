import { createClient } from '@supabase/supabase-js'

export function createAdminSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required')
  // service role key: no persistir sesión, solo operaciones de servidor
  return createClient(url, key, { auth: { persistSession: false } })
}
