// src/app/dashboard/catalogo/components/EmptyState.tsx
import { Search } from 'lucide-react'

interface EmptyStateProps {
  query: string
  onClear: () => void
}

export function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Search className="w-6 h-6 text-gray-300" />
      </div>
      {query ? (
        <>
          <p className="text-sm font-bold text-gray-700 mb-1">
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Intenta con otro término o limpia la búsqueda
          </p>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
          >
            Limpiar búsqueda
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-400">Sin productos en esta categoría</p>
      )}
    </div>
  )
}
