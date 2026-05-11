// src/app/dashboard/catalogo/components/ErrorState.tsx
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <p className="text-sm font-bold text-gray-700 mb-1">
        Error al cargar el catálogo
      </p>
      <p className="text-xs text-gray-400 mb-5">
        No pudimos conectar con el servidor. Verifica tu conexión e intenta de nuevo.
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        Intentar de nuevo
      </button>
    </div>
  )
}
