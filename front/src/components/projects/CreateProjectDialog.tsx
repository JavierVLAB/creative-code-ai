import { useState } from 'react'

interface CreateProjectDialogProps {
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function CreateProjectDialog({ onConfirm, onCancel }: CreateProjectDialogProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) onConfirm(name.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="font-semibold text-lg">Nuevo proyecto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del proyecto"
            autoFocus
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm bg-white text-gray-900 rounded-md font-medium hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
