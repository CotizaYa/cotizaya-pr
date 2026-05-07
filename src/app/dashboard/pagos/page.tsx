'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Payment {
  id: string
  client_name: string
  amount: number
  status: 'pending' | 'completed' | 'refunded'
  method: string
  created_at: string
}

export default function PagosPage() {
  const supabase = createClientComponentClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPayments() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    setPayments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPayments()
  }, [])

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Gestión de Pagos</h1>
          <p className="text-gray-500 font-medium">Cobra depósitos y balances finales de tus clientes.</p>
        </div>
        <button className="bg-[#F97316] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Generar Link de Pago
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Cobrado este mes</p>
          <p className="text-3xl font-black text-green-700">{fmt(payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0))}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Pendiente de cobro</p>
          <p className="text-3xl font-black text-blue-700">{fmt(payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0))}</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Método preferido</p>
          <p className="text-3xl font-black text-orange-700">ATH Movil</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Historial de Transacciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Monto</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Método</th>
                <th className="py-4 px-6">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">Cargando pagos...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">No se han registrado pagos todavía.</td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{payment.client_name}</td>
                    <td className="py-4 px-6 font-black text-gray-900">{fmt(payment.amount)}</td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {payment.status === 'completed' ? 'Completado' : payment.status === 'pending' ? 'Pendiente' : 'Reembolsado'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-500">{payment.method || 'Link de Pago'}</td>
                    <td className="py-4 px-6 text-xs font-bold text-gray-400">
                      {new Date(payment.created_at).toLocaleDateString('es-PR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-600 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black mb-1">Soporte para ATH Móvil Business 🇵🇷</h3>
          <p className="text-blue-100 text-sm">Conecta tu cuenta para recibir pagos instantáneos de tus clientes en Puerto Rico.</p>
        </div>
        <button className="bg-white text-blue-600 font-black px-8 py-3 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap">
          Configurar ATH Móvil
        </button>
      </div>
    </div>
  )
}
