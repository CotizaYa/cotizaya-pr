'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Grid3x3, Loader2 } from 'lucide-react'
import { formatUSD } from '@/lib/calculations'
import Image from 'next/image'

interface Product {
  id: string
  code: string | null
  name: string
  category: string
  price_type: string
  base_price: number
  unit_label: string | null
}

const CATEGORY_ICONS: Record<string, any> = {
  screen: <Grid3x3 className="w-6 h-6" />,
  puerta: <Grid3x3 className="w-6 h-6" />,
  ventana: <Grid3x3 className="w-6 h-6" />,
  closet: <Grid3x3 className="w-6 h-6" />,
  garaje: <Grid3x3 className="w-6 h-6" />,
  screen_ac: <Grid3x3 className="w-6 h-6" />,
  miscelanea: <Grid3x3 className="w-6 h-6" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  screen: 'from-teal-500 to-teal-600',
  puerta: 'from-blue-500 to-blue-600',
  ventana: 'from-green-500 to-green-600',
  closet: 'from-purple-500 to-purple-600',
  garaje: 'from-orange-500 to-orange-600',
  screen_ac: 'from-cyan-500 to-cyan-600',
  miscelanea: 'from-gray-500 to-gray-600',
}

const CATEGORY_LABELS: Record<string, string> = {
  screen: 'Screens',
  puerta: 'Puertas de Aluminio',
  ventana: 'Ventanas',
  closet: 'Puertas de Closet',
  garaje: 'Puertas de Garaje',
  screen_ac: 'Screens A/C',
  miscelanea: 'Servicios',
}

export default function CatalogoDashboardPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [userPrices, setUserPrices] = useState<Record<string, number>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('No autenticado')
          return
        }

        // Cargar productos del fabricante + globales
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .or(`owner_id.is.null,owner_id.eq.${user.id}`)
          .order('category')
          .order('code')

        if (productsError) {
          console.error('Error cargando productos:', productsError)
          setError('Error al cargar catálogo')
          return
        }

        // Cargar precios personalizados
        const { data: pricesData } = await supabase
          .from('user_prices')
          .select('product_id, price')
          .eq('user_id', user.id)

        const pricesMap: Record<string, number> = {}
        ;(pricesData ?? []).forEach((p: any) => {
          pricesMap[p.product_id] = p.price
        })

        setProducts(productsData ?? [])
        setUserPrices(pricesMap)
        
        // Establecer primera categoría
        if (productsData && productsData.length > 0) {
          const firstCategory = productsData[0].category
          setSelectedCategory(firstCategory)
        }
      } catch (err) {
        console.error('Error en loadData:', err)
        setError('Error al cargar catálogo')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      </div>
    )
  }

  // Agrupar productos por categoría
  const categories = Array.from(new Set(products.map(p => p.category)))
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : []

  if (!loading && products.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-center space-y-8">
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[40px] p-12 md:p-20">
          <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Grid3x3 className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">Tu catálogo está vacío</h2>
          <p className="text-gray-600 font-medium mt-4 max-w-md mx-auto">
            Para empezar a cotizar, primero debes agregar tus productos y modelos en la sección de Inventario.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-10">
            <Link 
              href="/dashboard/mis-productos"
              className="w-full md:w-auto px-8 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
            >
              Configurar Mis Productos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Catálogo de Productos</h1>
          <p className="text-gray-600 font-medium mt-1">{products.length} productos disponibles</p>
        </div>
        <Link 
          href="/dashboard/mis-productos"
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
        >
          Gestionar Inventario
        </Link>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map(category => {
          const categoryProducts = products.filter(p => p.category === category)
          const isSelected = selectedCategory === category
          const bgGradient = CATEGORY_COLORS[category] || 'from-gray-500 to-gray-600'
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? `border-orange-600 bg-gradient-to-br ${bgGradient} text-white shadow-lg`
                  : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                  {CATEGORY_ICONS[category] || <Grid3x3 className="w-6 h-6" />}
                </div>
              </div>
              <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {CATEGORY_LABELS[category] || category}
              </p>
              <p className={`text-xs ${isSelected ? 'text-orange-100' : 'text-gray-500'}`}>
                {categoryProducts.length} modelos
              </p>
            </button>
          )
        })}
      </div>

      {/* Products Grid */}
      {selectedCategory && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900">
            {CATEGORY_LABELS[selectedCategory] || selectedCategory}
          </h2>
          
          {filteredProducts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600 font-medium">No hay productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const price = userPrices[product.id] ?? product.base_price
                const priceLabel = product.price_type === 'por_unidad' ? 'por unidad' : `por ${product.unit_label || 'unidad'}`
                
                return (
                  <Link
                    key={product.id}
                    href={`/dashboard/cotizaciones/nueva?modelo=${product.code}`}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all group"
                  >
                    <div className="mb-4">
                      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                        {product.code && ['G001', 'G012', 'M001', 'S001', 'C001'].includes(product.code) ? (
                          <Image
                            src={`/models/${product.code}.png`}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <Grid3x3 className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                            {product.code}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">{product.name}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-2">
                        <p className="text-lg font-black text-orange-600">
                          {formatUSD(price)}
                        </p>
                        <p className="text-xs text-gray-500">{priceLabel}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-orange-600 font-bold text-sm group-hover:gap-3 transition-all">
                      Cotizar
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
