import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RootRedirect } from './components/auth/RootRedirect'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { WorkspacePage } from './pages/WorkspacePage'
import { PlaygroundPage } from './pages/PlaygroundPage'
import './index.css'

export const appRoutes = [
  { path: '/login',  element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/playground', element: <PlaygroundPage /> },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ProjectsPage /> },
      { path: 'projects/:id', element: <WorkspacePage /> },
    ],
  },
  { path: '/', element: <RootRedirect /> },
]

if (typeof document !== 'undefined') {
  const router = createBrowserRouter(appRoutes)
  const rootElement = document.getElementById('root')

  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    )
  }
}
