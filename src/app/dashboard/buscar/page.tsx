'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, MapPin, Phone, User, Loader2, ArrowRight } from 'lucide-react'

interface Fabricante {
  id: string
  business_name: string
  full_name: string
  avatar_url: string
  business_address: string
  phone: string
}

export default function BuscarFabricantesPage() {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Fabricante[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query) return
    setLoading(true)

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, business_name, full_name, avatar_url, business_address, phone')
        .or(`business_name.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20)

      setResults(data || [])
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
            className="absolute right-2 top-2 bottom-2 bg-orange-600 text-white px-6 rounded-lg font-bold hover:bg-orange-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : results.length > 0 ? (
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
                <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-orange-500" /> {fab.business_address || 'Puerto Rico'}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <a
                    href={`tel:${fab.phone}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-3 h-3" />
                    Llamar
                  </a>
                  <button className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors flex items-center gap-2">
                    Ver Perfil
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : query && !loading ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No encontramos resultados</h3>
          <p className="text-gray-500 mt-1">Intenta con otros términos de búsqueda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Pueblos Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['San Juan', 'Bayamón', 'Carolina', 'Ponce', 'Caguas', 'Guaynabo', 'Mayagüez', 'Trujillo Alto'].map(pueblo => (
              <button
                key={pueblo}
                onClick={() => setQuery(pueblo)}
                className="bg-white p-4 rounded-xl border border-gray-100 text-center font-bold text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm"
              >
                {pueblo}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-2xl text-white text-center shadow-xl">
        <h3 className="text-2xl font-bold mb-2">¿Eres fabricante?</h3>
        <p className="text-orange-100 mb-6 max-w-xl mx-auto font-medium">Únete a la red más grande de fabricantes en Puerto Rico y recibe prospectos directamente en tu dashboard.</p>
        <button className="bg-white text-orange-600 font-bold px-10 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg active:scale-95">
          Publicar mi Taller
        </button>
      </div>
    </div>
  )
}
