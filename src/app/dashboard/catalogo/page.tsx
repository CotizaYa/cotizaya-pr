'use client'

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Search, Loader2, DoorOpen, Wind, Layers, Grid3x3, Wrench, Square } from 'lucide-react'
import { SkeletonGrid } from './components/SkeletonCard'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { ProductCard, type Product } from './components/ProductCard'

const CAT_ORDER = ['screen','puerta','ventana','closet','aluminio','cristal','tornilleria','miscelanea'] as const
type ProductCategory = (typeof CAT_ORDER)[number]

const CAT_META: Record<string, { label: string; short: string; icon: React.ReactNode }> = {
  screen:      { label: 'Puertas de Screen', short: 'Screens',   icon: <Grid3x3  className="w-3.5 h-3.5" aria-hidden="true" /> },
  puerta:      { label: 'Puertas',           short: 'Puertas',   icon: <DoorOpen className="w-3.5 h-3.5" aria-hidden="true" /> },
  ventana:     { label: 'Ventanas',          short: 'Ventanas',  icon: <Wind     className="w-3.5 h-3.5" aria-hidden="true" /> },
  closet:      { label: 'Closets',           short: 'Closets',   icon: <Layers   className="w-3.5 h-3.5" aria-hidden="true" /> },
  aluminio:    { label: 'Perfilería',        short: 'Perfiles',  icon: <Wrench   className="w-3.5 h-3.5" aria-hidden="true" /> },
  cristal:     { label: 'Cristalería',       short: 'Cristal',   icon: <Square   className="w-3.5 h-3.5" aria-hidden="true" /> },
  tornilleria: { label: 'Tornillería',       short: 'Tornillos', icon: <Wrench   className="w-3.5 h-3.5" aria-hidden="true" /> },
  miscelanea:  { label: 'Servicios',         short: 'Servicios', icon: <Wrench   className="w-3.5 h-3.5" aria-hidden="true" /> },
}

const SCREEN_ACCESSORIES = new Set(['S004','S005','S006','S007','S008','S009'])

function CatalogoContent() {
  const searchParams = useSearchParams()
  const catParam     = searchParams.get('cat')
  const supabase     = createClient()

  const [products,    setProducts]    = useState<Product[]>([])
  const [userPrices,  setUserPrices]  = useState<Record<string, number>>({})
  const [selectedCat, setSelectedCat] = useState<string | null>(catParam)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(false)
  const [search,      setSearch]      = useState('')
  const chipScrollRef = useRef<HTMLDivElement>(null)

  const loadCatalog = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [prodsRes, pricesRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('category').order('code'),
        supabase.from('user_prices').select('product_id, price').eq('user_id', user.id),
      ])
      if (prodsRes.error) throw prodsRes.error

      const prods: Product[] = prodsRes.data ?? []
      const pm: Record<string, number> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(pricesRes.data ?? []).forEach((p: any) => { pm[p.product_id] = p.price })

      setProducts(prods)
      setUserPrices(pm)

      if (!selectedCat) {
        const first = CAT_ORDER.find(c => prods.some(p => p.category === c)) ?? prods[0]?.category
        setSelectedCat(catParam ?? first ?? null)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  useEffect(() => { loadCatalog() }, [loadCatalog])

  useEffect(() => {
    if (!chipScrollRef.current || !selectedCat || loading) return
    const el = chipScrollRef.current.querySelector<HTMLElement>('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedCat, loading])

  const sortedCats = Array.from(new Set(products.map(p => p.category))).sort((a, b) => {
    const ai = CAT_ORDER.indexOf(a as ProductCategory)
    const bi = CAT_ORDER.indexOf(b as ProductCategory)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const allInCat        = selectedCat ? products.filter(p => p.category === selectedCat) : products
  const mainProducts    = selectedCat === 'screen' ? allInCat.filter(p => !SCREEN_ACCESSORIES.has(p.code ?? '')) : allInCat
  const accessoryProds  = selectedCat === 'screen' ? allInCat.filter(p =>  SCREEN_ACCESSORIES.has(p.code ?? '')) : []

  // Búsqueda desde 1 carácter
  const applySearch = (list: Product[]) => search.length > 0
    ? list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.code ?? '').toLowerCase().includes(search.toLowerCase()))
    : list

  const filteredMain  = applySearch(mainProducts)
  const filteredAccs  = applySearch(accessoryProds)
  const totalVisible  = filteredMain.length + filteredAccs.length

  // ── Header sticky ──────────────────────────────────────────────
  // FIX CRÍTICO: top-16 en mobile para quedar DEBAJO del dashboard header (h-16)
  //              top-0 en desktop (md:hidden) donde no hay header del dashboard
  const StickyHeader = (
    <div className="bg-white border-b border-gray-100 sticky top-16 md:top-0 z-20 w-full shadow-sm">
      {/* Fila 1: back + búsqueda */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl shrink-0 transition-colors" aria-label="Volver al inicio">
          <ChevronLeft className="w-5 h-5 text-gray-500" aria-hidden="true" />
        </Link>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar en ${CAT_META[selectedCat ?? '']?.label ?? 'catálogo'}…`}
            className="w-full h-9 pl-9 pr-4 bg-gray-100 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-orange-300 transition-all"
            aria-label="Buscar productos"
          />
        </div>
      </div>

      {/* Fila 2: chips de categorías */}
      <div className="overflow-hidden">
        <div
          ref={chipScrollRef}
          className="flex gap-2 px-3 pb-2.5 overflow-x-auto overflow-y-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-7 w-16 rounded-full bg-gray-100 animate-pulse shrink-0" />
              ))
            : sortedCats.map(cat => {
                const m      = CAT_META[cat]
                const active = selectedCat === cat
                const count  = products.filter(p => p.category === cat).length
                return (
                  <button
                    key={cat}
                    data-active={active}
                    onClick={() => { setSelectedCat(cat); setSearch('') }}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all shrink-0 ${
                      active
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95'
                    }`}
                  >
                    {m?.icon}
                    <span>{m?.short ?? cat}</span>
                    <span className={`font-black tabular-nums ${active ? 'opacity-70' : 'text-gray-400'}`}>{count}</span>
                  </button>
                )
              })}
        </div>
      </div>
    </div>
  )

  // ── Estados ────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {StickyHeader}
      <SkeletonGrid />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {StickyHeader}
      <ErrorState onRetry={loadCatalog} />
    </div>
  )

  // ── Grid principal ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {StickyHeader}

      <div className="flex-1 px-3 pt-3 pb-28 md:pb-8 w-full">
        {totalVisible === 0 ? (
          <EmptyState query={search} onClear={() => setSearch('')} />
        ) : (
          <>
            {filteredMain.length > 0 && (
              <div className="mb-5">
                {!search && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-0.5">
                    {CAT_META[selectedCat ?? '']?.label ?? selectedCat} · {filteredMain.length}
                  </p>
                )}
                {/* Grid con inline style para garantizar 2 columnas en mobile */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}
                     className="md:grid-cols-3 lg:grid-cols-4">
                  {filteredMain.map(p => (
                    <ProductCard key={p.id} product={p} price={userPrices[p.id] ?? p.base_price} />
                  ))}
                </div>
              </div>
            )}

            {filteredAccs.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-0.5">
                  Materiales y Accesorios · {filteredAccs.length}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {filteredAccs.map(p => (
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

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" aria-hidden="true" />
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  )
}
