'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateCutSheet, inchesToFeetDisplay, type CutItem } from '@/lib/cut-sheet-calculator'
import { Plus, Trash2, Calculator, Save, Loader2, ArrowLeft, Scissors } from 'lucide-react'
import Link from 'next/link'

const PRODUCT_TYPES = [
  { value: 'frame', label: 'Marco (Puerta/Ventana)' },
  { value: 'panel', label: 'Panel' },
  { value: 'rail', label: 'Riel' },
  { value: 'stile', label: 'Larguero' },
  { value: 'custom', label: 'Personalizado' },
]

const EMPTY_ITEM: CutItem = { label: '', width: 0, height: 0, quantity: 1, type: 'frame' }

export default function NuevaHojaDeCorte() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [barLength, setBarLength] = useState(236)
  const [items, setItems] = useState<CutItem[]>([{ ...EMPTY_ITEM }])
  const [result, setResult] = useState<ReturnType<typeof calculateCutSheet> | null>(null)
  const [saving, setSaving] = useState(false)

  const addItem = () => setItems([...items, { ...EMPTY_ITEM }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof CutItem, value: any) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: value }
    setItems(updated)
  }

  const calculate = () => {
    const validItems = items.filter(it => it.label && (it.width > 0 || it.height > 0) && it.quantity > 0)
    if (validItems.length === 0) return
    setResult(calculateCutSheet(validItems, barLength))
  }

  const save = async () => {
    if (!result || !name) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from('cut_sheets').insert({
        owner_id: user.id,
        name,
        client_name: clientName,
        material: items[0]?.type || 'frame',
        items,
        total_pieces: items.reduce((sum, it) => sum + it.quantity, 0),
        status: 'ready',
      }).select().single()

      if (!error && data) {
        router.push(`/dashboard/corte`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/corte" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nueva Hoja de Corte</h1>
          <p className="text-gray-500 font-medium">Configura las piezas para optimizar el material.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">Nombre del Proyecto *</label>
                <input
                  required
                  placeholder="Ej: Ventanas Res. Los Pinos"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">Cliente</label>
                <input
                  placeholder="Nombre del cliente"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">Largo de Barra (pulgadas)</label>
              <input
                type="number"
                value={barLength}
                onChange={e => setBarLength(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">Estándar en PR: 236" (aprox. 20 pies)</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Lista de Piezas</h2>
              <button onClick={addItem} className="text-orange-600 hover:text-orange-700 font-bold text-xs flex items-center gap-1">
                <Plus className="w-4 h-4" /> Agregar Pieza
              </button>
            </div>
            <div className="p-4 space-y-4">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Descripción</label>
                    <input
                      placeholder="Ej: Marco superior"
                      value={item.label}
                      onChange={e => updateItem(i, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Ancho (")</label>
                    <input
                      type="number"
                      value={item.width || ''}
                      onChange={e => updateItem(i, 'width', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Alto (")</label>
                    <input
                      type="number"
                      value={item.height || ''}
                      onChange={e => updateItem(i, 'height', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cant.</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeItem(i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-600" /> Resumen de Optimización
            </h2>
            
            {!result ? (
              <div className="text-center py-8">
                <Scissors className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Ingresa piezas para calcular el material necesario.</p>
                <button
                  onClick={calculate}
                  className="mt-4 w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-all"
                >
                  Calcular Ahora
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-600 font-bold uppercase mb-1">Barras Necesarias</p>
                  <p className="text-3xl font-bold text-orange-700">{result.totalBarsNeeded}</p>
                  <p className="text-[10px] text-orange-500 mt-1 italic">Basado en barras de {barLength}"</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Lineales Totales</p>
                    <p className="text-lg font-bold text-gray-900">{result.totalLinearInches}"</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Desperdicio</p>
                    <p className="text-lg font-bold text-gray-900">{Math.round(result.wastePct * 100)}%</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={calculate}
                    className="w-full border-2 border-gray-900 text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Recalcular
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || !name}
                    className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Guardar Hoja
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
