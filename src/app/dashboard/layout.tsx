'use client'

import { useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header móvil */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F97316] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-[#0F172A]">Cotiza<span className="text-[#F97316]">Ya</span></span>
        </div>
        <button onClick={() => setOpen(true)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col bg-white border-r border-gray-100 z-20">
        <div className="px-5 py-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F97316] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <p className="font-bold text-[#0F172A]">Cotiza<span className="text-[#F97316]">Ya</span> <span className="text-xs text-gray-400 font-normal">PR</span></p>
              <p className="text-xs text-gray-400">CotizaYa</p>
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

      {/* Sidebar móvil overlay */}
      {open && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-[#0F172A]">Cotiza<span className="text-[#F97316]">Ya</span> PR</span>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const activo = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${activo ? 'bg-orange-50 text-[#F97316]' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <span className="text-lg">{item.icon}</span>{item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}

      {/* Contenido principal */}
      <main className="w-full pt-14 pb-24 md:ml-64 md:pt-0 md:pb-0">
        {children}
      </main>

      {/* Bottom navigation - solo móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 h-20 flex items-center">
        <Link href="/dashboard" className={`flex-1 flex flex-col items-center gap-0.5 py-2 ${pathname === '/dashboard' ? 'text-[#F97316]' : 'text-gray-400'}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>
        <Link href="/dashboard/quotes" className={`flex-1 flex flex-col items-center gap-0.5 py-2 ${pathname.startsWith('/dashboard/quotes') ? 'text-[#F97316]' : 'text-gray-400'}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span className="text-[10px] font-medium">Cotizaciones</span>
        </Link>
        <div className="flex-1 flex justify-center">
          <Link href="/dashboard/quotes/nueva" className="flex flex-col items-center justify-center w-16 h-16 -mt-6 bg-[#F97316] rounded-2xl shadow-xl shadow-orange-200 active:scale-95 transition-all">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="text-white text-[9px] font-bold mt-0.5 uppercase">Nueva</span>
          </Link>
        </div>
        <Link href="/dashboard/clients" className={`flex-1 flex flex-col items-center gap-0.5 py-2 ${pathname.startsWith('/dashboard/clients') ? 'text-[#F97316]' : 'text-gray-400'}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span className="text-[10px] font-medium">Clientes</span>
        </Link>
        <Link href="/dashboard/settings" className={`flex-1 flex flex-col items-center gap-0.5 py-2 ${pathname.startsWith('/dashboard/settings') ? 'text-[#F97316]' : 'text-gray-400'}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <span className="text-[10px] font-medium">Más</span>
        </Link>
      </nav>
    </div>
  )
}
