'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronRight, DoorOpen, Wind, Layers, Grid3x3, Warehouse, Wrench, Square } from 'lucide-react'
import { formatUSD } from '@/lib/calculations'
import { ProductVisual } from '@/components/product/ProductVisual'

interface Product {
  id: string
  code: string | null
  name: string
  category: string
  price_type: string
  base_price: number
  unit_label: string | null
}

const MAIN_CATEGORIES = ['screen', 'puerta', 'ventana', 'closet', 'garaje']

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; accent: string }> = {
  screen:    { label: 'Puertas de Screen',     icon: <Grid3x3 className="w-7 h-7" />,    color: 'bg-teal-50',   accent: 'border-teal-500 text-teal-700' },
  puerta:    { label: 'Puertas de Aluminio',   icon: <DoorOpen className="w-7 h-7" />,   color: 'bg-blue-50',   accent: 'border-blue-500 text-blue-700' },
  ventana:   { label: 'Ventanas',              icon: <Wind className="w-7 h-7" />,        color: 'bg-sky-50',    accent: 'border-sky-500 text-sky-700' },
  closet:    { label: 'Puertas de Closet',     icon: <Layers className="w-7 h-7" />,     color: 'bg-purple-50', accent: 'border-purple-500 text-purple-700' },
  garaje:    { label: 'Puertas de Garaje',     icon: <Warehouse className="w-7 h-7" />,  color: 'bg-orange-50', accent: 'border-orange-500 text-orange-700' },
  aluminio:  { label: 'Perfilería',            icon: <Wrench className="w-7 h-7" />,     color: 'bg-gray-50',   accent: 'border-gray-400 text-gray-600' },
  cristal:   { label: 'Cristalería',           icon: <Square className="w-7 h-7" />,     color: 'bg-cyan-50',   accent: 'border-cyan-500 text-cyan-700' },
  tornilleria: { label: 'Tornillería',         icon: <Wrench className="w-7 h-7" />,     color: 'bg-zinc-50',   accent: 'border-zinc-400 text-zinc-600' },
  miscelanea: { label: 'Servicios',            icon: <Wrench className="w-7 h-7" />,     color: 'bg-amber-50',  accent: 'border-amber-500 text-amber-700' },
}

export default function CatalogoDashboardPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [userPrices, setUserPrices] = useState<Record<string, number>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError('No autenticado'); return }

        const { data: prods, error: pe } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .or(`owner_id.is.null,owner_id.eq.${user.id}`)
          .order('category').order('code')

        if (pe) { setError('Error al cargar catálogo'); return }

        const { data: prices } = await supabase
          .from('user_prices').select('product_id, price').eq('user_id', user.id)

        const pm: Record<string, number> = {}
        ;(prices ?? []).forEach((p: any) => { pm[p.product_id] = p.price })

        setProducts(prods ?? [])
        setUserPrices(pm)

        // Default to first main category available
        const firstMain = MAIN_CATEGORIES.find(c => (prods ?? []).some(p => p.category === c))
        setSelectedCategory(firstMain ?? (prods?.[0]?.category ?? null))
      } catch { setError('Error al cargar catálogo') }
      finally { setLoading(false) }
    }
    load()
  }, [supabase])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-600 font-bold">{error}</p>
    </div>
  )

  const categories = Array.from(new Set(products.map(p => p.category)))
  const mainCats = categories.filter(c => MAIN_CATEGORIES.includes(c))
  const otherCats = categories.filter(c => !MAIN_CATEGORIES.includes(c))

  const filteredProducts = selectedCategory ? products.filter(p => p.category === selectedCategory) : []
  // "Most quoted" = first 4 products in selected category
  const featured = filteredProducts.slice(0, 4)
  const rest = filteredProducts.slice(4)

  const meta = selectedCategory ? CATEGORY_META[selectedCategory] : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-6">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">Catálogo</h1>
        <p className="text-gray-500 text-sm mt-1">{products.length} productos disponibles</p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* ── Sidebar: category list (Luminio style) ── */}
        <aside className="md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-100 md:min-h-screen">
          {mainCats.length > 0 && (
            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 px-2">Productos</p>
              {mainCats.map(cat => {
                const m = CATEGORY_META[cat]
                const count = products.filter(p => p.category === cat).length
                const active = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all text-left ${
                      active
                        ? 'bg-orange-50 border-l-4 border-orange-500'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <span className={active ? 'text-orange-600' : 'text-gray-400'}>
                      {m?.icon ?? <Grid3x3 className="w-6 h-6" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${active ? 'text-orange-700' : 'text-gray-700'}`}>
                        {m?.label ?? cat}
                      </p>
                      <p className="text-xs text-gray-400">{count} modelos</p>
                    </div>
                    {active && <ChevronRight className="w-4 h-4 text-orange-500 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}

          {otherCats.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 px-2">Materiales</p>
              {otherCats.map(cat => {
                const m = CATEGORY_META[cat]
                const count = products.filter(p => p.category === cat).length
                const active = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all text-left ${
                      active
                        ? 'bg-orange-50 border-l-4 border-orange-500'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <span className={active ? 'text-orange-600' : 'text-gray-400'}>
                      {m?.icon ?? <Grid3x3 className="w-6 h-6" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${active ? 'text-orange-700' : 'text-gray-700'}`}>
                        {m?.label ?? cat}
                      </p>
                      <p className="text-xs text-gray-400">{count} items</p>
                    </div>
                    {active && <ChevronRight className="w-4 h-4 text-orange-500 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 p-4 md:p-8 space-y-8">
          {selectedCategory && filteredProducts.length > 0 && (
            <>
              {/* Section header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">
                  {meta?.label ?? selectedCategory}
                </h2>
                <span className="text-sm text-gray-400 font-medium">{filteredProducts.length} modelos</span>
              </div>

              {/* Featured / "Modelos Más Cotizados" */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-orange-500 rounded-full" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-700">Modelos Más Cotizados</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featured.map(product => <ProductCard key={product.id} product={product} price={userPrices[product.id] ?? product.base_price} />)}
                </div>
              </section>

              {/* Rest */}
              {rest.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-5 bg-gray-300 rounded-full" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-500">Modelos por Categoría</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {rest.map(product => <ProductCard key={product.id} product={product} price={userPrices[product.id] ?? product.base_price} />)}
                  </div>
                </section>
              )}
            </>
          )}

          {selectedCategory && filteredProducts.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <p className="text-gray-400 font-medium">No hay productos en esta categoría</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function ProductCard({ product, price }: { product: Product; price: number }) {
  const priceLabel = product.price_type === 'por_unidad'
    ? 'por unidad'
    : product.price_type === 'por_pie_lineal'
    ? 'por pie lineal'
    : 'por pie²'

  return (
    <Link
      href={`/dashboard/cotizaciones/nueva?modelo=${product.code}`}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all group"
    >
      {/* Product render */}
      <div className="relative bg-[#dce8f0] flex items-center justify-center h-48 overflow-hidden">
        <div className="w-full h-full p-3">
          <ProductVisual
            category={product.category}
            code={product.code}
            name={product.name}
            className="w-full h-full border-0 shadow-none bg-transparent rounded-none"
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs font-black text-orange-600 tracking-wide mb-0.5">{product.code}</p>
        <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-orange-700 transition-colors line-clamp-2">
          {product.name}
        </p>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-lg font-black text-gray-900">{formatUSD(price)}</p>
            <p className="text-xs text-gray-400">{priceLabel}</p>
          </div>
          <span className="text-xs font-bold text-orange-600 group-hover:gap-2 flex items-center gap-1 transition-all">
            Cotizar <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
