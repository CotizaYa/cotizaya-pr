'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Zap,
  DollarSign,
  BarChart3,
  Plus,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

type Props = {
  profile: any
  stats: {
    quotesThisMonth: number
    revenueThisMonth: number
    revenueLastMonth: number
    clientCount: number
    pendingCount: number
    acceptanceRate: number
    activeProductionCount: number
  }
  recentQuotes: any[]
  productionEvents: any[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-600' },
  viewed: { label: 'Vista', color: 'bg-yellow-100 text-yellow-600' },
  accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-600' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-600' },
}

const EVENT_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-600' },
  in_progress: { label: 'En Proceso', color: 'bg-blue-100 text-blue-600' },
  done: { label: 'Listo', color: 'bg-green-100 text-green-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-600' },
}

export default function DashboardHomeClient({ profile, stats, recentQuotes, productionEvents }: Props) {
  const displayName = profile?.business_name || profile?.full_name || 'Bienvenido'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const revenueChange = stats.revenueLastMonth > 0
    ? Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100)
    : 0

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {greeting}, <span className="text-orange-600">{displayName.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Tu taller de puertas y ventanas hoy.</p>
        </div>
        <Link
          href="/dashboard/cotizaciones/nueva"
          className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Ingresos del Mes',
            value: fmt(stats.revenueThisMonth),
            sub: revenueChange !== 0 ? `${Math.abs(revenueChange)}% vs mes anterior` : 'Este mes',
            icon: DollarSign,
            trend: revenueChange,
            bg: 'bg-orange-50',
            textColor: 'text-orange-600',
          },
          {
            label: 'Producción Activa',
            value: stats.activeProductionCount,
            sub: 'Trabajos en taller',
            icon: Zap,
            bg: 'bg-blue-50',
            textColor: 'text-blue-600',
          },
          {
            label: 'Cotizaciones Pendientes',
            value: stats.pendingCount,
            sub: 'Esperando respuesta',
            icon: FileText,
            bg: 'bg-yellow-50',
            textColor: 'text-yellow-600',
          },
          {
            label: 'Tasa de Cierre',
            value: `${stats.acceptanceRate}%`,
            sub: 'Eficiencia comercial',
            icon: BarChart3,
            bg: 'bg-purple-50',
            textColor: 'text-purple-600',
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
              <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${
                stat.trend ? (stat.trend > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'
              }`}>
                {stat.trend && (stat.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                {stat.sub}
              </p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: '/dashboard/cotizaciones/nueva', label: 'Cotizar', icon: FileText },
          { href: '/dashboard/corte/nueva', label: 'Hoja Corte', icon: Plus },
          { href: '/dashboard/calendario', label: 'Calendario', icon: Plus },
          { href: '/dashboard/pagos', label: 'Cobrar', icon: DollarSign },
          { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
          { href: '/dashboard/asistente', label: 'IA Ayuda', icon: Zap },
        ].map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md hover:border-gray-200 active:scale-95"
            >
              <Icon className="w-5 h-5 text-gray-600" />
              <span className="text-xs font-bold text-gray-700 text-center">{action.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Cotizaciones Recientes</h2>
            <Link href="/dashboard/cotizaciones" className="text-xs font-bold text-orange-600 hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="flex-1">
            {recentQuotes.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-bold text-gray-900">No hay cotizaciones aún</p>
                <p className="text-xs text-gray-500 mt-1">Empieza creando una nueva para tu primer cliente.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentQuotes.map((q) => {
                  const cfg = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.draft
                  return (
                    <Link
                      key={q.id}
                      href={`/dashboard/cotizaciones/${q.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold text-sm">
                          {(q.client_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{q.client_name || 'Sin nombre'}</p>
                          <p className="text-[10px] text-gray-400">{new Date(q.created_at).toLocaleDateString('es-PR')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{fmt(q.total || 0)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Production Schedule */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Próximo en Taller</h2>
            <Link href="/dashboard/calendario" className="text-xs font-bold text-blue-600 hover:underline">
              Calendario
            </Link>
          </div>
          <div className="flex-1">
            {productionEvents.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-bold text-gray-900">Taller despejado</p>
                <p className="text-xs text-gray-500 mt-1">Programa tus próximas instalaciones o fabricaciones.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {productionEvents.map((ev) => {
                  const cfg = EVENT_STATUS[ev.status] ?? EVENT_STATUS.pending
                  return (
                    <Link
                      key={ev.id}
                      href="/dashboard/calendario"
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-1 h-10 rounded-full" style={{ backgroundColor: ev.color || '#f97316' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{ev.title}</p>
                        <p className="text-[10px] text-gray-400">{new Date(ev.start_date + 'T00:00:00').toLocaleDateString('es-PR')}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Domina el mercado de Puerto Rico</h3>
            <p className="text-gray-300 text-sm">CotizaYa está optimizado específicamente para contratistas de puertas y ventanas en PR. Características que Luminio no tiene.</p>
          </div>
          <Link
            href="/dashboard/asistente"
            className="flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all whitespace-nowrap"
          >
            Consultar IA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
