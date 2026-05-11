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
  const unit = UNIT_LABELS[product.price_type] ?? 'und'
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category
  const svgRender = renderByCode(product.code, product.category)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:border-orange-300 hover:shadow-md transition-all duration-200">
      {/* ── Imagen / Ilustración ── */}
      <div className="relative bg-[#eaf1f7] overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {svgRender}
        </div>
        {/* Badge de categoría */}
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black text-orange-500 uppercase tracking-wider border border-orange-100 shadow-sm">
          {categoryLabel}
        </span>
      </div>

      {/* ── Info ── */}
      <div className="p-3 flex flex-col flex-1">
        {product.code && (
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase leading-none mb-1">
            {product.code}
          </p>
        )}
        <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 flex-1 mb-2">
          {product.name}
        </p>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-base font-black text-gray-900 leading-none">
            {formatUSD(price)}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            / {unit}
          </span>
        </div>

        {/* CTA — 44px mínimo para touch */}
        <Link
          href={`/dashboard/cotizaciones/nueva?modelo=${product.code ?? ''}`}
          className="flex items-center justify-center gap-1.5 w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-black rounded-xl transition-all duration-150"
          aria-label={`Cotizar ${product.name}`}
        >
          Cotizar
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
