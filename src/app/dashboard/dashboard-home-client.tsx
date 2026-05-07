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
    activeProductionCount: number
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {greeting}, <span className="text-[#F97316]">{displayName.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-500 font-medium mt-1">Tu taller de puertas y ventanas hoy.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/cotizaciones/nueva"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#F97316] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva Cotización
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Ingresos del Mes',
            value: fmt(stats.revenueThisMonth),
            sub: revenueChange !== 0 ? `${revenueChange > 0 ? '↑' : '↓'} ${Math.abs(revenueChange)}% vs mes anterior` : 'Meta: $10k',
            subColor: revenueChange >= 0 ? 'text-green-600' : 'text-red-500',
            bg: 'bg-orange-50', icon: '💰', iconColor: 'text-orange-600'
          },
          {
            label: 'Producción Activa',
            value: stats.activeProductionCount,
            sub: 'Trabajos en taller',
            subColor: 'text-blue-600',
            bg: 'bg-blue-50', icon: '🛠️', iconColor: 'text-blue-600'
          },
          {
            label: 'Cotizaciones Enviadas',
            value: stats.pendingCount,
            sub: 'Pendientes de cierre',
            subColor: 'text-yellow-600',
            bg: 'bg-yellow-50', icon: '📄', iconColor: 'text-yellow-600'
          },
          {
            label: 'Tasa de Cierre',
            value: `${stats.acceptanceRate}%`,
            sub: 'Eficiencia comercial',
            subColor: 'text-purple-600',
            bg: 'bg-purple-50', icon: '📈', iconColor: 'text-purple-600'
          },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>{s.icon}</div>
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">{s.label}</p>
            <p className={`text-xs mt-2 font-bold ${s.subColor} flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: '/dashboard/cotizaciones/nueva', label: 'Cotizar', emoji: '📝', color: 'hover:bg-orange-50' },
          { href: '/dashboard/corte/nueva', label: 'Hoja Corte', emoji: '✂️', color: 'hover:bg-blue-50' },
          { href: '/dashboard/calendario', label: 'Calendario', emoji: '🗓️', color: 'hover:bg-green-50' },
          { href: '/dashboard/pagos', label: 'Cobrar', emoji: '💳', color: 'hover:bg-purple-50' },
          { href: '/dashboard/reportes', label: 'Reportes', emoji: '📊', color: 'hover:bg-yellow-50' },
          { href: '/dashboard/asistente', label: 'IA Ayuda', emoji: '🤖', color: 'hover:bg-pink-50' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className={`bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:-translate-y-1 hover:shadow-lg group ${a.color}`}>
            <span className="text-3xl group-hover:scale-110 transition-transform">{a.emoji}</span>
            <span className="text-xs font-bold text-gray-700">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-orange-500 rounded-full" />
              <h2 className="font-black text-gray-900 uppercase tracking-tight">Cotizaciones Recientes</h2>
            </div>
            <Link href="/dashboard/cotizaciones" className="text-xs font-bold text-[#F97316] bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors">Ver todas</Link>
          </div>
          <div className="flex-1">
            {recentQuotes.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-5xl mb-4">📄</p>
                <p className="font-bold">No hay cotizaciones aún</p>
                <p className="text-xs mt-1">Empieza creando una nueva para tu primer cliente.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentQuotes.map((q) => {
                  const cfg = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.draft
                  return (
                    <Link key={q.id} href={`/dashboard/cotizaciones/${q.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 font-black">
                          {(q.client_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{q.client_name || 'Sin nombre'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(q.created_at).toLocaleDateString('es-PR', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">{fmt(q.total || 0)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Production Schedule */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-500 rounded-full" />
              <h2 className="font-black text-gray-900 uppercase tracking-tight">Próximo en Taller</h2>
            </div>
            <Link href="/dashboard/calendario" className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">Calendario</Link>
          </div>
          <div className="flex-1">
            {productionEvents.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-5xl mb-4">🗓️</p>
                <p className="font-bold">Taller despejado</p>
                <p className="text-xs mt-1">Programa tus próximas instalaciones o fabricaciones.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {productionEvents.map((ev) => {
                  const cfg = EVENT_STATUS[ev.status] ?? EVENT_STATUS.pending
                  return (
                    <Link key={ev.id} href="/dashboard/calendario"
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                      <div className="w-1 h-10 rounded-full" style={{ backgroundColor: ev.color || '#F97316' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{ev.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(ev.start_date + 'T00:00:00').toLocaleDateString('es-PR', { weekday: 'long', day: 'numeric' })}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${cfg.color}`}>{cfg.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Puerto Rico Context Reminder */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316] opacity-10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-xl font-black mb-1">¡Domina el mercado de PR! 🇵🇷</h3>
          <p className="text-gray-400 text-sm max-w-md">Recuerda que Luminio no tiene soporte para IVU local ni optimización de corte específica para perfiles de Puerto Rico.</p>
        </div>
        <Link href="/dashboard/asistente" className="relative z-10 bg-white text-gray-900 font-black px-6 py-3 rounded-2xl hover:bg-orange-50 transition-colors shadow-lg">
          Preguntar al Asistente IA
        </Link>
      </div>
    </div>
  )
}
