'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, X, Loader2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

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

const statusConfig = {
  scheduled: { label: 'Programado', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'En Proceso', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: X },
}

export default function CalendarioPage() {
  const supabase = createClientComponentClient()
  const [events, setEvents] = useState<ProductionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('production_events')
        .select('*')
        .eq('owner_id', user.id)
        .order('start_date', { ascending: true })

      setEvents(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
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
        await loadEvents()
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function updateStatus(id: string, newStatus: ProductionEvent['status']) {
    const { error } = await supabase
      .from('production_events')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) loadEvents()
  }

  async function deleteEvent(id: string) {
    if (!confirm('¿Eliminar este evento?')) return
    const { error } = await supabase
      .from('production_events')
      .delete()
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendario de Producción</h1>
          <p className="text-gray-500 font-medium mt-1">Gestiona instalaciones y fabricación en el taller.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
        >
          {showForm ? (
            <>
              <X className="w-5 h-5" />
              Cerrar
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Nuevo Evento
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-100 shadow-lg space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                Título del Trabajo *
              </label>
              <input
                required
                placeholder="Ej: Instalación Res. Los Pinos"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                Cliente *
              </label>
              <input
                required
                placeholder="Nombre del cliente"
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                Fecha Inicio *
              </label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                Fecha Fin *
              </label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
              Notas / Detalles
            </label>
            <textarea
              placeholder="Detalles adicionales del proyecto..."
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar en Calendario'
            )}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : Object.keys(groupedEvents).length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No hay eventos programados</h3>
          <p className="text-gray-500 mt-1">Organiza tu taller y tus instalaciones aquí.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <div key={month} className="space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{month}</h2>
              <div className="space-y-3">
                {monthEvents.map((event) => {
                  const cfg = statusConfig[event.status]
                  const StatusIcon = cfg.icon
                  return (
                    <div key={event.id} className="bg-white rounded-lg p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(event.start_date + 'T00:00:00').toLocaleDateString('es-PR', { weekday: 'short', day: 'numeric' })}
                              {event.start_date !== event.end_date && ` - ${new Date(event.end_date + 'T00:00:00').toLocaleDateString('es-PR', { day: 'numeric' })}`}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{event.client_name}</p>
                          {event.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded italic">{event.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {event.status === 'scheduled' && (
                            <button
                              onClick={() => updateStatus(event.id, 'in_progress')}
                              className="px-4 py-2 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-100 transition-colors"
                            >
                              Iniciar
                            </button>
                          )}
                          {event.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(event.id, 'completed')}
                              className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                            >
                              Completar
                            </button>
                          )}
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
