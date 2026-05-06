'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/dashboard/quotes', label: 'Cotizaciones', icon: '📋' },
  { href: '/dashboard/projects', label: 'Proyectos', icon: '🏗️' },
  { href: '/dashboard/clients', label: 'Clientes', icon: '👥' },
  { href: '/dashboard/suppliers', label: 'Suplidores', icon: '📞' },
  { href: '/dashboard/precios', label: 'Mis Precios', icon: '💰' },
  { href: '/dashboard/ai-assistant', label: 'Asistente IA', icon: '🤖' },
  { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header móvil (compacto) ──────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#F97316] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">C</span>
          </div>
          <span className="font-bold text-sm text-[#0F172A]">Cotiza<span className="text-[#F97316]">Ya</span></span>
        </div>
      </header>

      {/* ── Sidebar desktop (solo ≥768px) ────────────────── */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col bg-white border-r border-gray-100 z-20">
        <div className="px-5 py-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F97316] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <p className="font-bold text-[#0F172A]">Cotiza<span className="text-[#F97316]">Ya</span> <span className="text-xs text-gray-400 font-normal">PR</span></p>
              <p className="text-xs text-gray-400">Screen PRO</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const activo = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activo ? 'bg-orange-50 text-[#F97316]' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ── Contenido principal ───────────────────────────── */}
      <main className="w-full pt-12 pb-[88px] md:ml-64 md:pt-0 md:pb-0">
        {children}
      </main>

      {/* ── Bottom Navigation - SOLO MÓVIL ───────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center h-[72px]">
          {/* Home */}
          <Link href="/dashboard" className={`flex-1 flex flex-col items-center justify-center gap-1 h-full active:scale-90 transition-transform ${pathname === '/dashboard' ? 'text-[#F97316]' : 'text-gray-400'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[11px] font-semibold">Inicio</span>
          </Link>

          {/* Cotizar - Botón principal */}
          <div className="flex-1 flex justify-center">
            <Link href="/dashboard/cotizaciones/nueva" className="flex flex-col items-center justify-center w-[60px] h-[60px] -mt-4 bg-[#F97316] rounded-2xl shadow-lg shadow-orange-300/40 active:scale-90 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="text-white text-[9px] font-bold mt-0.5">Cotizar</span>
            </Link>
          </div>

          {/* Clientes */}
          <Link href="/dashboard/clients" className={`flex-1 flex flex-col items-center justify-center gap-1 h-full active:scale-90 transition-transform ${pathname.startsWith('/dashboard/clients') ? 'text-[#F97316]' : 'text-gray-400'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span className="text-[11px] font-semibold">Clientes</span>
          </Link>

          {/* Precios */}
          <Link href="/dashboard/precios" className={`flex-1 flex flex-col items-center justify-center gap-1 h-full active:scale-90 transition-transform ${pathname.startsWith('/dashboard/precios') ? 'text-[#F97316]' : 'text-gray-400'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span className="text-[11px] font-semibold">Precios</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
