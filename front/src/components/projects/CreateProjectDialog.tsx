import { useState } from 'react'
import { usePublishedTemplates } from '../../hooks/usePublishedTemplates'
import type { ProjectOrigin } from '../../lib/types'

type OriginChoice = 'blank' | 'ai' | 'template'

interface CreateProjectDialogProps {
  onConfirm: (name: string, origin: ProjectOrigin, initialPrompt?: string) => void
  onCancel: () => void
}

const ORIGIN_OPTIONS: Array<{ value: OriginChoice; label: string }> = [
  { value: 'blank', label: 'Empezar en blanco' },
  { value: 'ai', label: 'Que me ayude la IA' },
  { value: 'template', label: 'Desde una plantilla' },
]

export function CreateProjectDialog({ onConfirm, onCancel }: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [origin, setOrigin] = useState<OriginChoice>('blank')
  const [prompt, setPrompt] = useState('')
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [confirmHover, setConfirmHover] = useState(false)

  const { templates, loading: templatesLoading } = usePublishedTemplates()

  const canSubmit = name.trim().length > 0 && (origin !== 'template' || templateId !== null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    if (origin === 'template') {
      const template = templates.find(t => t.id === templateId)
      if (!template) return
      onConfirm(name.trim(), { type: 'template', sketchJs: template.sketchJs, configYaml: template.configYaml })
      return
    }

    if (origin === 'ai') {
      onConfirm(name.trim(), { type: 'blank' }, prompt.trim() || undefined)
      return
    }

    onConfirm(name.trim(), { type: 'blank' })
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.72)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: 'var(--bg1)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        <h2 style={{ fontWeight: 600, fontSize: 'var(--font-size-title)', color: 'var(--t1)' }}>
          Nuevo proyecto
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <input
            data-testid="project-name-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del proyecto"
            autoFocus
            style={{
              width: '100%',
              backgroundColor: 'var(--bg2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-size-input)',
              color: 'var(--t1)',
              outline: 'none',
            }}
          />

          <div role="radiogroup" aria-label="Origen del sketch" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {ORIGIN_OPTIONS.map(option => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--t1)',
                  cursor: 'pointer',
                }}
              >
                <input
                  data-testid={`project-origin-${option.value}`}
                  type="radio"
                  name="project-origin"
                  value={option.value}
                  checked={origin === option.value}
                  onChange={() => setOrigin(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>

          {origin === 'ai' && (
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe el sketch que quieres (ej. círculos concéntricos que pulsan con el tiempo)"
              rows={3}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-input)',
                color: 'var(--t1)',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          )}

          {origin === 'template' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', maxHeight: 160, overflowY: 'auto' }}>
              {templatesLoading && (
                <p style={{ color: 'var(--t3)', fontSize: 'var(--font-size-small)' }}>Cargando plantillas...</p>
              )}
              {!templatesLoading && templates.length === 0 && (
                <p style={{ color: 'var(--t3)', fontSize: 'var(--font-size-small)' }}>Aún no hay plantillas publicadas.</p>
              )}
              {templates.map(template => (
                <label
                  key={template.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--t1)',
                    cursor: 'pointer',
                    padding: 'var(--space-1) 0',
                  }}
                >
                  <input
                    data-testid="template-option"
                    type="radio"
                    name="project-template"
                    value={template.id}
                    checked={templateId === template.id}
                    onChange={() => setTemplateId(template.id)}
                  />
                  {template.title}
                </label>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--font-size-small)',
                color: 'var(--t2)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              data-testid="create-project-confirm-button"
              type="submit"
              disabled={!canSubmit}
              onMouseEnter={() => setConfirmHover(true)}
              onMouseLeave={() => setConfirmHover(false)}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--font-size-small)',
                backgroundColor: confirmHover && canSubmit ? 'var(--bg3)' : 'var(--t1)',
                color: 'var(--bg0)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500,
                border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.4,
                transition: 'background-color var(--transition-fast)',
              }}
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
