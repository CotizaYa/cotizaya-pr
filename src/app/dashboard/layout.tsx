'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const Icons = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  quotes: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  projects: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  clients: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  cut: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  suppliers: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  prices: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  ai: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-3H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="9.5" cy="15.5" r="1"/><circle cx="14.5" cy="15.5" r="1"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Inicio', icon: Icons.home, exact: true },
      { href: '/dashboard/cotizaciones', label: 'Cotizaciones', icon: Icons.quotes },
      { href: '/dashboard/projects', label: 'Proyectos', icon: Icons.projects },
      { href: '/dashboard/clients', label: 'Clientes', icon: Icons.clients },
    ],
  },
  {
    label: 'Producción',
    items: [
      { href: '/dashboard/corte', label: 'Hoja de Corte', icon: Icons.cut, isNew: true },
      { href: '/dashboard/calendario', label: 'Producción', icon: Icons.calendar, isNew: true },
    ],
  },
  {
    label: 'Negocio',
    items: [
      { href: '/dashboard/reportes', label: 'Reportes', icon: Icons.chart, isNew: true },
      { href: '/dashboard/suppliers', label: 'Suplidores', icon: Icons.suppliers },
      { href: '/dashboard/precios', label: 'Mis Precios', icon: Icons.prices },
      { href: '/dashboard/ai-assistant', label: 'Asistente IA', icon: Icons.ai },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/dashboard/settings', label: 'Configuración', icon: Icons.settings },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const supabase = createClient()
  const [profile, setProfile] = useState<{ full_name?: string; business_name?: string; email?: string } | null>(null)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [pendingQuotes, setPendingQuotes] = useState(0)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { count: notifCount }, { count: quoteCount }] = await Promise.all([
        supabase.from('profiles').select('full_name, business_name').eq('id', user.id).single(),
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('read', false),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'sent'),
      ])

      setProfile({ ...prof, email: user.email })
      setUnreadNotifs(notifCount ?? 0)
      setPendingQuotes(quoteCount ?? 0)
    }
    loadData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const displayName = profile?.business_name || profile?.full_name || 'Mi Negocio'
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header móvil ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F97316] rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-[#0F172A]">Cotiza<span className="text-[#F97316]">Ya</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/notificaciones" className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500">
            {Icons.bell}
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </Link>
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">
            {initials}
          </div>
        </div>
      </header>

      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col bg-white border-r border-gray-100 z-20 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <p className="font-bold text-[#0F172A] text-base">Cotiza<span className="text-[#F97316]">Ya</span> <span className="text-xs text-gray-400 font-normal">PR</span></p>
              <p className="text-xs text-gray-400">Panel de Control</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact)
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-orange-50 text-[#F97316]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}>
                      <span className={active ? 'text-[#F97316]' : 'text-gray-400'}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.isNew && (
                        <span className="text-[9px] font-bold bg-[#F97316] text-white px-1.5 py-0.5 rounded-full">NEW</span>
                      )}
                      {item.href === '/dashboard/cotizaciones' && pendingQuotes > 0 && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 w-5 h-5 rounded-full flex items-center justify-center">
                          {pendingQuotes}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Notificaciones + User */}
        <div className="px-3 py-3 border-t border-gray-50 space-y-1">
          <Link href="/dashboard/notificaciones"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="text-gray-400 relative">
              {Icons.bell}
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </span>
            <span className="flex-1">Notificaciones</span>
            {unreadNotifs > 0 && (
              <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>
            )}
          </Link>

          {/* User card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer group">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{profile?.email}</p>
            </div>
            <button onClick={handleSignOut}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded-lg">
              {Icons.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="w-full pt-14 pb-[88px] md:ml-64 md:pt-0 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* ── Bottom Nav móvil ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 safe-area-bottom shadow-lg">
        <div className="flex items-center h-[72px]">
          <Link href="/dashboard"
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${pathname === '/dashboard' ? 'text-[#F97316]' : 'text-gray-400'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[10px] font-semibold">Inicio</span>
          </Link>

          <Link href="/dashboard/cotizaciones"
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full relative transition-colors ${pathname.startsWith('/dashboard/cotizaciones') ? 'text-[#F97316]' : 'text-gray-400'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {pendingQuotes > 0 && (
              <span className="absolute top-2 right-6 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pendingQuotes}</span>
            )}
            <span className="text-[10px] font-semibold">Cotizaciones</span>
          </Link>

          {/* FAB - Nueva Cotización */}
          <div className="flex-1 flex justify-center">
            <Link href="/dashboard/cotizaciones/nueva"
              className="flex flex-col items-center justify-center w-[60px] h-[60px] -mt-5 bg-[#F97316] rounded-2xl shadow-xl shadow-orange-300/50 active:scale-90 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="text-white text-[9px] font-bold">Cotizar</span>
            </Link>
          </div>

          <Link href="/dashboard/corte"
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${pathname.startsWith('/dashboard/corte') ? 'text-[#F97316]' : 'text-gray-400'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
            <span className="text-[10px] font-semibold">Corte</span>
          </Link>

          <Link href="/dashboard/clients"
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${pathname.startsWith('/dashboard/clients') ? 'text-[#F97316]' : 'text-gray-400'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span className="text-[10px] font-semibold">Clientes</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}