'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Loader2, Package, User, Phone, MapPin, Search, CheckCircle } from 'lucide-react'
import { formatUSD, parseFraction, calcLineTotal } from '@/lib/calculations'
import { ProductVisual } from '@/components/product/ProductVisual'

interface Product {
  id: string; code: string | null; name: string
  category: string; price_type: string; base_price: number
  unit_label: string | null; is_active: boolean
}

interface QuoteItem {
  product_id: string; product_snapshot: any
  width_inches: number; height_inches: number
  quantity: number; color: string; line_total: number
}

interface ExistingClient {
  id: string; full_name: string; phone: string | null; address: string | null
}

const COLORS = [
  { name: 'Negro',     value: 'negro',     hex: '#1a1a1a' },
  { name: 'Blanco',    value: 'blanco',    hex: '#FFFFFF' },
  { name: 'Bronce',    value: 'bronce',    hex: '#7C5C3A' },
  { name: 'Beige',     value: 'beige',     hex: '#F5F0E8' },
  { name: 'Champagne', value: 'champagne', hex: '#E8D5A3' },
]

const CAT_LABEL: Record<string, string> = {
  screen: 'Screens', puerta: 'Puertas', ventana: 'Ventanas', closet: 'Closets',
}

const Progress = ({ step }: { step: number }) => (
  <div className="flex gap-1.5 mt-3">
    {[0,1,2].map(i => (
      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-orange-500' : 'bg-gray-200'}`} />
    ))}
  </div>
)

function NuevaCotizacionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // 0=cliente, 1=producto, 2=medidas
  const [step, setStep] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [userPrices, setUserPrices] = useState<Record<string, number>>({})
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Client state
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [existingClients, setExistingClients] = useState<ExistingClient[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Measurements
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [color, setColor] = useState('negro')
  const [lineTotal, setLineTotal] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const EXCL = ['S004','S005','S006','S007','S008','S009']
        const CATS = ['screen','puerta','ventana','closet']

        const [prodsRes, pricesRes, clientsRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_active', true).order('category').order('code'),
          supabase.from('user_prices').select('*').eq('user_id', user.id),
          supabase.from('clients').select('id,full_name,phone,address').eq('owner_id', user.id).order('full_name').limit(100),
        ])

        setProducts((prodsRes.data ?? []).filter(p => CATS.includes(p.category) && !EXCL.includes(p.code ?? '')))
        const pm: Record<string, number> = {}
        ;(pricesRes.data ?? []).forEach((p: any) => { pm[p.product_id] = p.price })
        setUserPrices(pm)
        setExistingClients(clientsRes.data ?? [])

        const modeloParam = searchParams.get('modelo')
        if (modeloParam) {
          const prod = (prodsRes.data ?? []).find(p => p.code === modeloParam)
          if (prod) { setSelectedProduct(prod); setStep(1) }
        }
      } finally { setIsLoading(false) }
    }
    load()
  }, [supabase, searchParams])

  useEffect(() => {
    if (!selectedProduct) return
    const p = userPrices[selectedProduct.id] ?? selectedProduct.base_price
    const qty = parseInt(quantity) || 1
    if (selectedProduct.price_type === 'por_unidad') {
      setLineTotal(p * qty)
    } else {
      const w = parseFraction(width), h = parseFraction(height)
      setLineTotal(w > 0 && h > 0 ? calcLineTotal({ widthInches: w, heightInches: h, unitPrice: p, quantity: qty, priceType: selectedProduct.price_type as any }) : 0)
    }
  }, [width, height, quantity, selectedProduct, userPrices])

  const suggestions = clientName.length > 1
    ? existingClients.filter(c => c.full_name.toLowerCase().includes(clientName.toLowerCase()))
    : []

  const pickClient = (c: ExistingClient) => {
    setClientName(c.full_name); setClientPhone(c.phone ?? ''); setClientAddress(c.address ?? '')
    setSelectedClientId(c.id); setShowSuggestions(false)
  }

  const addToQuote = () => {
    if (!selectedProduct) return
    const w = selectedProduct.price_type === 'por_unidad' ? 0 : parseFraction(width)
    const h = selectedProduct.price_type === 'por_unidad' ? 0 : parseFraction(height)
    setQuoteItems(prev => [...prev, {
      product_id: selectedProduct.id,
      product_snapshot: { code: selectedProduct.code, name: selectedProduct.name, category: selectedProduct.category, price_type: selectedProduct.price_type, base_price: userPrices[selectedProduct.id] ?? selectedProduct.base_price },
      width_inches: w, height_inches: h, quantity: parseInt(quantity) || 1, color, line_total: lineTotal,
    }])
    setSelectedProduct(null); setStep(1)
    setWidth(''); setHeight(''); setQuantity('1'); setColor('negro')
  }

  const saveQuote = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || quoteItems.length === 0) return
    setIsSaving(true)
    try {
      let finalClientId = selectedClientId
      if (!finalClientId && clientName.trim()) {
        const { data: nc } = await supabase.from('clients')
          .insert({ owner_id: user.id, full_name: clientName.trim(), phone: clientPhone.trim() || null, address: clientAddress.trim() || null })
          .select('id').single()
        finalClientId = nc?.id ?? null
      }

      const { data: qNum } = await supabase.rpc('get_next_quote_number', { p_owner_id: user.id })
      const subtotalVal = quoteItems.reduce((s, i) => s + i.line_total, 0)

      const { data: quote, error } = await supabase.from('quotes').insert({
        owner_id: user.id, client_id: finalClientId,
        quote_number: qNum ?? `COT-${new Date().getFullYear()}-001`,
        status: 'draft', subtotal_materials: subtotalVal, subtotal_labor: 0,
        ivu_amount: 0, ivu_rate: 0, total: subtotalVal,
        deposit_rate: 0.50, deposit_amount: subtotalVal * 0.5,
      }).select().single()

      if (error || !quote) throw error

      await supabase.from('quote_items').insert(
        quoteItems.map((item, i) => ({
          quote_id: quote.id, product_id: item.product_id,
          name_snapshot: item.product_snapshot.name, category_snapshot: item.product_snapshot.category,
          price_type_snapshot: item.product_snapshot.price_type, unit_price_snapshot: item.product_snapshot.base_price,
          width_inches: item.width_inches, height_inches: item.height_inches,
          quantity: item.quantity, line_total: item.line_total,
          metadata: { color: item.color }, position: i,
        }))
      )
      router.push(`/dashboard/cotizaciones/${quote.id}`)
    } catch (e) { console.error(e) } finally { setIsSaving(false) }
  }

  if (isLoading) return <div className="flex items-center justify-center h-screen bg-gray-50"><Loader2 className="w-10 h-10 text-orange-600 animate-spin" /></div>

  const subtotal = quoteItems.reduce((s, i) => s + i.line_total, 0)

  // ── STEP 0: Cliente ───────────────────────────────────────────
  if (step === 0) return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <div>
            <h1 className="text-base font-black text-gray-900">¿Para quién es?</h1>
            <p className="text-xs text-gray-400">Datos del cliente</p>
          </div>
        </div>
        <Progress step={0} />
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4 pt-6">
        {/* Name */}
        <div className="relative">
          <label className="flex items-center gap-1 text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
            <User className="w-3 h-3" /> Nombre *
          </label>
          <input type="text" value={clientName} autoFocus
            onChange={e => { setClientName(e.target.value); setSelectedClientId(null); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Ej: Juan Pérez"
            className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl text-base font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-30 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 overflow-hidden">
              <p className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 tracking-wider border-b">Clientes recientes</p>
              {suggestions.slice(0, 5).map(c => (
                <button key={c.id} onMouseDown={() => pickClient(c)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-orange-600 font-black">{c.full_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{c.full_name}</p>
                    {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-1 text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
            <Phone className="w-3 h-3" /> Teléfono
          </label>
          <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)}
            placeholder="(787) 000-0000"
            className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl text-base font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none"
          />
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center gap-1 text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
            <MapPin className="w-3 h-3" /> Dirección / Pueblo
          </label>
          <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)}
            placeholder="Ej: Manatí, PR"
            className="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl text-base font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={() => setStep(1)} className="flex-1 py-3.5 border-2 border-gray-200 text-gray-500 font-bold rounded-xl text-sm hover:bg-gray-50">
            Saltar
          </button>
          <button onClick={() => setStep(1)} disabled={!clientName.trim()}
            className="flex-[2] bg-orange-600 text-white font-black py-3.5 rounded-xl hover:bg-orange-700 disabled:opacity-40 flex items-center justify-center gap-2">
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  // ── STEP 1: Producto ──────────────────────────────────────────
  const cats = ['screen','puerta','ventana','closet']
  const filtered = searchTerm.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.code ?? '').includes(searchTerm))
    : products

  if (step === 1) return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(0)} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-gray-900 truncate">
              {clientName ? `Para: ${clientName}` : 'Selecciona un Modelo'}
            </h1>
            <p className="text-xs text-gray-400">{quoteItems.length > 0 ? `${quoteItems.length} item(s) · ${formatUSD(subtotal)}` : 'Elige del catálogo'}</p>
          </div>
        </div>
        <Progress step={1} />
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar modelo o código..."
            className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400" />
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border"><Package className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-gray-400">Sin productos</p></div>
        ) : searchTerm.length > 1 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => <PCard key={p.id} p={p} price={userPrices[p.id] ?? p.base_price} onSelect={() => { setSelectedProduct(p); setStep(2) }} />)}
          </div>
        ) : (
          cats.map(cat => {
            const catP = products.filter(p => p.category === cat)
            if (!catP.length) return null
            return (
              <div key={cat} className="mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">{CAT_LABEL[cat]} · {catP.length}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {catP.map(p => <PCard key={p.id} p={p} price={userPrices[p.id] ?? p.base_price} onSelect={() => { setSelectedProduct(p); setStep(2) }} />)}
                </div>
              </div>
            )
          })
        )}
      </div>

      {quoteItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-20 md:pb-4 shadow-xl z-20">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400">{quoteItems.length} item{quoteItems.length > 1 ? 's' : ''}</p>
                <p className="text-xl font-black text-gray-900">{formatUSD(subtotal)}</p>
              </div>
              <p className="text-sm font-bold text-orange-500">Depósito: {formatUSD(subtotal * 0.5)}</p>
            </div>
            <button onClick={saveQuote} disabled={isSaving}
              className="w-full bg-orange-600 text-white font-black py-4 rounded-xl hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Guardar Cotización →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // ── STEP 2: Medidas ───────────────────────────────────────────
  if (step === 2 && selectedProduct) {
    const showM = ['por_pie_cuadrado','por_pie_lineal'].includes(selectedProduct.price_type)
    const price = userPrices[selectedProduct.id] ?? selectedProduct.base_price
    const w = parseFraction(width), h = parseFraction(height)

    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedProduct(null); setStep(1) }} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
            <div>
              <h1 className="text-base font-black text-gray-900">Medidas y Color</h1>
              <p className="text-xs text-gray-400 truncate">{selectedProduct.name}</p>
            </div>
          </div>
          <Progress step={2} />
        </div>

        <div className="p-4 max-w-lg mx-auto space-y-5">
          {/* Product preview */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4 items-center">
            <div className="w-20 h-20 shrink-0"><ProductVisual category={selectedProduct.category} code={selectedProduct.code} name={selectedProduct.name} className="w-full h-full" /></div>
            <div>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider">{selectedProduct.code}</p>
              <p className="font-black text-gray-900 leading-tight">{selectedProduct.name}</p>
              <p className="text-sm font-black text-gray-900 mt-1">{formatUSD(price)}<span className="text-xs text-gray-400 font-normal ml-1">/ {selectedProduct.price_type === 'por_unidad' ? 'und' : 'pie²'}</span></p>
            </div>
          </div>

          {showM && (
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Medidas en pulgadas</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Ancho</p>
                  <input type="text" value={width} onChange={e => setWidth(e.target.value)} placeholder='36 1/2' autoFocus
                    className="w-full h-14 px-4 text-xl font-black bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Alto</p>
                  <input type="text" value={height} onChange={e => setHeight(e.target.value)} placeholder='80'
                    className="w-full h-14 px-4 text-xl font-black bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none" />
                </div>
              </div>
              {w > 0 && h > 0 && (
                <p className="text-xs text-gray-400 mt-2 text-center">{w}" × {h}" = {(w * h / 144).toFixed(2)} pie²</p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Cantidad</label>
            <div className="flex items-center gap-3 w-fit bg-white rounded-2xl border border-gray-100 p-1.5">
              <button onClick={() => setQuantity(Math.max(1, parseInt(quantity) - 1).toString())}
                className="w-11 h-11 bg-gray-50 rounded-xl font-black text-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all">−</button>
              <span className="text-xl font-black text-gray-900 w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity((parseInt(quantity) + 1).toString())}
                className="w-11 h-11 bg-gray-50 rounded-xl font-black text-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all">+</button>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Color del Perfil</label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map(({ name, value, hex }) => (
                <button key={value} onClick={() => setColor(value)} className="flex flex-col items-center gap-1.5">
                  <div className={`w-12 h-12 rounded-xl border-2 shadow-sm transition-all ${color === value ? 'border-orange-500 ring-4 ring-orange-100 scale-110' : 'border-gray-200'}`}
                    style={{ backgroundColor: hex }} />
                  <span className={`text-[9px] font-bold uppercase ${color === value ? 'text-orange-600' : 'text-gray-400'}`}>{name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live total */}
          {lineTotal > 0 && (
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-200">
              <p className="text-xs font-bold uppercase opacity-70 mb-1">Total del Item</p>
              <p className="text-4xl font-black">{formatUSD(lineTotal)}</p>
              <p className="text-xs opacity-70 mt-2">{formatUSD(price)} / {selectedProduct.price_type === 'por_unidad' ? 'unidad' : 'pie²'}</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 pb-20 md:pb-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-20">
          <div className="max-w-lg mx-auto">
            <button onClick={addToQuote}
              disabled={showM ? (!width || !height || lineTotal === 0) : lineTotal === 0}
              className="w-full bg-orange-600 text-white font-black py-4 rounded-xl hover:bg-orange-700 disabled:opacity-40 flex items-center justify-center gap-2 text-base">
              {lineTotal > 0 ? `Agregar — ${formatUSD(lineTotal)}` : 'Agregar'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function PCard({ p, price, onSelect }: { p: Product; price: number; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="bg-white p-3 rounded-2xl border border-gray-100 hover:border-orange-400 hover:shadow-md transition-all active:scale-95 text-left">
      <ProductVisual category={p.category} code={p.code} name={p.name} className="mb-3 h-28" />
      <p className="text-sm font-black text-gray-900 line-clamp-2 leading-tight mb-1">{p.name}</p>
      <p className="text-[10px] text-orange-500 font-bold">{p.code}</p>
      <p className="text-sm font-black text-gray-900 mt-1">{formatUSD(price)}</p>
    </button>
  )
}

export default function NuevaCotizacionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 text-orange-600 animate-spin" /></div>}>
      <NuevaCotizacionContent />
    </Suspense>
  )
}
