'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, ArrowRight, FileText, CheckCircle, Clock,
  TrendingUp, Users, Zap, ChevronRight, Grid3x3,
  DoorOpen, Wind, Layers,
} from 'lucide-react'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

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

const STATUS: Record<string, { label: string; dot: string }> = {
  draft:    { label: 'Borrador',  dot: 'bg-gray-400' },
  sent:     { label: 'Enviada',   dot: 'bg-blue-500' },
  viewed:   { label: 'Vista',     dot: 'bg-yellow-500' },
  accepted: { label: 'Aprobada', dot: 'bg-green-500' },
  rejected: { label: 'Rechazada',dot: 'bg-red-500' },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const QUICK_CATS = [
  { label: 'Screens',  href: '/dashboard/cotizaciones/nueva', icon: <Grid3x3 className="w-5 h-5" />,  color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { label: 'Puertas',  href: '/dashboard/cotizaciones/nueva', icon: <DoorOpen className="w-5 h-5" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Ventanas', href: '/dashboard/cotizaciones/nueva', icon: <Wind className="w-5 h-5" />,     color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { label: 'Closets',  href: '/dashboard/cotizaciones/nueva', icon: <Layers className="w-5 h-5" />,   color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

export default function DashboardHomeClient({ profile, stats, recentQuotes, productionEvents }: Props) {
  const supabase = createClient()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (profile && profile.onboarding_completed === false) {
      setShowOnboarding(true)
    }
  }, [profile])

  const displayName = profile?.business_name || profile?.full_name || 'Bienvenido'
  const firstName = displayName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const isNew = stats.quotesThisMonth === 0 && stats.clientCount === 0

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard initialName={displayName} />
      )}

      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">

        {/* ── Hero CTA ── */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-orange-200">
          <p className="text-orange-100 text-sm font-medium mb-1">{greeting},</p>
          <h1 className="text-2xl md:text-3xl font-black mb-4">{firstName} 👋</h1>
          <Link
            href="/dashboard/cotizaciones/nueva"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-6 py-3 rounded-2xl hover:bg-orange-50 transition-all shadow-lg text-base active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Nueva Cotización
          </Link>
          <p className="text-orange-100 text-xs mt-3 opacity-80">Genera un estimado profesional en menos de 3 minutos</p>
        </div>

        {/* ── Quick categories ── */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Cotizar rápido por categoría</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_CATS.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${cat.color} hover:opacity-80 transition-all text-center`}
              >
                {cat.icon}
                <span className="text-xs font-bold">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        {!isNew && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Cotizaciones este mes', value: stats.quotesThisMonth, icon: <FileText className="w-4 h-4" />, color: 'text-blue-600' },
              { label: 'Ingresos aceptados', value: fmt(stats.revenueThisMonth), icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-600' },
              { label: 'Pendientes de respuesta', value: stats.pendingCount, icon: <Clock className="w-4 h-4" />, color: 'text-yellow-600' },
              { label: 'Clientes totales', value: stats.clientCount, icon: <Users className="w-4 h-4" />, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className={`${s.color} mb-2`}>{s.icon}</div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state for new users ── */}
        {isNew && (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">Haz tu primera cotización</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              Tu catálogo tiene 63 modelos listos con precios de Puerto Rico. Solo necesitas las medidas.
            </p>
            <Link
              href="/dashboard/cotizaciones/nueva"
              className="inline-flex items-center gap-2 bg-orange-600 text-white font-black px-6 py-3 rounded-xl hover:bg-orange-700 transition-all"
            >
              Comenzar ahora <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Recent quotes ── */}
        {recentQuotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Cotizaciones Recientes</p>
              <Link href="/dashboard/cotizaciones" className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:gap-2 transition-all">
                Ver todas <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentQuotes.map((q: any) => {
                const st = STATUS[q.status] ?? STATUS.draft
                return (
                  <Link
                    key={q.id}
                    href={`/dashboard/cotizaciones/${q.id}`}
                    className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-sm transition-all group"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${st.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {q.quote_number}
                        {q.clients?.full_name && <span className="text-gray-400 font-medium"> — {q.clients.full_name}</span>}
                      </p>
                      <p className="text-xs text-gray-400">{st.label} · {new Date(q.created_at).toLocaleDateString('es-PR', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <p className="font-black text-gray-900 text-sm shrink-0">{fmt(q.total)}</p>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── AI assistant promo ── */}
        <Link
          href="/dashboard/asistente"
          className="flex items-center gap-4 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-5 hover:border-violet-200 transition-all group"
        >
          <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-violet-600" />
          </div>
          <div className="flex-1">
            <p className="font-black text-gray-900">Asistente IA — Incluido gratis</p>
            <p className="text-sm text-gray-500 mt-0.5">Calcula precios, recomienda materiales y responde dudas técnicas</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-violet-500 transition-colors" />
        </Link>

      </div>
    </>
  )
}
