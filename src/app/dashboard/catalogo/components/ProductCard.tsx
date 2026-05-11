// src/app/dashboard/catalogo/components/ProductCard.tsx
import Link from 'next/link'
import { renderByCode } from '@/components/product/ProductVisual'
import { formatUSD } from '@/lib/calculations'

export interface Product {
  id: string
  code: string | null
  name: string
  category: string
  price_type: string
  base_price: number
}

const UNIT_LABELS: Record<string, string> = {
  por_unidad:       'und',
  por_pie_lineal:   'pie lineal',
  por_pie_cuadrado: 'pie²',
}

const CATEGORY_LABELS: Record<string, string> = {
  screen:      'Screen',
  puerta:      'Puerta',
  ventana:     'Ventana',
  closet:      'Closet',
  aluminio:    'Aluminio',
  cristal:     'Cristal',
  tornilleria: 'Tornillería',
  miscelanea:  'Servicio',
}

interface ProductCardProps {
  product: Product
  price: number
}

export function ProductCard({ product, price }: ProductCardProps) {
  const unit          = UNIT_LABELS[product.price_type] ?? 'und'
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category
  const svgRender     = renderByCode(product.code, product.category)

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      {/* Thumbnail — altura fija y compacta */}
      <div
        className="relative bg-[#eaf1f7] overflow-hidden"
        style={{ height: '120px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-1.5">
          {svgRender}
        </div>
        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white/90 rounded-full text-[8px] font-black text-orange-500 uppercase tracking-wide border border-orange-100">
          {categoryLabel}
        </span>
      </div>

      {/* Info */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col flex-1">
        {product.code && (
          <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase leading-none mb-1">
            {product.code}
          </p>
        )}
        <p className="text-xs font-bold text-gray-900 leading-tight line-clamp-2 flex-1 mb-1.5">
          {product.name}
        </p>
        <p className="text-sm font-black text-gray-900 leading-none mb-2.5">
          {formatUSD(price)}
          <span className="text-[9px] font-medium text-gray-400 ml-1">/ {unit}</span>
        </p>

        {/* CTA — 44px mínimo de alto para touch */}
        <Link
          href={`/dashboard/cotizaciones/nueva?modelo=${product.code ?? ''}`}
          className="flex items-center justify-center gap-1 w-full bg-orange-500 active:bg-orange-600 active:scale-95 text-white text-xs font-black rounded-xl transition-all"
          style={{ minHeight: '40px' }}
          aria-label={`Cotizar ${product.name}`}
        >
          Cotizar
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}
