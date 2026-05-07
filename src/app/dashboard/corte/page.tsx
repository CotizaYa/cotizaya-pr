'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

interface CutSheet {
  id: string
  created_at: string
  client_name: string
  status: string
  total_pieces: number
  material: string
  quote_id: string | null
}

export default function CortePage() {
  const [sheets, setSheets] = useState<CutSheet[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('cut_sheets')
        .select('*')
        .order('created_at', { ascending: false })
      setSheets(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    ready: 'bg-blue-100 text-blue-600',
    in_production: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  }

  const statusLabel: Record<string, string> = {
    draft: 'Borrador',
    ready: 'Lista',
    in_production: 'En Producción',
    completed: 'Completada',
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hojas de Corte</h1>
          <p className="text-sm text-gray-500">Gestiona tus órdenes de producción</p>
        </div>
        <Link
          href="/dashboard/corte/nueva"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Nueva Hoja
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : sheets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 font-medium">No tienes hojas de corte aún</p>
          <Link
            href="/dashboard/corte/nueva"
            className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold"
          >
            Crear primera hoja
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-800">{sheet.client_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {sheet.material} · {sheet.total_pieces} piezas ·{' '}
                  {new Date(sheet.created_at).toLocaleDateString('es-PR')}
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[sheet.status] || 'bg-gray-100 text-gray-500'}`}>
                {statusLabel[sheet.status] || sheet.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}