import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useSession } from '../../hooks/useSession'

export function AppShell() {
  const { session } = useSession()
  const [logoutHover, setLogoutHover] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg0)', color: 'var(--t1)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--bg1)',
        borderBottom: '1px solid var(--line)',
        padding: '0 var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-title)', color: 'var(--t1)' }}>
          CurateArtAI
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--t3)' }}>
            {session?.user.email}
          </span>
          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
            style={{
              fontSize: 'var(--font-size-small)',
              color: logoutHover ? 'var(--t1)' : 'var(--t2)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
          >
            Salir
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}
