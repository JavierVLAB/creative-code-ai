import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      navigate('/app')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-400">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 rounded-md py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-white hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
