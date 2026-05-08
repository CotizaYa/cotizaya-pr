'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Scissors, ArrowRight, AlertCircle } from 'lucide-react'

interface CutSheet {
  id: string
  name: string
  product_type: string
  material: string
  total_bars_needed: number | null
  total_linear_inches: number | null
  status: string
  notes: string | null
  created_at: string
}

const statusConfig = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  ready: { label: 'Listo', color: 'bg-blue-100 text-blue-600' },
  in_production: { label: 'En Taller', color: 'bg-yellow-100 text-yellow-600' },
  completed: { label: 'Terminado', color: 'bg-green-100 text-green-600' },
}

export default function CortePage() {
  const supabase = createClient()
  const [sheets, setSheets] = useState<CutSheet[]>([])
  const [loading, setLoading] = useState(true)

  async function loadSheets() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('cut_sheets')
        .select('id, name, product_type, material, total_bars_needed, total_linear_inches, status, notes, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setSheets(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheets()
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hojas de Corte</h1>
          <p className="text-gray-500 font-medium mt-1">Optimización de material y listas de piezas para fabricación.</p>
        </div>
        <Link
          href="/dashboard/corte/nueva"
          className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nueva Hoja
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
          <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No hay hojas de corte</h3>
          <p className="text-gray-500 mt-1 max-w-sm mx-auto">Crea tu primera hoja de corte para optimizar tus perfiles de aluminio y reducir desperdicio.</p>
          <Link href="/dashboard/corte/nueva" className="mt-6 inline-block bg-gray-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-black transition-colors">
            Comenzar ahora
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sheets.map((sheet) => (
            <Link
              key={sheet.id}
              href={`/dashboard/corte/${sheet.id}`}
              className="bg-white rounded-lg p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  <Scissors className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{sheet.name || 'Hoja sin nombre'}</h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusConfig[sheet.status as keyof typeof statusConfig]?.color || statusConfig.draft.color}`}>
                      {statusConfig[sheet.status as keyof typeof statusConfig]?.label || sheet.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                    <span>{sheet.product_type || 'General'}</span>
                    <span className="text-gray-300">•</span>
                    <span>{sheet.material}</span>
                    {sheet.total_bars_needed != null && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{sheet.total_bars_needed} barras</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(sheet.created_at).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
