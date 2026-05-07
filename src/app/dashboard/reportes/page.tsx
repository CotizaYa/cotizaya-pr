'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BarChart3, TrendingUp, Users, DollarSign, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
      try {
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
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [supabase])

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  const conversionRate = stats.totalQuotes > 0 ? Math.round((stats.acceptedQuotes / stats.totalQuotes) * 100) : 0

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics y Reportes</h1>
        <p className="text-gray-500 font-medium mt-1">Métricas clave para el crecimiento de tu negocio en Puerto Rico.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Ingresos Totales',
                value: fmt(stats.totalRevenue),
                sub: 'Cotizaciones aceptadas',
                icon: DollarSign,
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                label: 'Tasa de Conversión',
                value: `${conversionRate}%`,
                sub: `${stats.acceptedQuotes} de ${stats.totalQuotes}`,
                icon: TrendingUp,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                label: 'Promedio por Venta',
                value: fmt(stats.avgQuote),
                sub: 'Valor medio de orden',
                icon: BarChart3,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                label: 'Total de Clientes',
                value: stats.clientCount,
                sub: 'En tu base de datos',
                icon: Users,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
            ].map((metric, i) => {
              const Icon = metric.icon
              return (
                <div key={i} className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 ${metric.bg} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{metric.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-xs font-medium mt-2 ${metric.color}`}>{metric.sub}</p>
                </div>
              )
            })}
          </div>

          {/* Upcoming Features */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-64">
              <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="font-bold text-gray-900">Cotizaciones por Mes</h3>
              <p className="text-sm text-gray-500 mt-2">Próximamente: Gráficas detalladas de rendimiento mensual.</p>
            </div>
            <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center min-h-64">
              <TrendingUp className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="font-bold text-gray-900">Productos más Vendidos</h3>
              <p className="text-sm text-gray-500 mt-2">Próximamente: Ranking de perfiles y materiales más cotizados.</p>
            </div>
          </div>

          {/* Business Insight */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Insight del Negocio</h3>
                <p className="text-gray-300 leading-relaxed">
                  Tu tasa de conversión es del <strong className="text-white">{conversionRate}%</strong>. 
                  Los fabricantes exitosos en Puerto Rico mantienen una tasa superior al 45% mediante el seguimiento automatizado por WhatsApp. 
                  Considera activar el <strong className="text-white">Chatbot de Seguimiento</strong> para aumentar tus ventas.
                </p>
                <Link
                  href="/dashboard/chatbot"
                  className="inline-flex items-center gap-2 mt-4 bg-white text-gray-900 font-bold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Configurar Chatbot
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
