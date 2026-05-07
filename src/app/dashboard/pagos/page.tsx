'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Link as LinkIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Payment {
  id: string
  client_name: string
  amount: number
  status: 'pending' | 'completed' | 'refunded'
  method: string
  created_at: string
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  refunded: { label: 'Reembolsado', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export default function PagosPage() {
  const supabase = createClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPayments() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setPayments(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const completedAmount = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-gray-500 font-medium mt-1">Cobra depósitos y balances finales de tus clientes.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95">
          <LinkIcon className="w-5 h-5" />
          Generar Link de Pago
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Cobrado este mes</p>
          <p className="text-3xl font-bold text-green-700">{fmt(completedAmount)}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
          <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Pendiente de cobro</p>
          <p className="text-3xl font-bold text-yellow-700">{fmt(pendingAmount)}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Método preferido</p>
          <p className="text-3xl font-bold text-blue-700">ATH Móvil</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Historial de Transacciones</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No se han registrado pagos todavía.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50">
                  <th className="py-3 px-6">Cliente</th>
                  <th className="py-3 px-6">Monto</th>
                  <th className="py-3 px-6">Estado</th>
                  <th className="py-3 px-6">Método</th>
                  <th className="py-3 px-6">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => {
                  const cfg = statusConfig[payment.status as keyof typeof statusConfig]
                  const StatusIcon = cfg.icon
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">{payment.client_name}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">{fmt(payment.amount)}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">{payment.method || 'Link de Pago'}</td>
                      <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                        {new Date(payment.created_at).toLocaleDateString('es-PR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ATH Móvil CTA */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-lg text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold mb-1">Soporte para ATH Móvil Business</h3>
          <p className="text-blue-100 text-sm">Conecta tu cuenta para recibir pagos instantáneos de tus clientes en Puerto Rico.</p>
        </div>
        <button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap">
          Configurar ATH Móvil
        </button>
      </div>
    </div>
  )
}
