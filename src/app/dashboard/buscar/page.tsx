'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Fabricante {
  id: string
  business_name: string
  full_name: string
  avatar_url: string
  business_address: string
  phone: string
}

export default function BuscarFabricantesPage() {
  const supabase = createClientComponentClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Fabricante[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query) return
    setLoading(true)

    const { data } = await supabase
      .from('profiles')
      .select('id, business_name, full_name, avatar_url, business_address, phone')
      .or(`business_name.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)

    setResults(data || [])
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight uppercase">Directorio de Fabricantes</h1>
        <p className="text-gray-500 font-medium text-lg">Encuentra los mejores talleres de puertas y ventanas en Puerto Rico.</p>
        
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            className="w-full px-8 py-5 rounded-3xl border-2 border-gray-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 shadow-xl outline-none text-lg font-medium transition-all"
            placeholder="Busca por nombre o pueblo..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 top-3 bottom-3 bg-[#F97316] text-white px-8 rounded-2xl font-black hover:bg-orange-600 transition-all active:scale-95"
          >
            Buscar
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((fab) => (
            <div key={fab.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex items-center gap-6 group">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-orange-600 text-3xl font-black overflow-hidden">
                {fab.avatar_url ? (
                  <img src={fab.avatar_url} alt={fab.business_name} className="w-full h-full object-cover" />
                ) : (
                  (fab.business_name || fab.full_name || 'F').charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-gray-900 truncate">{fab.business_name || fab.full_name}</h3>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                  <span className="text-orange-500"></span> {fab.business_address || 'Puerto Rico'}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <a
                    href={`tel:${fab.phone}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-gray-200 transition-colors"
                  >
                    Llamar
                  </a>
                  <button className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-orange-100 transition-colors">
                    Ver Perfil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : query && !loading ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-5xl mb-4"></p>
          <h3 className="text-xl font-bold text-gray-900">No encontramos resultados</h3>
          <p className="text-gray-500 mt-2">Intenta con otros términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['San Juan', 'Bayamón', 'Carolina', 'Ponce', 'Caguas', 'Guaynabo', 'Mayagüez', 'Trujillo Alto'].map(pueblo => (
            <button
              key={pueblo}
              onClick={() => {
                setQuery(pueblo)
                // Trigger search manually since it's a demo
              }}
              className="bg-white p-4 rounded-2xl border border-gray-100 text-center font-bold text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-all"
            >
              {pueblo}
            </button>
          ))}
        </div>
      )}
      
      <div className="bg-orange-500 p-8 rounded-3xl text-white text-center">
        <h3 className="text-2xl font-black mb-2">¿Eres fabricante?</h3>
        <p className="text-orange-100 mb-6 max-w-xl mx-auto font-medium">Únete a la red más grande de fabricantes en Puerto Rico y recibe prospectos directamente en tu dashboard.</p>
        <button className="bg-white text-orange-600 font-black px-10 py-4 rounded-2xl hover:bg-orange-50 transition-all shadow-xl active:scale-95">
          Publicar mi Taller
        </button>
      </div>
    </div>
  )
}
