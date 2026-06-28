// Panel flotante del explorador de archivos del workspace.
// Cerrado: círculo con icono de árbol en la esquina superior izquierda.
// Abierto: tarjeta flotante con enlace "← Biblioteca" y dos archivos clicables del proyecto activo.
// No usa File System Access API — los archivos son fijos (sketch.js / config.yaml).

import { useState } from 'react'

// Icono de árbol de archivos — igual que en el prototipo
function FileTreeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="2" x2="3" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3.7 3.7l2.1 2.1M10.2 10.2l2.1 2.1M3.7 12.3l2.1-2.1M10.2 5.8l2.1-2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

// Los dos archivos fijos que tiene todo proyecto activo
type ProjectFile = 'sketch.js' | 'config.yaml'

const PROJECT_FILES: { name: ProjectFile; icon: string }[] = [
  { name: 'sketch.js', icon: '▸' },
  { name: 'config.yaml', icon: '{}' },
]

interface FileExplorerPanelProps {
  // Archivo activo en el editor — determina qué item queda resaltado
  activeFile: ProjectFile | null
  // Notifica al padre qué archivo abrir en el editor
  onSelectFile: (file: ProjectFile) => void
  // Vuelve a la biblioteca de proyectos (reemplaza "Abrir carpeta" del prototipo)
  onNavigateLibrary: () => void
}

// Estilos del botón circular de toggle — igual que en el prototipo original
const iconBtnStyle: React.CSSProperties = {
  pointerEvents: 'auto',
  alignSelf: 'flex-start',
  flexShrink: 0,
  width: 'var(--size-icon-btn)',
  height: 'var(--size-icon-btn)',
  borderRadius: '50%',
  background: 'var(--bg2)',
  border: 'var(--border-width) solid var(--line)',
  boxShadow: 'var(--shadow-sm)',
  color: 'var(--t2)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color var(--transition-fast), border-color var(--transition-fast)',
}

export function FileExplorerPanel({
  activeFile,
  onSelectFile,
  onNavigateLibrary,
}: FileExplorerPanelProps) {
  // Estado open/closed es local — el padre solo necesita saber qué archivo está activo
  const [isOpen, setIsOpen] = useState(false)

  // Cerrado: círculo con icono de árbol
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Abrir explorador de archivos"
        style={iconBtnStyle}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--t1)'
          e.currentTarget.style.borderColor = 'var(--t3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--t2)'
          e.currentTarget.style.borderColor = 'var(--line)'
        }}
      >
        <FileTreeIcon />
      </button>
    )
  }

  // Abierto: tarjeta flotante
  return (
    <div
      style={{
        pointerEvents: 'auto',
        width: 'var(--explorer-width)',
        height: '100%',
        background: 'var(--bg1)',
        borderRadius: 'var(--radius-lg)',
        border: 'var(--border-width) solid var(--line)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header: botones de acción + botón de colapso */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-3) var(--space-3) var(--padding-section)',
        borderBottom: 'var(--border-width) solid var(--line)',
        flexShrink: 0,
      }}>
        {/* Enlace "← Biblioteca" — reemplaza "Abrir carpeta" del prototipo */}
        <button
          onClick={onNavigateLibrary}
          title="Volver a la biblioteca"
          style={{
            flex: 1,
            fontSize: 'var(--font-size-small)',
            color: 'var(--t3)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
            padding: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--t1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)' }}
        >
          ← Biblioteca
        </button>

        {/* Botón "Nuevo sketch con IA" — sin lógica hasta que llegue el frontend-agent */}
        {/* TODO: change frontend-agent — conectar con flujo de creación de sketch */}
        <button
          disabled
          title="Nuevo sketch con IA (próximamente)"
          style={{
            flexShrink: 0,
            width: 'var(--space-6)',
            height: 'var(--space-6)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid transparent',
            background: 'transparent',
            color: 'var(--t3)',
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.4,
          }}
        >
          <SparkleIcon />
        </button>

        {/* Botón "Descargar ZIP" — sin lógica hasta que llegue el frontend-agent */}
        {/* TODO: change frontend-agent — conectar con endpoint de descarga */}
        <button
          disabled
          title="Descargar proyecto (próximamente)"
          style={{
            flexShrink: 0,
            width: 'var(--space-6)',
            height: 'var(--space-6)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid transparent',
            background: 'transparent',
            color: 'var(--t3)',
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.4,
          }}
        >
          <DownloadIcon />
        </button>

        {/* Botón colapso — cierra el panel */}
        <button
          onClick={() => setIsOpen(false)}
          title="Colapsar explorador"
          style={{
            flexShrink: 0,
            width: 'var(--space-6)',
            height: 'var(--space-6)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--line)',
            background: 'transparent',
            color: 'var(--t3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-input)',
            lineHeight: 1,
            transition: 'color var(--transition-fast), background var(--transition-fast)',
            marginTop: '1px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--t1)'
            e.currentTarget.style.background = 'var(--bg3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--t3)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          ›
        </button>
      </div>

      {/* Lista de archivos del proyecto: siempre sketch.js y config.yaml */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 'var(--space-1)' }}>
        {PROJECT_FILES.map(({ name, icon }) => (
          <FileItem
            key={name}
            name={name}
            icon={icon}
            active={activeFile === name}
            onClick={() => onSelectFile(name)}
          />
        ))}
      </div>
    </div>
  )
}

// Fila de archivo individual — resaltada cuando es el archivo activo
function FileItem({ name, icon, active, onClick }: {
  name: string
  icon: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={name}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        width: '100%',
        paddingTop: 'var(--space-2)',
        paddingBottom: 'var(--space-2)',
        paddingRight: 'var(--space-3)',
        paddingLeft: 'var(--space-3)',
        fontSize: 'var(--font-size-small)',
        border: 'none',
        // Fondo activo usa bg0, igual que en el prototipo
        background: active ? 'var(--bg0)' : 'transparent',
        color: active ? 'var(--t1)' : 'var(--t2)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        // Borde izquierdo de acento cuando está activo
        borderLeft: active ? '2px solid var(--t1)' : '2px solid transparent',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.color = 'var(--t1)'
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.color = 'var(--t2)'
      }}
    >
      <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.6, flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
    </button>
  )
}
