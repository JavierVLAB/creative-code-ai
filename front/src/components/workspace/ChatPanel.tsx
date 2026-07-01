// Panel de chat: historial de mensajes + input para enviar texto al agente.
// Si onSend no se pasa, el input queda deshabilitado con tooltip explicativo
// (estado transitorio mientras el agente no está conectado todavía).
import { useRef, useEffect, useState } from 'react'
import type { ChatMessage } from '../../lib/types'
import { ChatMessageItem } from './ChatMessage'

interface ChatPanelProps {
  messages: ChatMessage[]
  // undefined = agente no disponible aún; se deshabilita el input
  onSend?: (text: string) => void
  isLoading?: boolean
  pendingQuestion?: string | null
}

export function ChatPanel({ messages, onSend, isLoading = false, pendingQuestion = null }: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  // Agente disponible si onSend está definido
  const agentReady = onSend !== undefined

  // Auto-resize del textarea hasta 120px máximo
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [draft])

  // Scroll al último mensaje cada vez que cambia el historial o el estado de carga
  useEffect(() => {
    const c = messagesRef.current
    if (c) c.scrollTop = c.scrollHeight
  }, [messages, isLoading])

  const handleSend = () => {
    const text = draft.trim()
    // Guardas: sin texto, sin agente o mientras carga no se envía
    if (!text || !agentReady || isLoading) return
    onSend(text)
    setDraft('')
  }

  // El botón está activo solo si hay texto, el agente está listo y no está cargando
  const canSend = draft.trim().length > 0 && agentReady && !isLoading
  const placeholder = pendingQuestion ? 'Responde la pregunta del agente...' : 'Pide un cambio al agente...'

  return (
    <div style={{
      borderTop: 'var(--border-width) solid var(--line)',
      padding: 'var(--padding-module) var(--padding-section)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      {/* Título de la sección */}
      <div style={{
        fontSize: 'var(--font-size-section-title)',
        color: 'var(--color-section-title)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Agente IA
      </div>

      {/* Historial de mensajes: visible solo si hay mensajes */}
      {messages.length > 0 && (
        <div
          ref={messagesRef}
          style={{
            maxHeight: '140px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {messages.map(msg => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}

          {/* Indicador de carga mientras el agente procesa */}
          {isLoading && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--t3)' }}>IA · · ·</div>
          )}
        </div>
      )}

      {/* Input de chat: deshabilitado si el agente no está disponible */}
      <textarea
        ref={textareaRef}
        value={draft}
        disabled={!agentReady || isLoading}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder={agentReady ? placeholder : 'Conectando con el agente...'}
        title={agentReady ? undefined : 'Conectando con el agente...'}
        rows={2}
        style={{
          width: '100%',
          resize: 'none',
          background: 'var(--bg2)',
          border: 'var(--border-width) solid var(--line)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-small)',
          color: 'var(--t1)',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
        }}
        onFocus={e => { if (agentReady) e.currentTarget.style.borderColor = 'var(--t3)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        title={agentReady ? undefined : 'Conectando con el agente...'}
        style={{
          width: '100%',
          padding: 'var(--btn-padding)',
          fontSize: 'var(--btn-font-size)',
          borderRadius: 'var(--radius-sm)',
          border: 'var(--border-width) solid var(--line)',
          background: canSend ? 'var(--t1)' : 'transparent',
          color: canSend ? 'var(--bg0)' : 'var(--t3)',
          cursor: canSend ? 'pointer' : 'default',
          fontFamily: 'inherit',
          fontWeight: 500,
          transition: 'background var(--transition-fast), color var(--transition-fast)',
        }}
      >
        {isLoading
          ? 'Pensando...'
          : !agentReady
            ? 'Conectando...'
            : 'Enviar'
        }
      </button>
    </div>
  )
}
