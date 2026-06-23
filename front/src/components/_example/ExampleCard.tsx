// Componente de ejemplo que ilustra las convenciones del proyecto.
// Muestra una tarjeta con título, descripción y callback opcional al hacer clic.

export interface ExampleCardProps {
  title: string
  description: string
  onClick?: () => void
}

/**
 * Tarjeta de ejemplo reutilizable con estilo oscuro y efectos hover.
 * Sigue las convenciones de nombrado, tipado y estructura del proyecto.
 */
export function ExampleCard(props: ExampleCardProps) {
  const { title, description, onClick } = props
  const previewText = truncateText(description, 120)

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl bg-gray-800 p-5 shadow-md transition duration-200 hover:bg-gray-700 hover:shadow-lg"
    >
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{previewText}</p>
    </div>
  )
}

// --- Example section ---

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}
