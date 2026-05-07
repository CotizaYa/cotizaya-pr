'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ReportesPage() {
  const supabase = createClientComponentClient()
  const [stats, setStats] = useState({
    totalQuotes: 0,
    acceptedQuotes: 0,
    totalRevenue: 0,
    avgQuote: 0,
    clientCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: quotes },
        { count: clientCount }
      ] = await Promise.all([
        supabase.from('quotes').select('total, status').eq('owner_id', user.id),
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('owner_id', user.id)
      ])

      const total = quotes?.length || 0
      const accepted = quotes?.filter(q => q.status === 'accepted') || []
      const revenue = accepted.reduce((s, q) => s + (q.total || 0), 0)
      
      setStats({
        totalQuotes: total,
        acceptedQuotes: accepted.length,
        totalRevenue: revenue,
        avgQuote: total > 0 ? revenue / (accepted.length || 1) : 0,
        clientCount: clientCount || 0
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Analytics y Reportes</h1>
        <p className="text-gray-500 font-medium">Métricas clave para el crecimiento de tu negocio en Puerto Rico.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ingresos Totales</p>
            <p className="text-4xl font-black text-gray-900">{fmt(stats.totalRevenue)}</p>
            <p className="text-xs text-green-600 font-bold mt-2">Basado en cotizaciones aceptadas</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tasa de Conversión</p>
            <p className="text-4xl font-black text-gray-900">
              {stats.totalQuotes > 0 ? Math.round((stats.acceptedQuotes / stats.totalQuotes) * 100) : 0}%
            </p>
            <p className="text-xs text-blue-600 font-bold mt-2">{stats.acceptedQuotes} de {stats.totalQuotes} cotizaciones</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Promedio por Venta</p>
            <p className="text-4xl font-black text-gray-900">{fmt(stats.avgQuote)}</p>
            <p className="text-xs text-purple-600 font-bold mt-2">Valor medio de orden</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-64 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-3xl mb-4">📊</div>
          <h3 className="font-bold text-gray-900">Cotizaciones por Mes</h3>
          <p className="text-sm text-gray-400 mt-1">Próximamente: Gráficas detalladas de rendimiento mensual.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-64 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4">🏆</div>
          <h3 className="font-bold text-gray-900">Productos más Vendidos</h3>
          <p className="text-sm text-gray-400 mt-1">Próximamente: Ranking de perfiles y materiales más cotizados.</p>
        </div>
      </div>
      
      <div className="bg-[#0F172A] p-8 rounded-3xl text-white">
        <h3 className="text-xl font-black mb-4">💡 Insight del Negocio</h3>
        <p className="text-gray-400 leading-relaxed">
          Tu tasa de conversión es del {stats.totalQuotes > 0 ? Math.round((stats.acceptedQuotes / stats.totalQuotes) * 100) : 0}%. 
          Los fabricantes exitosos en Puerto Rico mantienen una tasa superior al 45% mediante el seguimiento automatizado por WhatsApp. 
          Considera activar el <strong>Chatbot de Seguimiento</strong> para aumentar tus ventas.
        </p>
      </div>
    </div>
  )
}
