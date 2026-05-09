'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Home,
  FileText,
  Users,
  Scissors,
  Calendar,
  BarChart3,
  DollarSign,
  Zap,
  Settings,
  Bell,
  LogOut,
  Plus,
  Loader2,
  Grid3x3,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Inicio', icon: Home, exact: true },
      { href: '/dashboard/cotizaciones', label: 'Cotizaciones', icon: FileText },
      { href: '/dashboard/catalogo', label: 'Catálogo', icon: Grid3x3 },
      { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
    ],
  },
  {
    label: 'Taller',
    items: [
      { href: '/dashboard/corte', label: 'Hojas de Corte', icon: Scissors },
      { href: '/dashboard/calendario', label: 'Calendario', icon: Calendar },
    ],
  },
  {
    label: 'Negocio',
    items: [
      { href: '/dashboard/precios', label: 'Mis Precios', icon: DollarSign },
      { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
    ],
  },
  {
    label: 'Herramientas',
    items: [
      { href: '/dashboard/asistente', label: 'Asistente IA', icon: Zap },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/dashboard/perfil', label: 'Configuración', icon: Settings },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const supabase = createClient()
  const [profile, setProfile] = useState<{ full_name?: string; business_name?: string; email?: string; avatar_url?: string } | null>(null)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [pendingQuotes, setPendingQuotes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [{ data: prof }, { count: notifCount }, { count: quoteCount }] = await Promise.all([
          supabase.from('profiles').select('full_name, business_name, avatar_url').eq('id', user.id).single(),
          supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('read', false),
          supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'sent'),
        ])

        setProfile({ ...prof, email: user.email })
        setUnreadNotifs(notifCount ?? 0)
        setPendingQuotes(quoteCount ?? 0)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  // Show real name: business_name if set and not default, else format from email
  const emailUser = profile?.email?.split('@')[0]
    ?.replace(/[._-]/g, ' ')
    ?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || ''
  const defaultNames = ['Mi Empresa', 'Mi Negocio', '']
  const displayName = (!defaultNames.includes(profile?.business_name ?? '') && profile?.business_name)
    ? profile.business_name
    : (emailUser || 'Mi Negocio')
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex-col bg-white border-r border-gray-100 z-20 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-50">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/logo-cotizaya.png" 
              alt="CotizaYa PR" 
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        active ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.href === '/dashboard/cotizaciones' && pendingQuotes > 0 && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 w-5 h-5 rounded-full flex items-center justify-center">
                          {pendingQuotes > 9 ? '9+' : pendingQuotes}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
            ) : (
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{profile?.email}</p>
            </div>
            <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 shadow-sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo-cotizaya.png" alt="CotizaYa PR" className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg">
          <div className="flex items-center justify-around h-16">
            {[
              { href: '/dashboard', icon: Home, label: 'Inicio', exact: true },
              { href: '/dashboard/cotizaciones', icon: FileText, label: 'Cotizar' },
              { href: '/dashboard/corte', icon: Scissors, label: 'Corte' },
              { href: '/dashboard/calendario', icon: Calendar, label: 'Producción' },
              { href: '/dashboard/perfil', icon: Settings, label: 'Ajustes' },
            ].map((item) => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 px-3 h-full transition-colors ${
                    active ? 'text-orange-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
