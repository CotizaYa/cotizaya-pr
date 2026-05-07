'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateCutSheet, inchesToFeetDisplay, type CutItem } from '@/lib/cut-sheet-calculator'

const PRODUCT_TYPES = [
  { value: 'frame', label: 'Marco (Puerta/Ventana)', emoji: '🚪' },
  { value: 'panel', label: 'Panel', emoji: '⬜' },
  { value: 'rail', label: 'Riel', emoji: '↔️' },
  { value: 'stile', label: 'Larguero', emoji: '↕️' },
  { value: 'custom', label: 'Personalizado', emoji: '✏️' },
]

const EMPTY_ITEM: CutItem = { label: '', width: 0, height: 0, quantity: 1, type: 'frame' }

export default function NuevaHojaDeCorte() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('cut_sheets').insert({
      owner_id: user.id,
      name,
      product_type: items[0]?.type || 'frame',
      items,
      cuts: result.cuts,
      bar_length_inches: barLength,
      total_bars_needed: result.totalBarsNeeded,
      total_linear_inches: result.totalLinearInches,
      status: 'ready',
    }).select().single()

    setSaving(false)
    if (!error && data) router.push(`/dashboard/corte/${data.id}`)
  }

  // Agrupar