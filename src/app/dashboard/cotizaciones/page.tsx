'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, FileText, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'

const statusConfig = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600', icon: FileText },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-600', icon: Clock },
  viewed: { label: 'Vista', color: 'bg-purple-100 text-purple-600', icon: Clock },
  accepted: { label: 'Confirmada', color: 'bg-green-100 text-green-600', icon: CheckCircle2 },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-600', icon: AlertCircle },
  expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-500', icon: AlertCircle },
}

interface Quote {
  id: string
  quote_number: string
  status: string
  total: number
  created_at: string
  clients: { full_name: string } | null
}

export default function CotizacionesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadQuotes()
  }, [])

  async function loadQuotes() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data } = await supabase
      .from('quotes')
      .select('id, quote_number, status, total, created_at, clients(full_name)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    setQuotes((data as any) ?? [])
    setIsLoading(false)
  }

  async function markAsSold(quoteId: string) {
    setUpdatingId(quoteId)
    await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', quoteId)
    setQuotes((prev) =>
      prev.map((q) => (q.id === quoteId ? { ...q, status: 'accepted' } : q))
    )
    setUpdatingId(null)
  }

  const fmt = (n: number | string | null | undefined) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n ?? 0))

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PR', { month: 'short', day: 'numeric', year: 'numeric' })

  const confirmadas = quotes.filter((q) => q.status === 'accepted')
  const pendientes = quotes.filter((q) => q.status !== 'accepted' && q.status !== 'rejected')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-500 font-medium mt-1">{quotes.length} total · {confirmadas.length} confirmadas</p>
        </div>
        <Link
          href="/dashboard/cotizaciones/nueva"
          className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-lg p-6">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Confirmadas</p>
          <p className="text-2xl md:text-3xl font-bold text-green-700">
            {fmt(confirmadas.reduce((s, q) => s + Number(q.total), 0))}
          </p>
          <p className="text-xs text-green-600 mt-2 font-medium">{confirmadas.length} cotizaciones</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-6">
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Pendientes</p>
          <p className="text-2xl md:text-3xl font-bold text-orange-700">
            {fmt(pendientes.reduce((s, q) => s + Number(q.total), 0))}
          </p>
          <p className="text-xs text-orange-600 mt-2 font-medium">{pendientes.length} cotizaciones</p>
        </div>
      </div>

      {/* Quotes List */}
      {quotes.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg py-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No hay cotizaciones aún</p>
          <Link href="/dashboard/cotizaciones/nueva" className="inline-flex items-center gap-2 mt-4 text-orange-600 font-bold hover:underline">
            Crear la primera
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => {
            const cfg = statusConfig[q.status as keyof typeof statusConfig] || statusConfig.draft
            const StatusIcon = cfg.icon
            return (
              <Link
                key={q.id}
                href={`/dashboard/cotizaciones/${q.id}`}
                className="bg-white border border-gray-100 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base truncate">
                    {q.clients?.full_name ?? 'Sin cliente'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    #{q.quote_number} · {formatDate(q.created_at)}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">{fmt(q.total)}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color} mt-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>

                  {q.status !== 'accepted' && q.status !== 'rejected' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        markAsSold(q.id)
                      }}
                      disabled={updatingId === q.id}
                      className="flex items-center gap-2 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 whitespace-nowrap"
                    >
                      {updatingId === q.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Confirmar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
