'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Phone, Mail, MapPin, Loader2, ChevronRight } from 'lucide-react'
import { formatUSD } from '@/lib/calculations'
import { ProductVisual } from '@/components/product/ProductVisual'

interface Product {
  id: string
  code: string
  name: string
  category: string
  price_type: string
  base_price: number
  unit_label: string
}

interface PublicProfile {
  id: string
  business_name: string
  phone: string
  email: string
  username: string
  city: string
  description: string
  avatar_url: string
  products: Product[]
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

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const supabase = useMemo(() => createClient(), [])

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.rpc('get_public_profile', {
          p_username: username,
        })

        if (error || !data) {
          console.error('Error cargando perfil:', error)
          setNotFound(true)
          return
        }

        setProfile(data)
        
        // Establecer primera categoría
        if (data.products && data.products.length > 0) {
          const firstCategory = data.products[0].category
          setSelectedCategory(firstCategory)
        }
      } catch (err) {
        console.error('Error:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      loadProfile()
    }
  }, [username, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Fabricante no encontrado</h1>
          <p className="text-gray-600 mb-6">El perfil de {username} no está disponible o es privado.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all">
            Volver a Inicio
          </Link>
        </div>
      </div>
    )
  }

  // Agrupar productos por categoría
  const categories = Array.from(new Set(profile.products?.map(p => p.category) || []))
  const filteredProducts = selectedCategory
    ? profile.products?.filter(p => p.category === selectedCategory) || []
    : []

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="font-black text-lg text-gray-900">CotizaYa</span>
          </Link>
        </div>
      </header>

      {/* Profile Hero */}
      <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-12 border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl flex-shrink-0">
              {profile.business_name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                {profile.business_name}
              </h1>
              
              <div className="flex flex-col gap-3 mb-6">
                {profile.city && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <span className="font-medium">{profile.city}, Puerto Rico</span>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <a href={`tel:${profile.phone}`} className="font-medium hover:text-orange-600 transition-colors">
                      {profile.phone}
                    </a>
                  </div>
                )}
                
                {profile.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <a href={`mailto:${profile.email}`} className="font-medium hover:text-orange-600 transition-colors">
                      {profile.email}
                    </a>
                  </div>
                )}
              </div>

              {profile.description && (
                <p className="text-gray-700 leading-relaxed max-w-2xl">
                  {profile.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Catálogo de Productos</h2>

          {!profile.products || profile.products.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600 font-medium">Este fabricante aún no tiene productos publicados</p>
            </div>
          ) : (
            <>
              {/* Categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {categories.map(category => {
                  const categoryProducts = profile.products.filter(p => p.category === category)
                  const isSelected = selectedCategory === category
                  
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <p className={`font-bold text-sm ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}>
                        {CATEGORY_LABELS[category] || category}
                      </p>
                      <p className={`text-xs ${isSelected ? 'text-orange-500' : 'text-gray-500'}`}>
                        {categoryProducts.length} modelos
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Products Grid */}
              {selectedCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => {
                    const priceLabel = product.price_type === 'por_unidad' ? 'por unidad' : `por ${product.unit_label || 'unidad'}`
                    
                    return (
                      <Link
                        key={product.id}
                        href={`/dashboard/cotizaciones/nueva?modelo=${product.code}&fabricante=${profile.username}`}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all group"
                      >
                        <div className="mb-4">
                          <ProductVisual category={product.category} code={product.code} name={product.name} className="h-40 mb-3" />
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="font-black text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                              {product.code}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">{product.name}</p>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-2">
                            <p className="text-lg font-black text-orange-600">
                              {formatUSD(product.base_price)}
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
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-50 border-t border-orange-200 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-4">¿Necesitas cotizar?</h2>
          <p className="text-gray-600 mb-6">Crea una cuenta en CotizaYa y comienza a cotizar con este fabricante</p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
          >
            Iniciar Sesión
          </Link>
        </div>
      </section>
    </div>
  )
}
