'use client'

import Link from 'next/link'

type Props = {
  profile: any
  stats: {
    quotesThisMonth: number
    revenueThisMonth: number
    revenueLastMonth: number
    clientCount: number
    pendingCount: number
    acceptanceRate: number
  }
  recentQuotes: any[]
  productionEvents: any[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:    { label: 'Borrador',  color: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Enviada',   color: 'bg-blue-100 text-blue-700' },
  viewed:   { label: 'Vista',     color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceptada',  color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
}

const EVENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:     { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'En Proceso',  color: 'bg-blue-100 text-blue-700' },
  done:        { label: 'Listo',       color: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Cancelado',   color: 'bg-red-100 text-red-700' },
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
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{greeting}, {displayName.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Aquí está el resumen de tu negocio hoy</p>
        </div>
        <Link href="/dashboard/cotizaciones/nueva"
          className="flex-shrink-0 flex items-center gap-2 bg-[#F97316] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span className="hidden sm:inline">Nueva Cotización</span>
          <span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Ingresos del Mes',
            value: fmt(stats.revenueThisMonth),
            sub: revenueChange !== 0 ? `${revenueChange > 0 ? '+' : ''}${revenueChange}% vs mes anterior` : 'Este mes',
            subColor: revenueChange >= 0 ? 'text-green-600' : 'text-red-500',
            bg: 'bg-orange-50', icon: '💰',
          },
          {
            label: 'Cotizaciones',
            value: stats.quotesThisMonth,
            sub: `${stats.pendingCount} pendientes de respuesta`,
            subColor: stats.pendingCount > 0 ? 'text-yellow-600' : 'text-gray-400',
            bg: 'bg-blue-50', icon: '📄',
          },
          {
            label: 'Clientes',
            value: stats.clientCount,
            sub: 'Total registrados',
            subColor: 'text-gray-400',
            bg: 'bg-green-50', icon: '👥',
          },
          {
            label: 'Tasa de Aceptación',
            value: `${stats.acceptanceRate}%`,
            sub: 'Cotizaciones aceptadas',
            subColor: stats.acceptanceRate >= 50 ? 'text-green-600' : 'text-yellow-600',
            bg: 'bg-purple-50', icon: '✅',
          },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
            <p className={`text-[11px] mt-0.5 ${s.subColor}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { href: '/dashboard/cotizaciones/nueva', label: 'Nueva Cotización', emoji: '📝', color: 'bg-orange-50 hover:bg-orange-100' },
          { href: '/dashboard/corte/nueva', label: 'Hoja de Corte', emoji: '✂️', color: 'bg-blue-50 hover:bg-blue-100', badge: 'NEW' },
          { href: '/dashboard/calendario', label: 'Producción', emoji: '🗓️', color: 'bg-green-50 hover:bg-green-100', badge: 'NEW' },
          { href: '/dashboard/clients/nuevo', label: 'Nuevo Cliente', emoji: '👤', color: 'bg-purple-50 hover:bg-purple-100' },
          { href: '/dashboard/reportes', label: 'Reportes', emoji: '📊', color: 'bg-yellow-50 hover:bg-yellow-100', badge: 'NEW' },
          { href: '/dashboard/ai-assistant', label: 'Asistente IA', emoji: '🤖', color: 'bg-pink-50 hover:bg-pink-100' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className={`${a.color} rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-colors cursor-pointer relative`}>
            {a.badge && (
              <span className="absolute top-1.5 right-1.5 text-[8px] font-bold bg-[#F97316] text-white px-1 py-0.5 rounded-full">{a.badge}</span>
            )}
            <span className="text-2xl">{a.emoji}</span>
            <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Cotizaciones recientes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Cotizaciones Recientes</h2>
            <Link href="/dashboard/cotizaciones" className="text-xs text-[#F97316] font-medium hover:underline">Ver todas →</Link>
          </div>
          {recentQuotes.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <p className="text-3xl mb-2">📄</p>
              <p>No hay cotizaciones aún</p>
              <Link href="/dashboard/cotizaciones/nueva" className="text-[#F97316] font-medium text-xs mt-1 inline-block">Crear primera cotización →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentQuotes.map((q) => {
                const cfg = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.draft
                return (
                  <Link key={q.id} href={`/dashboard/cotizaciones/${q.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xs font-bold">
                        {(q.client_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{q.client_name || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-400">{new Date(q.created_at).toLocaleDateString('es-PR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-sm font-bold text-gray-900">{fmt(q.total || 0)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Producción próxima */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Producción Próxima</h2>
            <Link href="/dashboard/calendario" className="text-xs text-[#F97316] font-medium hover:underline">Ver calendario →</Link>
          </div>
          {productionEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <p className="text-3xl mb-2">🗓️</p>
              <p>No hay eventos de producción</p>
              <Link href="/dashboard/calendario" className="text-[#F97316] font-medium text-xs mt-1 inline-block">Agregar evento →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {productionEvents.map((ev) => {
                const cfg = EVENT_STATUS[ev.status] ?? EVENT_STATUS.pending
                return (
                  <Link key={ev.id} href="/dashboard/calendario"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || '#F97316' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">{new Date(ev.start_date + 'T00:00:00').toLocaleDateString('es-PR', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* IVU reminder si no está configurado */}
      {!profile?.ivu_rate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">Configura tu tasa de IVU</p>
            <p className="text-xs text-yellow-700">Para calcular correctamente tus cotizaciones en Puerto Rico</p>
          </div>
          <Link href="/dashboard/settings" className="text-xs font-bold text-yellow-800 bg-yellow-200 px-3 py-1.5 rounded-xl hover:bg-yellow-300 transition-colors">
            Configurar
          </Link>
        </div>
      )}
    </div>
  )
}