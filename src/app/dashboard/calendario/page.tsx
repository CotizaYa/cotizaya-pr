'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()
  const [events, setEvents] = useState<ProductionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('No autenticado')
        return
      }

      const { data, error: queryError } = await supabase
        .from('production_events')
        .select('*')
        .eq('owner_id', user.id)
        .order('start_date', { ascending: true })

      if (queryError) {
        console.error('Error cargando eventos:', queryError)
        setError('Error al cargar eventos')
        return
      }

      setEvents(data || [])
    } catch (err) {
      console.error('Error en loadEvents:', err)
      setError('Error al cargar eventos')
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
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('No autenticado')
        setSubmitting(false)
        return
      }

      // Validar que los campos requeridos estén completos
      if (!form.title.trim() || !form.client_name.trim()) {
        setError('Por favor completa todos los campos requeridos')
        setSubmitting(false)
        return
      }

      const { error: insertError } = await supabase
        .from('production_events')
        .insert([{
          owner_id: user.id,
          title: form.title.trim(),
          client_name: form.client_name.trim(),
          start_date: form.start_date,
          end_date: form.end_date,
          status: form.status,
          notes: form.notes.trim() || null,
        }])

      if (insertError) {
        console.error('Error al insertar evento:', insertError)
        setError(`Error al guardar evento: ${insertError.message}`)
        setSubmitting(false)
        return
      }

      // Resetear formulario y recargar eventos
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
    } catch (err) {
      console.error('Error en handleSubmit:', err)
      setError('Error inesperado al guardar evento')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateStatus(id: string, newStatus: ProductionEvent['status']) {
    try {
      const { error } = await supabase
        .from('production_events')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) {
        console.error('Error al actualizar estado:', error)
        setError('Error al actualizar estado')
        return
      }

      await loadEvents()
    } catch (err) {
      console.error('Error en updateStatus:', err)
      setError('Error al actualizar estado')
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('¿Eliminar este evento?')) return

    try {
      const { error } = await supabase
        .from('production_events')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error al eliminar evento:', error)
        setError('Error al eliminar evento')
        return
      }

      await loadEvents()
    } catch (err) {
      console.error('Error en deleteEvent:', err)
      setError('Error al eliminar evento')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Producción</h1>
          <p className="text-gray-500 mt-1">Gestiona tus eventos de fabricación e instalación</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Nuevo Evento
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nuevo Evento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Título del Evento</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej. Fabricación Screen S001"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cliente</label>
                <input
                  type="text"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="Nombre del cliente"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                >
                  <option value="scheduled">Programado</option>
                  <option value="in_progress">En Proceso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Detalles adicionales..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all resize-none h-24"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Evento'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No hay eventos programados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const config = statusConfig[event.status]
            const StatusIcon = config.icon
            return (
              <div key={event.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Cliente: {event.client_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.start_date).toLocaleDateString('es-PR')} - {new Date(event.end_date).toLocaleDateString('es-PR')}
                    </p>
                    {event.notes && <p className="text-sm text-gray-600 mt-2 italic">{event.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={event.status}
                      onChange={(e) => updateStatus(event.id, e.target.value as any)}
                      className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-50 outline-none transition-all"
                    >
                      <option value="scheduled">Programado</option>
                      <option value="in_progress">En Proceso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
