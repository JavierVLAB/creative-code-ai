// Tarjeta de aprobación de sugerencias explícitas para la memoria del proyecto.
// Aparece cuando el agente sugiere documentar algo al final de un turno.
// El estado de edición es local: el padre solo recibe el texto final al aprobar.

import { useState } from 'react'

interface MemoryProposalCardProps {
  // Texto propuesto por el agente para añadir a projects.memory
  suggestion: string
  // Se llama con el texto final (posiblemente editado por el usuario)
  onApprove: (text: string) => void
  // El usuario descarta la propuesta sin guardar nada
  onIgnore: () => void
}

export function MemoryProposalCard({ suggestion, onApprove, onIgnore }: MemoryProposalCardProps) {
  // editMode controla si se muestra el textarea o la vista de solo lectura
  const [editMode, setEditMode] = useState(false)
  const [text, setText] = useState(suggestion)

  return (
    <div style={{
      margin: 'var(--space-3) var(--padding-section) 0',
      padding: 'var(--space-3)',
      background: 'var(--bg2)',
      border: 'var(--border-width) solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
    }}>
      {/* Etiqueta de sección */}
      <div style={{
        fontSize: 'var(--font-size-xs)',
        color: 'var(--t3)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontWeight: 500,
      }}>
        Guardar memoria
      </div>

      {/* Contenido: textarea en modo edición, texto plano en modo vista */}
      {editMode ? (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            resize: 'vertical',
            background: 'var(--bg1)',
            border: 'var(--border-width) solid var(--line)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--t1)',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--t3)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
        />
      ) : (
        <div style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--t2)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {text}
        </div>
      )}

      {/* Acciones: Añadir (primario), Editar/Vista previa (toggle), Ignorar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          onClick={() => onApprove(text)}
          style={{
            flex: 1,
            padding: 'var(--space-1) 0',
            fontSize: 'var(--font-size-xs)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--line)',
            background: 'var(--t1)',
            color: 'var(--bg0)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 500,
          }}
        >
          Guardar
        </button>

        {/* Alterna entre modo edición y vista previa sin perder el texto */}
        <button
          onClick={() => setEditMode(prev => !prev)}
          style={{
            flex: 1,
            padding: 'var(--space-1) 0',
            fontSize: 'var(--font-size-xs)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--line)',
            background: 'transparent',
            color: 'var(--t2)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {editMode ? 'Vista previa' : 'Editar'}
        </button>

        <button
          onClick={onIgnore}
          style={{
            flex: 1,
            padding: 'var(--space-1) 0',
            fontSize: 'var(--font-size-xs)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--line)',
            background: 'transparent',
            color: 'var(--t3)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Ignorar
        </button>
      </div>
    </div>
  )
}
