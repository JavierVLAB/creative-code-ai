import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--bg2)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--font-size-input)',
  color: 'var(--t1)',
  outline: 'none',
}

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/app')
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg0)', color: 'var(--t1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 360, padding: '0 var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>Entrar</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--font-size-small)', color: 'var(--t2)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--font-size-small)', color: 'var(--t2)' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          {error && <p style={{ fontSize: 'var(--font-size-small)', color: '#f87171' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              width: '100%',
              backgroundColor: btnHover && !loading ? 'var(--bg3)' : 'var(--t1)',
              color: 'var(--bg0)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-2) 0',
              fontSize: 'var(--font-size-body)',
              fontWeight: 500,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'background-color var(--transition-fast)',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ fontSize: 'var(--font-size-small)', textAlign: 'center', color: 'var(--t3)' }}>
          ¿Sin cuenta?{' '}
          <Link to="/signup" style={{ color: 'var(--t1)', textDecoration: 'underline' }}>
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  )
}
