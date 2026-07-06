import { Navigate } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'
import { LoadingScreen } from './LoadingScreen'

// Punto de entrada `/`: los usuarios con sesión van a su espacio de trabajo (`/app`);
// los visitantes sin sesión aterrizan en el demo público (`/playground`, sin login ni AI).
export function RootRedirect() {
  const { session, loading } = useSession()

  if (loading) return <LoadingScreen />
  return <Navigate to={session ? '/app' : '/playground'} replace />
}
