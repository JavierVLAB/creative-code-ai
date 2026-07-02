import type { ReactNode } from 'react'

interface WorkspaceLayoutProps {
  viewer: ReactNode
  fileExplorer: ReactNode
  sidebar: ReactNode
  editor?: ReactNode
  devPanel?: ReactNode
}

export function WorkspaceLayout({ viewer, fileExplorer, sidebar, editor, devPanel = null }: WorkspaceLayoutProps) {
  return (
    <div style={{ display: 'flex', position: 'relative', height: 'calc(100vh - var(--topbar-height))', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        {viewer}
        <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', bottom: 'var(--space-3)', zIndex: 10, pointerEvents: 'none' }}>
          {fileExplorer}
        </div>
      </div>

      {editor}

      <div style={{ padding: 'var(--space-3)', flexShrink: 0 }}>
        {sidebar}
      </div>

      {devPanel}
    </div>
  )
}
