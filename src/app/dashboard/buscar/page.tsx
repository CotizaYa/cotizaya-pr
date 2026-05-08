'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, MapPin, Phone, User, Loader2, ArrowRight } from 'lucide-react'

interface Fabricante {
  id: string
  business_name: string
  full_name: string
  avatar_url: string | null
  business_address: string | null
  phone: string | null
}

export default function BuscarFabricantesPage() {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Fabricante[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) {
      setError('Por favor ingresa un término de búsqueda')
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const searchTerm = `%${query.trim()}%`

      // Buscar en business_name y full_name
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, business_name, full_name, avatar_url, business_address, phone')
        .or(`business_name.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
        .limit(20)

      if (queryError) {
        console.error('Error en búsqueda:', queryError)
        setError('Error al buscar fabricantes')
        setResults([])
        return
      }

      setResults(data || [])
      if (!data || data.length === 0) {
        setError('No se encontraron fabricantes con ese término')
      }
    } catch (err) {
      console.error('Error en handleSearch:', err)
      setError('Error inesperado al buscar')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 pb-24">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Directorio de Fabricantes</h1>
        <p className="text-gray-500 font-medium text-lg">Encuentra los mejores talleres de puertas y ventanas en Puerto Rico.</p>
        
        <form onSubmit={handleSearch} className="relative mt-8">
          <input
            type="text"
            className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 shadow-sm outline-none text-lg font-medium transition-all pr-32"
            placeholder="Busca por nombre o pueblo..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-orange-600 text-white px-6 rounded-lg font-bold hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : searched && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((fab) => (
            <div key={fab.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-6 group">
              <div className="w-20 h-20 bg-orange-100 rounded-xl flex-shrink-0 flex items-center justify-center text-orange-600 text-2xl font-bold overflow-hidden">
                {fab.avatar_url ? (
                  <img src={fab.avatar_url} alt={fab.business_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 truncate">{fab.business_name || fab.full_name}</h3>
                <p className="text-sm text-gray-500 mt-1">{fab.full_name}</p>
                
                {fab.phone && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <a href={`tel:${fab.phone}`} className="hover:text-orange-600 transition-colors">
                      {fab.phone}
                    </a>
                  </div>
                )}
                
                {fab.business_address && (
                  <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{fab.business_address}</span>
                  </div>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-600 transition-colors flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No se encontraron resultados</p>
          <p className="text-gray-400 text-sm mt-1">Intenta con otro término de búsqueda</p>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Busca fabricantes en Puerto Rico</p>
          <p className="text-gray-400 text-sm mt-1">Ingresa un nombre o pueblo para comenzar</p>
        </div>
      )}
    </div>
  )
}
