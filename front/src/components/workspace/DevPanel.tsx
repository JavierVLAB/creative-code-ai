// Panel de transparencia del orquestador — solo visible en modo desarrollo (import.meta.env.DEV).
// Muestra el trace de ejecución del agente Mastra: pasos, skill invocado, razonamiento, errores.
//
// NOTA: Las interfaces ExecutionTrace y TraceStep son definiciones locales provisionales.
// Cuando el change `frontend-agent` conecte el trace real de Mastra, reemplazar estas
// interfaces por los tipos que vengan del cliente del agente.

import { useState } from 'react'

// --- Tipos locales provisionales (se reemplazarán cuando llegue el change frontend-agent) ---

/** Un paso individual del trace de ejecución del agente */
interface TraceStep {
  step: number
  skill: string
  reason?: string
  systemPrompt: string
  contextContent?: string
  rawResponse: string
  error?: string
}

/** Trace completo de un turno de ejecución del agente */
interface ExecutionTrace {
  steps: TraceStep[]
  finalResponse?: string
}

// --- Componente principal ---

interface DevPanelProps {
  trace?: ExecutionTrace | null
}

/**
 * El componente retorna null si no estamos en modo DEV o si no hay trace.
 * El padre no necesita condicionarlo: puede montarlo siempre.
 */
export function DevPanel({ trace }: DevPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Solo visible en desarrollo y cuando hay trace
  if (!import.meta.env.DEV || !trace) return null

  const stepCount = trace.steps.length
  const hasError = trace.steps.some(s => s.error)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--bg0)',
        borderTop: `var(--border-width) solid ${hasError ? 'var(--color-error)' : 'var(--line)'}`,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-section-title)',
      }}
    >
      {/* Barra de toggle — muestra resumen del trace */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          padding: 'var(--space-1) var(--space-3)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          color: hasError ? 'var(--color-error)' : 'var(--t3)',
          textAlign: 'left',
          fontSize: 'var(--font-size-section-title)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span style={{ opacity: 0.5 }}>{isOpen ? '▼' : '▲'}</span>
        <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>DEV</span>
        <span>
          Orchestrator trace — {stepCount} paso{stepCount !== 1 ? 's' : ''}
          {hasError ? ' · ERROR' : ''}
          {trace.finalResponse ? ' · done' : ''}
        </span>
      </button>

      {/* Lista de pasos, expandible */}
      {isOpen && (
        <div
          style={{
            maxHeight: '320px',
            overflowY: 'auto',
            padding: 'var(--space-2) var(--space-3) var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            borderTop: 'var(--border-width) solid var(--line)',
          }}
        >
          {trace.steps.map((step, i) => (
            <StepCard key={i} step={step} />
          ))}
        </div>
      )}
    </div>
  )
}

// --- Subcomponentes internos (no exportados) ---

function StepCard({ step }: { step: TraceStep }) {
  return (
    <details
      style={{
        background: 'var(--bg1)',
        border: `var(--border-width) solid ${step.error ? 'var(--color-error)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          padding: 'var(--space-1) var(--space-2)',
          display: 'flex',
          gap: 'var(--space-2)',
          alignItems: 'center',
          listStyle: 'none',
          color: step.error ? 'var(--color-error)' : 'var(--t2)',
          userSelect: 'none',
        }}
      >
        <span style={{ color: 'var(--t3)' }}>#{step.step + 1}</span>
        <span style={{ color: 'var(--color-info)', fontWeight: 'bold' }}>{step.skill}</span>
        {step.reason && (
          <span
            style={{
              color: 'var(--t3)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            — {step.reason}
          </span>
        )}
        {step.error && (
          <span style={{ color: 'var(--color-error)', marginLeft: 'auto' }}>⚠ error</span>
        )}
      </summary>

      <div style={{ padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {step.error && <Section label="Error" value={step.error} color="var(--color-error)" />}
        <Section label="System prompt" value={step.systemPrompt} />
        {step.contextContent && (
          <Section label="Contexto materializado" value={step.contextContent} />
        )}
        <Section label="Respuesta raw del LLM" value={step.rawResponse} />
      </div>
    </details>
  )
}

function Section({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div>
      <div style={{ color: color ?? 'var(--color-accent)', marginBottom: 'var(--space-1)', fontWeight: 'bold' }}>
        {label}
      </div>
      <pre
        style={{
          margin: 0,
          padding: 'var(--space-2) var(--space-2)',
          background: 'var(--bg0)',
          borderRadius: 'var(--radius-sm)',
          color: color ?? 'var(--t2)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '120px',
          overflowY: 'auto',
          lineHeight: 1.4,
        }}
      >
        {value || '(vacío)'}
      </pre>
    </div>
  )
}
