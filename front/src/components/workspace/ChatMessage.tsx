// Renderiza un mensaje individual del chat con soporte para bloques de código colapsados.
// La lógica de parseo se integra aquí directamente para mantener la responsabilidad en un solo archivo.
import type { ChatMessage } from '../../lib/types'

// Tipos internos para las partes parseadas del contenido
type MsgPart = { kind: 'text'; content: string } | { kind: 'code'; lang: string; content: string }

// Separa el texto plano de los bloques de código markdown (```lang ... ```)
function parseMessageParts(text: string): MsgPart[] {
  const parts: MsgPart[] = []
  const re = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ kind: 'code', lang: match[1] || 'código', content: match[2].trim() })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push({ kind: 'text', content: text.slice(lastIndex) })
  }
  return parts
}

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessageItem({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'
  const parts = parseMessageParts(message.content)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: 'var(--space-1)',
      }}
    >
      {/* Etiqueta del rol: "Tú" o "IA" */}
      <span style={{
        color: 'var(--t3)',
        fontSize: 'var(--font-size-section-title)',
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {isUser ? 'Tú' : isError ? 'Error' : 'IA'}
      </span>

      {/* Burbuja del mensaje: color diferente según el rol */}
      <div style={{
        maxWidth: '90%',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-sm)',
        background: isUser ? 'var(--bg2)' : 'transparent',
        border: isUser ? 'var(--border-width) solid var(--line)' : 'none',
        fontSize: 'var(--font-size-xs)',
        lineHeight: 1.6,
        color: isError ? 'var(--color-error-soft)' : isUser ? 'var(--t1)' : 'var(--t2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
      }}>
        {parts.map((part, i) => {
          if (part.kind === 'text') {
            const trimmed = part.content.trim()
            if (!trimmed) return null
            return (
              <span key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {trimmed}
              </span>
            )
          }
          // Bloque de código: colapsado por defecto con <details> para no ocupar espacio
          return (
            <details
              key={i}
              style={{ marginTop: 'var(--space-1)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
            >
              <summary style={{
                cursor: 'pointer',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--t3)',
                background: 'var(--bg2)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                userSelect: 'none',
              }}>
                <span style={{ opacity: 0.6 }}>›</span>
                {part.lang}
              </summary>
              <pre style={{
                fontSize: 'var(--font-size-section-title)',
                lineHeight: 1.5,
                color: 'var(--t2)',
                background: 'var(--bg2)',
                padding: 'var(--space-2)',
                overflowX: 'auto',
                maxHeight: '200px',
                overflowY: 'auto',
                whiteSpace: 'pre',
                margin: 0,
              }}>
                {part.content}
              </pre>
            </details>
          )
        })}
      </div>
    </div>
  )
}
