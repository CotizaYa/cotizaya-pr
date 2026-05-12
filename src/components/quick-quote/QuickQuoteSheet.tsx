/**
 * QuickQuoteSheet — El flujo de cotización en 60 segundos
 * Bottom sheet tipo iOS que se desliza desde abajo.
 * Diseñado para un contratista bajo el sol en Ponce,
 * con sudor en las manos, usando el pulgar.
 *
 * FLUJO COMPLETO:
 * 1. Tap en producto → sheet aparece
 * 2. Ingresas ancho + alto (FractionInput)
 * 3. Preview 2D se actualiza en tiempo real
 * 4. Tap "Cotizar" → genera la cotización
 * 5. Share por WhatsApp con 1 tap más
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Share2, ChevronDown, Loader2, CheckCircle } from 'lucide-react'
import { formatUSD, calcLineTotal, inchesToFraction } from '@/lib/calculations'
import { FractionInput } from '@/components/inputs/FractionInput'
import { DoorWindowPreview } from '@/components/preview/DoorWindowPreview'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string; code: string | null; name: string
  category: string; price_type: string; base_price: number
}

interface QuickQuoteSheetProps {
  product: Product | null
  userPrice: number
  clientPhone?: string
  onClose: () => void
  onQuoteCreated?: (quoteId: string) => void
}

const COLORS = [
  { name: 'Negro',     value: 'negro',     hex: '#1a1a1a' },
  { name: 'Blanco',    value: 'blanco',    hex: '#f0f0f0' },
  { name: 'Bronce',    value: 'bronce',    hex: '#7C5C3A' },
  { name: 'Beige',     value: 'beige',     hex: '#d4c4a0' },
  { name: 'Champagne', value: 'champagne', hex: '#c8a96e' },
]

function formatWhatsApp(product: Product, widthIn: number, heightIn: number,
  qty: number, color: string, price: number, total: number): string {
  const w = inchesToFraction(widthIn)
  const h = inchesToFraction(heightIn)
  return encodeURIComponent(
    `🏗️ *CotizaYa PR — Cotización Rápida*\n\n` +
    `📦 ${product.name} (${product.code ?? ''})\n` +
    `📐 ${w} × ${h}\n` +
    `🎨 Color: ${color.charAt(0).toUpperCase() + color.slice(1)}\n` +
    `🔢 Cantidad: ${qty}\n` +
    `💵 Precio unitario: ${formatUSD(price)}\n` +
    `━━━━━━━━━━━━━━━\n` +
    `*TOTAL: ${formatUSD(total)}*\n\n` +
    `_Generado con CotizaYa PR · cotizaya-pr.vercel.app_`
  )
}

export function QuickQuoteSheet({
  product,
  userPrice,
  clientPhone,
  onClose,
  onQuoteCreated,
}: QuickQuoteSheetProps) {
  const [widthIn, setWidthIn]   = useState(0)
  const [heightIn, setHeightIn] = useState(0)
  const [qty, setQty]           = useState(1)
  const [color, setColor]       = useState('negro')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const supabase = createClient()
  const sheetRef = useRef<HTMLDivElement>(null)

  // Animar entrada
  useEffect(() => {
    const el = sheetRef.current
    if (!el) return
    el.style.transform = 'translateY(100%)'
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  if (!product) return null

  const needsMeasures = product.price_type !== 'por_unidad'
  const lineTotal = calcLineTotal({
    priceType: product.price_type as 'por_unidad' | 'por_pie_cuadrado' | 'por_pie_lineal',
    unitPrice: userPrice,
    widthInches: widthIn,
    heightInches: heightIn,
    quantity: qty,
  })

  const isValid = !needsMeasures || (widthIn > 0 && heightIn > 0)

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('quick_quotes').insert({
        owner_id: user.id,
        product_code: product.code,
        product_name: product.name,
        width_in: widthIn || null,
        height_in: heightIn || null,
        quantity: qty,
        color,
        unit_price: userPrice,
        line_total: lineTotal,
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  function handleWhatsApp() {
    const msg = formatWhatsApp(product, widthIn, heightIn, qty, color, userPrice, lineTotal)
    const phone = clientPhone?.replace(/\D/g, '') ?? ''
    const url = phone
      ? `https://wa.me/1${phone}?text=${msg}`
      : `https://wa.me/?text=${msg}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
        style={{ maxHeight: '92dvh', overflowY: 'auto' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"/>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-1 pb-3 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              {product.code}
            </p>
            <p className="text-base font-black text-gray-900 leading-tight">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors -mt-1"
          >
            <X className="w-5 h-5 text-gray-400"/>
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Preview 2D — el WOW factor */}
          {needsMeasures && (
            <DoorWindowPreview
              code={product.code}
              category={product.category}
              widthIn={widthIn}
              heightIn={heightIn}
              color={color}
              showDimensions={widthIn > 0 && heightIn > 0}
            />
          )}

          {/* Medidas */}
          {needsMeasures && (
            <div className="grid grid-cols-2 gap-3">
              <FractionInput
                label="Ancho"
                value={widthIn}
                onChange={setWidthIn}
                placeholder="36"
              />
              <FractionInput
                label="Alto"
                value={heightIn}
                onChange={setHeightIn}
                placeholder="80"
              />
            </div>
          )}

          {/* Cantidad */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Cantidad
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 text-xl font-black text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
              >
                −
              </button>
              <div className="flex-1 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-xl font-black text-gray-900">{qty}</span>
              </div>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-12 h-12 rounded-xl bg-gray-100 text-xl font-black text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </div>

          {/* Colores */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all active:scale-95 ${
                    color === c.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[9px] font-bold text-gray-600">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
            <div>
              <p className="text-xs font-bold text-orange-600">TOTAL ESTIMADO</p>
              {needsMeasures && widthIn > 0 && heightIn > 0 && (
                <p className="text-[10px] text-orange-400">
                  {((widthIn * heightIn) / 144).toFixed(2)} pie² × {qty}
                </p>
              )}
            </div>
            <p className="text-2xl font-black text-orange-600">
              {isValid && lineTotal > 0 ? formatUSD(lineTotal) : '—'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-3 pb-safe">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              disabled={!isValid || lineTotal === 0}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-[#25D366] text-white text-sm font-black disabled:opacity-40 active:scale-95 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.102.546 4.082 1.502 5.804L.057 23.668c-.085.317.208.61.525.525l5.864-1.445A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.002-1.372l-.359-.213-3.718.916.932-3.631-.234-.374A9.77 9.77 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.429 0 9.818 4.388 9.818 9.818 0 5.43-4.389 9.818-9.818 9.818z"/>
              </svg>
              WhatsApp
            </button>

            {/* Guardar */}
            <button
              onClick={handleSave}
              disabled={!isValid || saving || saved}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-orange-500 text-white text-sm font-black disabled:opacity-40 active:scale-95 transition-all"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin"/>}
              {saved && <CheckCircle className="w-4 h-4"/>}
              {!saving && !saved && 'Guardar'}
              {saving && 'Guardando…'}
              {saved && '¡Guardado!'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
