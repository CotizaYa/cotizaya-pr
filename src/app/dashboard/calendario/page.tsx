'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ProductionEvent {
  id: string
  title: string
  client_name: string
  start_date: string
  end_date: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes: string | null
  color?: string
}

const statusColor = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabel = {
  scheduled: 'Programado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export default function CalendarioPage() {
  const supabase = createClientComponentClient()
  const [events, setEvents] = useState<ProductionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    client_name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    status: 'scheduled' as const,
    notes: '',
  })

  async function loadEvents() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('production_events')
      .select('*')
      .eq('owner_id', user.id)
      .order('start_date', { ascending: true })

    setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('production_events')
      .insert([{ ...form, owner_id: user.id }])

    if (!error) {
      setForm({
        title: '',
        client_name: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        status: 'scheduled',
        notes: '',
      })
      setShowForm(false)
      loadEvents()
    }
  }

  async function updateStatus(id: string, newStatus: ProductionEvent['status']) {
    const { error } = await supabase
      .from('production_events')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) loadEvents()
  }

  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.start_date + 'T00:00:00')
    const month = date.toLocaleString('es-PR', { month: 'long', year: 'numeric' })
    if (!acc[month]) acc[month] = []
    acc[month].push(event)
    return acc
  }, {} as Record<string, ProductionEvent[]>)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Calendario de Producción</h1>
          <p className="text-gray-500 font-medium">Gestiona instalaciones y fabricación en el taller.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#F97316] text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-2"
        >
          {showForm ? 'Cerrar' : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo Evento
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-orange-100 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Título del Trabajo</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 font-medium"
                placeholder="Ej: Instalación Res. Los Pinos"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Cliente</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 font-medium"
                placeholder="Nombre del cliente"
                value={form.client_name}
                onChange={e => setForm({ ...form, client_name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Fecha Inicio</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 font-medium"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Fecha Fin</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 font-medium"
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Notas / Detalles</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 font-medium"
              placeholder="Detalles adicionales del proyecto..."
              rows={2}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-colors shadow-lg">
            Guardar en Calendario
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : Object.keys(groupedEvents).length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
          <p className="text-6xl mb-4">🗓️</p>
          <h3 className="text-xl font-bold text-gray-900">No hay eventos programados</h3>
          <p className="text-gray-500 mt-2">Organiza tu taller y tus instalaciones aquí.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div key={month} className="space-y-4">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{month}</h2>
              <div className="grid gap-4">
                {monthEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${statusColor[event.status]}`}>
                          {statusLabel[event.status]}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {new Date(event.start_date + 'T00:00:00').toLocaleDateString('es-PR', { weekday: 'short', day: 'numeric' })}
                          {event.start_date !== event.end_date && ` - ${new Date(event.end_date + 'T00:00:00').toLocaleDateString('es-PR', { day: 'numeric' })}`}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                        <span className="text-orange-500">👤</span> {event.client_name}
                      </p>
                      {event.notes && <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded-lg italic">{event.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                      {event.status !== 'completed' && (
                        <button
                          onClick={() => updateStatus(event.id, 'completed')}
                          className="flex-1 md:flex-none px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-xl hover:bg-green-100 transition-colors"
                        >
                          Completar
                        </button>
                      )}
                      {event.status === 'scheduled' && (
                        <button
                          onClick={() => updateStatus(event.id, 'in_progress')}
                          className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          Iniciar
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (confirm('¿Eliminar este evento?')) {
                            await supabase.from('production_events').delete().eq('id', event.id)
                            loadEvents()
                          }
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
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
