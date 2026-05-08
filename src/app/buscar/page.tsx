'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, MapPin, Phone, Mail, Loader2, ChevronRight, Building2 } from 'lucide-react'

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

export default function BuscarFabricantesPublicoPage() {
  const supabase = useMemo(() => createClient(), [])
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
        console.error('Error en búsqueda pública de fabricantes:', rpcError)
        setError('No se pudo consultar el directorio en este momento. Intenta de nuevo o vuelve al catálogo público.')
        setFabricantes([])
        return
      }

      setFabricantes(data || [])
      if (!data || data.length === 0) {
        setError('No se encontraron fabricantes publicados con esos criterios.')
      }
    } catch (err) {
      console.error('Error inesperado en búsqueda pública:', err)
      setError('No se pudo consultar el directorio en este momento. Intenta de nuevo o vuelve al catálogo público.')
      setFabricantes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-base font-black text-white">C</div>
            <span className="text-lg font-black text-slate-950">CotizaYa</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/catalogo" className="hidden text-sm font-bold text-slate-600 hover:text-slate-950 sm:inline-flex">Catálogo</Link>
            <Link href="/login" className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-orange-700">Entrar</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-black text-orange-700">
              <Building2 className="h-4 w-4" /> Directorio público
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Fabricantes publicados en Puerto Rico
            </h1>
            <p className="mt-4 text-lg font-medium leading-8 text-slate-600">
              Busca contratistas y talleres que publican su perfil y catálogo en CotizaYa. Esta página es pública, no requiere iniciar sesión y solo debe mostrar perfiles reales publicados por sus dueños.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_260px_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por negocio, especialidad o descripción"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            >
              <option value="">Todas las ciudades</option>
              {PUERTO_RICO_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-7 py-4 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              Buscar
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
            {error}
          </div>
        )}

        {!searched ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-black text-slate-950">Directorio conectado a perfiles reales</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">Cuando un fabricante publique su perfil en CotizaYa, aparecerá aquí con ciudad, contacto y enlace a su catálogo público. No usamos fabricantes inventados para llenar espacio.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-700">
                Publicar mi negocio
              </Link>
              <Link href="/catalogo" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-900 transition hover:border-slate-400">
                Ver catálogo técnico
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
          </div>
        ) : fabricantes.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-black text-slate-950">No hay fabricantes para esos filtros</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">Prueba otra ciudad, vuelve al catálogo técnico o publica tu negocio para que futuros clientes encuentren tu perfil cuando la cuenta esté configurada.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/catalogo" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-900 transition hover:border-slate-400">
                Ver catálogo técnico
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-700">
                Publicar mi negocio
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fabricantes.map((fabricante) => (
              <Link
                key={fabricante.id}
                href={`/p/${fabricante.username}`}
                className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white">
                  {fabricante.business_name.charAt(0).toUpperCase()}
                </div>

                <h2 className="line-clamp-1 text-xl font-black text-slate-950 group-hover:text-orange-600">{fabricante.business_name}</h2>
                {fabricante.description && <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{fabricante.description}</p>}

                <div className="mt-5 space-y-2 text-sm font-semibold text-slate-700">
                  {fabricante.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      <span>{fabricante.city}, PR</span>
                    </div>
                  )}
                  {fabricante.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-orange-600" />
                      <span className="truncate">{fabricante.phone}</span>
                    </div>
                  )}
                  {fabricante.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-orange-600" />
                      <span className="truncate">{fabricante.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-black text-orange-600 transition group-hover:gap-3">
                  Ver catálogo del fabricante <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
