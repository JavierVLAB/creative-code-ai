import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'
import { LoadingScreen } from './LoadingScreen'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useSession()

  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}
