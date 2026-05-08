'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, MapPin, Phone, Mail, Loader2, ChevronRight } from 'lucide-react'

interface Fabricante {
  id: string
  business_name: string
  username: string
  city: string
  description: string
  phone: string
  email: string
  avatar_url: string
}

const PUERTO_RICO_CITIES = [
  'San Juan', 'Bayamón', 'Carolina', 'Caguas', 'Ponce', 'Mayagüez',
  'Arecibo', 'Guaynabo', 'Toa Baja', 'Humacao', 'Aguadilla', 'Yauco',
  'Vega Baja', 'Salinas', 'Juana Díaz', 'Fajardo', 'Ceiba', 'Luquillo',
]

export default function BuscadorPage() {
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('search_public_fabricantes', {
        p_search: searchQuery,
        p_city: cityFilter,
      })

      if (rpcError) {
        console.error('Error en búsqueda:', rpcError)
        setError('Error al buscar fabricantes')
        setFabricantes([])
      } else {
        setFabricantes(data || [])
        if (!data || data.length === 0) {
          setError('No se encontraron fabricantes con esos criterios')
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error inesperado al buscar')
      setFabricantes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="font-black text-lg text-gray-900">CotizaYa</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-12 border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Buscar Fabricantes
          </h1>
          <p className="text-gray-600 text-lg">
            Encuentra fabricantes de puertas y ventanas en Puerto Rico
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-8 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                />
              </div>

              {/* City Select */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              >
                <option value="">Todas las ciudades</option>
                {PUERTO_RICO_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {!searched ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-medium">Usa el formulario arriba para buscar fabricantes</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
            </div>
          ) : fabricantes.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No se encontraron fabricantes</p>
              <p className="text-gray-500 text-sm mt-1">Intenta con otros términos de búsqueda o ciudad</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fabricantes.map(fabricante => (
                <Link
                  key={fabricante.id}
                  href={`/p/${fabricante.username}`}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-lg transition-all group"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-2xl mb-4 flex-shrink-0">
                    {fabricante.business_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {fabricante.business_name}
                  </h3>

                  {/* Description */}
                  {fabricante.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {fabricante.description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {fabricante.city && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <span>{fabricante.city}, PR</span>
                      </div>
                    )}

                    {fabricante.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <a href={`tel:${fabricante.phone}`} className="hover:text-orange-600 transition-colors truncate">
                          {fabricante.phone}
                        </a>
                      </div>
                    )}

                    {fabricante.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <a href={`mailto:${fabricante.email}`} className="hover:text-orange-600 transition-colors truncate text-xs">
                          {fabricante.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-orange-600 font-bold text-sm group-hover:gap-3 transition-all">
                    Ver Catálogo
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
