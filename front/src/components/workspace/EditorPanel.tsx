// Panel de edición de código: editor CodeMirror sin estado propio.
// Es un componente "tonto": recibe contenido y emite cambios.
// La persistencia (debounce + Supabase) es responsabilidad del padre WorkspacePage.

import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { yaml } from '@codemirror/lang-yaml'
import { EditorView } from '@codemirror/view'

// Solo los tipos de archivo que soporta el workspace
type FileName = 'sketch.js' | 'config.yaml'

interface EditorPanelProps {
  /** Nombre del archivo activo — determina el lenguaje del editor */
  fileName: FileName
  /** Contenido actual (controlado por el padre) */
  content: string
  /** Se llama en cada cambio del editor; el padre decide cuándo persistir */
  onChange: (content: string) => void
  /** Cierra el panel de editor */
  onClose: () => void
}

/** Devuelve la extensión de lenguaje correcta según el nombre de archivo */
function langExtension(fileName: FileName) {
  if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) return yaml()
  // .js y cualquier otro fallback → JavaScript
  return javascript()
}

export function EditorPanel({ fileName, content, onChange, onClose }: EditorPanelProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: 'var(--editor-width)',
      background: 'var(--bg1)',
      border: 'var(--border-width) solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }}>

      {/* Cabecera: nombre del archivo y botón cerrar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--padding-section)',
        height: 'var(--topbar-height)',
        borderBottom: 'var(--border-width) solid var(--line)',
        flexShrink: 0,
        background: 'var(--bg1)',
      }}>
        <span style={{
          fontSize: 'var(--font-size-small)',
          color: 'var(--t2)',
          fontFamily: 'var(--font-mono)',
        }}>
          {fileName}
        </span>
        <button
          onClick={onClose}
          aria-label="Cerrar editor"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--t3)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
            padding: 'var(--space-1)',
            lineHeight: 1,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          ✕
        </button>
      </div>

      {/* Área del editor: ocupa el resto del panel */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <CodeMirror
          value={content}
          extensions={[langExtension(fileName), EditorView.lineWrapping]}
          onChange={onChange}
          theme="dark"
          height="100%"
        />
      </div>

    </div>
  )
}
