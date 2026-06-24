import { Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useSession } from '../../hooks/useSession'

export function AppShell() {
  const { session } = useSession()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-lg">CurateArtAI</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{session?.user.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Salir
          </button>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
