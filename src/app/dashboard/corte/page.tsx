'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface CutSheet {
  id: string
  name: string
  client_name: string
  material: string
  total_pieces: number
  status: 'draft' | 'ready' | 'in_production' | 'completed'
  created_at: string
}

const statusColor = {
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  ready: 'bg-blue-100 text-blue-700 border-blue-200',
  in_production: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
}

const statusLabel = {
  draft: 'Borrador',
  ready: 'Listo',
  in_production: 'En Taller',
  completed: 'Terminado',
}

export default function CortePage() {
  const supabase = createClientComponentClient()
  const [sheets, setSheets] = useState<CutSheet[]>([])
  const [loading, setLoading] = useState(true)

  async function loadSheets() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('cut_sheets')
      .select('id, name, client_name, material, total_pieces, status, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    setSheets(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadSheets()
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Hojas de Corte</h1>
          <p className="text-gray-500 font-medium">Optimización de material y listas de piezas para fabricación.</p>
        </div>
        <Link
          href="/dashboard/corte/nueva"
          className="bg-[#F97316] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Hoja
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"></div>
          <h3 className="text-xl font-bold text-gray-900">No hay hojas de corte</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">Crea tu primera hoja de corte para optimizar tus perfiles de aluminio y reducir desperdicio.</p>
          <Link href="/dashboard/corte/nueva" className="mt-6 inline-block bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-black transition-colors">
            Comenzar ahora
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sheets.map((sheet) => (
            <Link
              key={sheet.id}
              href={`/dashboard/corte/${sheet.id}`}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6 group"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg truncate">{sheet.name || 'Hoja sin nombre'}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${statusColor[sheet.status as keyof typeof statusColor] || statusColor.draft}`}>
                    {statusLabel[sheet.status as keyof typeof statusLabel] || sheet.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1"> {sheet.client_name || 'Sin cliente'}</span>
                  <span className="flex items-center gap-1"> {sheet.material}</span>
                  <span className="flex items-center gap-1"> {sheet.total_pieces} piezas</span>
                </div>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {new Date(sheet.created_at).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-[#F97316] font-bold text-sm flex items-center gap-1">
                  Ver Detalles
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
