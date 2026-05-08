'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react'
import { formatUSD, parseFraction, calcLineTotal } from '@/lib/calculations'
import { ProductVisual } from '@/components/product/ProductVisual'

interface Product {
  id: string
  code: string | null
  name: string
  category: string
  price_type: string
  base_price: number
  unit_label: string | null
  is_active: boolean
}

interface QuoteItem {
  product_id: string
  product_snapshot: any
  width_inches: number
  height_inches: number
  quantity: number
  color: string
  line_total: number
}

const COLORS = [
  { name: 'Blanco', value: 'blanco', hex: '#FFFFFF', border: 'border-gray-200' },
  { name: 'Negro', value: 'negro', hex: '#000000', border: 'border-black' },
  { name: 'Bronce', value: 'bronce', hex: '#4A3728', border: 'border-[#4A3728]' },
  { name: 'Beige', value: 'beige', hex: '#F5F5DC', border: 'border-[#E1E1C0]' },
  { name: 'Champagne', value: 'champagne', hex: '#E7D1B1', border: 'border-[#D4B991]' },
]

function NuevaCotizacionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [userPrices, setUserPrices] = useState<Record<string, number>>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Paso 2: Medidas
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [color, setColor] = useState('blanco')
  const [notes, setNotes] = useState('')
  const [lineTotal, setLineTotal] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // RLS policy handles (owner_id IS NULL OR owner_id = auth.uid()) automatically
        // Explicit .or() in browser Supabase client has inconsistent behavior — removed
        const SCREEN_ACCESSORIES = ['S004','S005','S006','S007','S008','S009']
        const MAIN_CATS = ['screen','puerta','ventana','closet']

        const [allProdsRes, pricesRes] = await Promise.all([
          supabase.from('products').select('*')
            .eq('is_active', true)
            .order('category').order('code'),
          supabase.from('user_prices').select('*').eq('user_id', user.id),
        ])

        const filteredProds = (allProdsRes.data ?? []).filter(p =>
          MAIN_CATS.includes(p.category) &&
          !SCREEN_ACCESSORIES.includes(p.code ?? '')
        )
        setProducts(filteredProds)
        const pricesMap: Record<string, number> = {}
        ;(pricesRes.data ?? []).forEach((p: any) => {
          pricesMap[p.product_id] = p.price
        })
        setUserPrices(pricesMap)

        const modeloParam = searchParams.get('modelo')
        if (modeloParam && filteredProds.length > 0) {
          const product = filteredProds.find(p => p.code === modeloParam)
          if (product) {
            setSelectedProduct(product)
            setStep(2)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [supabase, searchParams])

  // Calcular total de línea cuando cambian medidas o cantidad
  useEffect(() => {
    if (!selectedProduct) return

    if (selectedProduct.price_type === 'por_unidad') {
      const qty = parseInt(quantity) || 1
      const price = userPrices[selectedProduct.id] ?? selectedProduct.base_price
      setLineTotal(price * qty)
    } else {
      const w = parseFraction(width)
      const h = parseFraction(height)
      const qty = parseInt(quantity) || 1

      if (w > 0 && h > 0) {
        const total = calcLineTotal({
          widthInches: w,
          heightInches: h,
          unitPrice: userPrices[selectedProduct.id] ?? selectedProduct.base_price,
          quantity: qty,
          priceType: selectedProduct.price_type as any,
        })
        setLineTotal(total)
      } else {
        setLineTotal(0)
      }
    }
  }, [width, height, quantity, selectedProduct, userPrices])

  const handleAddToQuote = () => {
    if (!selectedProduct) return

    const w = selectedProduct.price_type === 'por_unidad' ? 0 : parseFraction(width)
    const h = selectedProduct.price_type === 'por_unidad' ? 0 : parseFraction(height)
    const qty = parseInt(quantity) || 1

    const newItem: QuoteItem = {
      product_id: selectedProduct.id,
      product_snapshot: {
        code: selectedProduct.code,
        name: selectedProduct.name,
        category: selectedProduct.category,
        price_type: selectedProduct.price_type,
        base_price: userPrices[selectedProduct.id] ?? selectedProduct.base_price,
      },
      width_inches: w,
      height_inches: h,
      quantity: qty,
      color,
      line_total: lineTotal,
    }

    setQuoteItems([...quoteItems, newItem])
    setSelectedProduct(null)
    setStep(1)
    setWidth('')
    setHeight('')
    setQuantity('1')
    setColor('blanco')
    setNotes('')
  }

  const handleSaveQuote = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || quoteItems.length === 0) return

    setIsSaving(true)
    const subtotalVal = quoteItems.reduce((sum, item) => sum + item.line_total, 0)
    const ivu = 0
    const total = subtotalVal

    const year = new Date().getFullYear()
    const rand = Math.floor(Math.random() * 900) + 100
    const quoteNumber = `COT-${year}-${rand}`

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        owner_id: user.id,
        quote_number: quoteNumber,
        status: 'draft',
        subtotal_materials: subtotalVal,
        subtotal_labor: 0,
        ivu_amount: ivu,
        ivu_rate: 0,
        total,
        deposit_rate: 0.50,
        deposit_amount: total * 0.5,
      })
      .select()
      .single()

    if (error || !quote) {
      console.error('Error al guardar cotización:', error)
      setIsSaving(false)
      return
    }

    await supabase.from('quote_items').insert(
      quoteItems.map((item, index) => ({
        quote_id: quote.id,
        product_id: item.product_id,
        name_snapshot: item.product_snapshot.name,
        category_snapshot: item.product_snapshot.category,
        price_type_snapshot: item.product_snapshot.price_type,
        unit_price_snapshot: item.product_snapshot.base_price,
        width_inches: item.width_inches,
        height_inches: item.height_inches,
        quantity: item.quantity,
        line_total: item.line_total,
        metadata: { color: item.color },
        position: index,
      }))
    )

    setIsSaving(false)
    router.push(`/dashboard/cotizaciones/${quote.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-bold">Cargando...</p>
        </div>
      </div>
    )
  }

  const subtotal = quoteItems.reduce((sum, item) => sum + item.line_total, 0)
  const ivu = 0
  const total = subtotal

  // PASO 1: Seleccionar Modelo
  if (step === 1 && !selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-gray-900">Paso 1: Selecciona un Modelo</h1>
          <p className="text-xs text-gray-500 mt-1">Elige de nuestro catálogo o busca uno específico</p>
        </div>

        <div className="p-4 max-w-6xl mx-auto space-y-6">
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => {
                const price = userPrices[p.id] ?? p.base_price
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p)
                      setStep(2)
                    }}
                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all active:scale-95 text-left"
                  >
                    <ProductVisual
                      category={p.category}
                      code={p.code}
                      name={p.name}
                      className="mb-3 h-32"
                    />
                    <p className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">{p.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{p.code}</p>
                    <p className="text-sm font-bold text-orange-600">{formatUSD(price)}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {quoteItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 font-medium">Subtotal</p>
                <p className="text-lg font-black text-gray-900">{formatUSD(subtotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">Total</p>
                <p className="text-2xl font-black text-orange-600">{formatUSD(total)}</p>
              </div>
            </div>
            <button
              onClick={handleSaveQuote}
              disabled={isSaving}
              className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : `Guardar Cotización (${quoteItems.length} items)`}
            </button>
          </div>
        )}
      </div>
    )
  }

  // PASO 2: Medidas
  if (step === 2 && selectedProduct) {
    const showMeasures = ['por_pie_cuadrado', 'por_pie_lineal'].includes(selectedProduct.price_type)

    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Paso 2: Medidas</h1>
            <p className="text-xs text-gray-500 mt-1">{selectedProduct.name}</p>
          </div>
          <button
            onClick={() => {
              setSelectedProduct(null)
              setStep(1)
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 max-w-lg mx-auto space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <ProductVisual
              category={selectedProduct.category}
              code={selectedProduct.code}
              name={selectedProduct.name}
              className="mb-4 h-44"
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-orange-600">{selectedProduct.code}</p>
                <h2 className="text-base font-black text-gray-900">{selectedProduct.name}</h2>
                <p className="text-xs font-bold text-gray-500 mt-1">{selectedProduct.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-gray-500">Precio</p>
                <p className="text-lg font-black text-gray-900">{formatUSD(userPrices[selectedProduct.id] ?? selectedProduct.base_price)}</p>
              </div>
            </div>
          </div>

          {showMeasures && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Ancho (")</label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="ej. 36 1/2"
                  className="w-full h-12 px-4 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Alto (")</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="ej. 72"
                  className="w-full h-12 px-4 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Cantidad</label>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100">
              <button
                onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl text-xl font-bold text-gray-400 hover:text-orange-600 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value || '1')}
                className="flex-1 text-center text-xl font-bold bg-transparent outline-none"
              />
              <button
                onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl text-xl font-bold text-gray-400 hover:text-orange-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-3">Color del Perfil</label>
            <div className="grid grid-cols-5 gap-3">
              {COLORS.map(({ name, value, hex }) => (
                <button
                  key={value}
                  onClick={() => setColor(value)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${
                      color === value
                        ? 'border-orange-500 ring-4 ring-orange-50 scale-105'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {color === value && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-tighter ${color === value ? 'text-orange-600' : 'text-gray-400'}`}>
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold uppercase opacity-80">Total del Item</p>
                <p className="text-3xl font-black mt-1">{formatUSD(lineTotal)}</p>
              </div>
              <div className="text-right opacity-80">
                <p className="text-xs font-bold uppercase">Precio Unitario</p>
                <p className="text-sm font-bold">{formatUSD(userPrices[selectedProduct.id] ?? selectedProduct.base_price)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-20">
          <div className="max-w-lg mx-auto flex justify-end gap-3">
            <button
              onClick={() => {
                setSelectedProduct(null)
                setStep(1)
              }}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddToQuote}
              disabled={showMeasures && (!width || !height)}
              className="flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50"
            >
              <span>Agregar</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function NuevaCotizacionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 text-orange-600 animate-spin" /></div>}>
      <NuevaCotizacionContent />
    </Suspense>
  )
}
