import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { WorkspacePage } from './pages/WorkspacePage'
import './index.css'

const router = createBrowserRouter([
  { path: '/login',  element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
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
  { path: '/', element: <Navigate to="/app" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
