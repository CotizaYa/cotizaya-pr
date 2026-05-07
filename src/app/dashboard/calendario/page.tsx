'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ProductionEvent {
  id: string
  title: string
  start_date: string
  end_date: string
  status: string
  client_name: string
  notes: string | null
}

const statusColor: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
}

const statusLabel: Record<string, string> = {
  scheduled: 'Programado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export default function CalendarioPage() {
  const [events, setEvents] = useState<ProductionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    client_name: '',
    start_date: '',
    end_date: '',
    status: 'scheduled',
    notes: '',
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    const { data } = await supabase
      .from('production_events')
      .select('*')
      .order('start_date', { ascending: true })
    setEvents(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('production_events').insert({
      ...form,
      user_id: user.id,
    })
    setForm({ title: '', client_name: '', start_date: '', end_date: '', status: 'scheduled', notes: '' })
    setShowForm(false)
    loadEvents()
  }

  // Agrupar por mes
  const grouped = events.reduce((acc, event) => {
    const month = new Date(event.start_date).toLocaleDateString('es-PR', { month: 'long', year: 'numeric' })
    if (!acc[month]) acc[month] = []
    acc[month].push(event)
    return acc
  }, {} as Record<string, ProductionEvent[]>)

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Producción</h1>
          <p className="text-sm text-gray-500">Planifica y rastrea tus órdenes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Nuevo Evento
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6 space-y-3">
          <h2 className="font-semibold text-gray-800 mb-2">Nuevo Evento de Producción</h2>
          <input
            required
            placeholder="Título (ej: Ventanas Residencia García)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            required
            placeholder="Nombre del cliente"
            value={form.client_name}
            onChange={e => setForm({ ...form, client_name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha inicio</label>
              <input
                required
                type="date"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha fin</label>
              <input
                required
                type="date"
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="scheduled">Programado</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <textarea
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Guardar
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista agrupada por mes */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🗓️</p>
          <p className="text-gray-500 font-medium">No tienes eventos programados</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold"
          >
            Crear primer evento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 capitalize">
                {month}
              </h2>
              <div className="space-y-3">
                {monthEvents.map(event => (
                  <div
                    key={event.id}
                    className={`border rounded-2xl p-4 ${statusColor[event.status] || 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{event.title}</p>
                        <p className="text-xs opacity-70 mt-0.5">{event.client_name}</p>
                        {event.notes && (
                          <p className="text-xs opacity-60 mt-1">{event.notes}</p>
                        )}
                      </div>
                      <div className="text-right text-xs opacity-70 shrink-0 ml-3">
                        <p>{new Date(event.start_date).toLocaleDateString('es-PR')}</p>
                        <p>→ {new Date(event.end_date).toLocaleDateString('es-PR')}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white bg-opacity-60">
                        {statusLabel[event.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}