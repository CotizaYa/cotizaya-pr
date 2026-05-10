'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronRight, ChevronLeft, DoorOpen, Wind, Layers, Grid3x3, Wrench, Square, Search } from 'lucide-react'
import { formatUSD } from '@/lib/calculations'
import { renderByCode } from '@/components/product/ProductVisual'

interface Product {
  id: string; code: string | null; name: string
  category: string; price_type: string; base_price: number
}

const CAT_ORDER = ['screen', 'puerta', 'ventana', 'closet', 'aluminio', 'cristal', 'tornilleria', 'miscelanea']

const CAT_META: Record<string, { label: string; short: string; icon: React.ReactNode }> = {
  screen:      { label: 'Puertas de Screen', short: 'Screens',   icon: <Grid3x3 className="w-4 h-4" /> },
  puerta:      { label: 'Puertas',           short: 'Puertas',   icon: <DoorOpen className="w-4 h-4" /> },
  ventana:     { label: 'Ventanas',          short: 'Ventanas',  icon: <Wind className="w-4 h-4" /> },
  closet:      { label: 'Closets',           short: 'Closets',   icon: <Layers className="w-4 h-4" /> },
  aluminio:    { label: 'Perfilería',        short: 'Perfiles',  icon: <Wrench className="w-4 h-4" /> },
  cristal:     { label: 'Cristalería',       short: 'Cristal',   icon: <Square className="w-4 h-4" /> },
  tornilleria: { label: 'Tornillería',       short: 'Tornillos', icon: <Wrench className="w-4 h-4" /> },
  miscelanea:  { label: 'Servicios',         short: 'Servicios', icon: <Wrench className="w-4 h-4" /> },
}

// Screen accessories that should show under a separate "Materiales" sub-section
const SCREEN_ACCESSORIES = new Set(['S004','S005','S006','S007','S008','S009'])

function CatalogoContent() {
  const searchParams = useSearchParams()
  const catParam = searchParams.get('cat')
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [userPrices, setUserPrices] = useState<Record<string, number>>({})
  const [selectedCat, setSelectedCat] = useState<string | null>(catParam)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const chipScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const [prodsRes, pricesRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_active', true).order('category').order('code'),
          supabase.from('user_prices').select('product_id, price').eq('user_id', user.id),
        ])
        const prods = prodsRes.data ?? []
        const pm: Record<string, number> = {}
        ;(pricesRes.data ?? []).forEach((p: any) => { pm[p.product_id] = p.price })
        setProducts(prods)
        setUserPrices(pm)
        if (!selectedCat) {
          const first = CAT_ORDER.find(c => prods.some(p => p.category === c)) ?? prods[0]?.category
          setSelectedCat(catParam ?? first ?? null)
        }
      } finally { setLoading(false) }
    }
    load()
  }, [supabase])

  // Scroll active chip to center after data loads
  useEffect(() => {
    if (!chipScrollRef.current || !selectedCat) return
    const el = chipScrollRef.current.querySelector('[data-active="true"]') as HTMLElement
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedCat, loading])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
    </div>
  )

  const sortedCats = Array.from(new Set(products.map(p => p.category)))
    .sort((a, b) => {
      const ai = CAT_ORDER.indexOf(a), bi = CAT_ORDER.indexOf(b)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })

  // For screen category: split into main models vs accessories
  const allInCat = selectedCat ? products.filter(p => p.category === selectedCat) : products
  const mainProducts = selectedCat === 'screen'
    ? allInCat.filter(p => !SCREEN_ACCESSORIES.has(p.code ?? ''))
    : allInCat
  const accessoryProducts = selectedCat === 'screen'
    ? allInCat.filter(p => SCREEN_ACCESSORIES.has(p.code ?? ''))
    : []

  const filterFn = (list: Product[]) => search.length > 1
    ? list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.code ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : list

  const filteredMain = filterFn(mainProducts)
  const filteredAccessories = filterFn(accessoryProducts)
  const totalVisible = filteredMain.length + filteredAccessories.length

  return (
    // overflow-x must NOT be on the page container - it clips the right grid column on iOS
    // Instead, wrap only the chips in an overflow-hidden container
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">

      {/* STICKY HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 w-full">

        {/* Search bar + back */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl shrink-0 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Buscar en ${CAT_META[selectedCat ?? '']?.label ?? 'catálogo'}...`}
              className="w-full h-9 pl-9 pr-3 bg-gray-100 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-orange-300 transition-all"
            />
          </div>
        </div>

        {/* overflow-hidden on THIS wrapper prevents iOS Safari from making the page scrollable
            while still allowing the inner div to scroll horizontally */}
        <div className="overflow-hidden">
          <div
            ref={chipScrollRef}
            className="flex gap-2 px-3 pb-3 overflow-x-auto overflow-y-hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedCats.map(cat => {
              const m = CAT_META[cat]
              const active = selectedCat === cat
              const count = products.filter(p => p.category === cat).length
              return (
                <button
                  key={cat}
                  data-active={active}
                  onClick={() => { setSelectedCat(cat); setSearch('') }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all shrink-0 ${
                    active
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {m?.icon}
                  <span>{m?.short ?? cat}</span>
                  <span className={`font-black ${active ? 'opacity-70' : 'text-gray-400'}`}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="flex-1 px-3 pt-3 pb-28 md:pb-8 w-full">

        {totalVisible === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Grid3x3 className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm text-center">
              {search ? `Sin resultados para "${search}"` : 'Sin productos'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-3 text-xs text-orange-500 font-bold">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Main models */}
            {filteredMain.length > 0 && (
              <div className="mb-4">
                {!search && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-0.5">
                    {CAT_META[selectedCat ?? '']?.label ?? selectedCat} · {filteredMain.length}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {filteredMain.map(p => (
                    <ProductCard key={p.id} product={p} price={userPrices[p.id] ?? p.base_price} />
                  ))}
                </div>
              </div>
            )}

            {/* Screen accessories sub-section */}
            {filteredAccessories.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-0.5">
                  Materiales y Accesorios · {filteredAccessories.length}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {filteredAccessories.map(p => (
                    <ProductCard key={p.id} product={p} price={userPrices[p.id] ?? p.base_price} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, price }: { product: Product; price: number }) {
  const unit = product.price_type === 'por_unidad' ? 'und'
    : product.price_type === 'por_pie_lineal' ? 'pie lineal' : 'pie²'

  // Render SVG directly — bypasses ProductVisual wrapper's fixed h-44 that breaks layout
  const svgRender = renderByCode(product.code, product.category)

  return (
    <Link
      href={`/dashboard/cotizaciones/nueva?modelo=${product.code}`}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden active:scale-95 transition-transform hover:border-orange-400 hover:shadow-md group flex flex-col"
    >
      {/* Image area — fixed height, contains SVG render */}
      <div className="relative bg-[#eaf1f7] overflow-hidden" style={{ paddingBottom: '120%' }}>
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {svgRender}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-[9px] font-black text-orange-500 tracking-widest uppercase leading-none mb-1">
          {product.code}
        </p>
        <p className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2 flex-1">
          {product.name}
        </p>
        <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-sm font-black text-gray-900 leading-none">{formatUSD(price)}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">/{unit}</p>
          </div>
          <span className="text-[10px] font-black text-orange-500 flex items-center gap-0.5 group-hover:gap-1 transition-all">
            Cotizar<ChevronRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  )
}
