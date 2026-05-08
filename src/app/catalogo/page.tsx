'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Search } from 'lucide-react'
import { ProductVisual } from '@/components/product/ProductVisual'

const publicCategories = [
  {
    id: 'screens',
    label: 'Screens',
    description: 'Modelos principales para puertas de screen usadas por contratistas en Puerto Rico.',
    products: [
      { code: 'S001', name: 'Screen sencillo', category: 'screen', price: 'Precio configurable' },
      { code: 'S002', name: 'Screen doble', category: 'screen', price: 'Precio configurable' },
      { code: 'S009', name: 'Screen heavy', category: 'screen', price: 'Precio configurable' },
      { code: 'S015', name: 'Screen premium', category: 'screen', price: 'Precio configurable' },
    ],
  },
  {
    id: 'puertas',
    label: 'Puertas de Aluminio',
    description: 'Puertas de aluminio con cristal, melones, paneles sólidos y variaciones anchas.',
    products: [
      { code: 'G001', name: 'Vidrio completo', category: 'puerta', price: 'Precio configurable' },
      { code: 'G012', name: 'Vidrios divididos', category: 'puerta', price: 'Precio configurable' },
      { code: 'G012-V1', name: 'Vidrios divididos variante 1', category: 'puerta', price: 'Precio configurable' },
      { code: 'G060', name: 'Modelo premium', category: 'puerta', price: 'Precio configurable' },
    ],
  },
  {
    id: 'ventanas',
    label: 'Ventanas',
    description: 'Ventanas residenciales y comerciales con cristalería configurable.',
    products: [
      { code: 'C001', name: 'Ventana sencilla', category: 'ventana', price: 'Precio configurable' },
      { code: 'C010', name: 'Ventana con divisiones', category: 'ventana', price: 'Precio configurable' },
      { code: 'C013', name: 'Ventana melón', category: 'ventana', price: 'Precio configurable' },
      { code: 'C023', name: 'Ventana ancha', category: 'ventana', price: 'Precio configurable' },
    ],
  },
  {
    id: 'garajes',
    label: 'Puertas de Garaje',
    description: 'Modelos de garaje para fabricación, estimado y lista de materiales.',
    products: [
      { code: 'GD001', name: 'Garaje sencillo', category: 'garaje', price: 'Precio configurable' },
      { code: 'GD006', name: 'Garaje con paneles', category: 'garaje', price: 'Precio configurable' },
      { code: 'GD007', name: 'Garaje premium', category: 'garaje', price: 'Precio configurable' },
      { code: 'GD009', name: 'Garaje comercial', category: 'garaje', price: 'Precio configurable' },
    ],
  },
  {
    id: 'closets',
    label: 'Puertas de Closet',
    description: 'Puertas de closet en aluminio con diseño limpio y medidas personalizadas.',
    products: [
      { code: 'CD001', name: 'Closet sencillo', category: 'closet', price: 'Precio configurable' },
      { code: 'CD006', name: 'Closet doble', category: 'closet', price: 'Precio configurable' },
      { code: 'CD007', name: 'Closet con paneles', category: 'closet', price: 'Precio configurable' },
      { code: 'CD009', name: 'Closet premium', category: 'closet', price: 'Precio configurable' },
    ],
  },
]

export default function CatalogoPublicoPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-base font-black text-white">C</div>
            <span className="text-lg font-black text-slate-950">CotizaYa</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/buscar" className="hidden text-sm font-bold text-slate-600 hover:text-slate-950 sm:inline-flex">Buscar fabricantes</Link>
            <Link href="/login" className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-orange-700">Entrar</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-black text-orange-700">
              <Search className="h-4 w-4" /> Catálogo público de modelos
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Modelos visuales para puertas, ventanas y screens en Puerto Rico
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-600">
              CotizaYa muestra modelos por categoría, permite que cada fabricante configure sus propios precios y genera cotizaciones con hoja de compra lista para fabricación. El catálogo público es una muestra técnica; el valor real ocurre cuando el contratista carga sus precios y medidas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700">
                Crear cotización real <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/buscar" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-black text-slate-900 transition hover:border-slate-400">
                Ver fabricantes públicos
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60">
            <ProductVisual category="puerta" code="G001" name="Puerta de vidrio completo" className="h-80" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-12 px-4 pb-20 sm:px-6 lg:px-8">
        {publicCategories.map((category) => (
          <div key={category.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">{category.label}</h2>
                <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-slate-600">{category.description}</p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-black text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Diagramas técnicos
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {category.products.map((product) => (
                <article key={product.code} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg">
                  <div className="bg-white p-3">
                    <ProductVisual category={product.category} code={product.code} name={product.name} className="h-48" />
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-sm font-black text-orange-600">{product.code}</p>
                    <h3 className="text-base font-black text-slate-950">{product.name}</h3>
                    <p className="text-xs font-bold text-slate-500">{product.price}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
